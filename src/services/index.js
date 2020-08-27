import axios from 'axios'
import { default as defaultConfig } from './config'
import { default as defaultInterceptors } from './interceptors'
import promiseCacheRequest from './promiseCacheRequest'

export default class Service {
  // 拦截器类型列表
  static INTERCEPTOR_TYPE_LIST = ['request', 'response']

  static INTERCEPTOR_ENFORCE_WEIGHT_MAP = { pre: -1, normal: 0, post: 1 } // 拦截器enforce属性权重，值越小执行顺序越靠前

  // 通过use注册的拦截器
  static registeredInterceptors = []

  constructor({ config = {}, interceptors = [] } = {}) {
    this.config = this.getConfig(config)

    this.interceptors = this.getInterceptors(interceptors)

    this.axiosInstance = this.init()

    this.applyAllInterceptors()

    this.overrideMethods()
  }

  /**
   * 重写request方法
   * @param {Object} config 请求配置对象
   * @returns
   * @memberof Service
   */
  overrideRequest(config) {
    return promiseCacheRequest(config, this.axiosInstance.request)
  }

  /**
   * 复写axiosInstance请求方法
   * @memberof Service
   */
  overrideMethods() {
    const methodList = [
      'request',
      'get',
      'delete',
      'head',
      'options',
      'post',
      'put',
      'patch',
      'getUri',
    ]

    methodList.forEach(method => {
      this[method] = (...params) => {
        let url, data, config
        switch (method) {
          case 'get':
          case 'delete':
          case 'head':
          case 'options':
            ;[url, config] = params || []
            break
          case 'post':
          case 'put':
          case 'patch':
            ;[url, data, config] = params || []
            break
          case 'request':
          case 'getUri':
          default:
            ;[config] = params
            break
        }

        return this.overrideRequest({
          method,
          url,
          data,
          ...config,
        })
      }
    })
  }

  // 初始化axios实例
  init() {
    const axiosInstance = axios.create(this.config)
    return axiosInstance
  }

  /**
   * 获取配置对象
   * @param {Object} config 传入配置对象
   * @returns {Object} 最终配置对象
   * @memberof Service
   */
  getConfig(config = {}) {
    return Object.assign({}, defaultConfig, config)
  }

  /**
   * 获取拦截器
   * @param {Array} interceptors 拦截器列表
   * @returns {Array} 最终拦截器列表
   * @memberof Service
   */
  getInterceptors(interceptors = []) {
    const allInterceptors = [
      ...defaultInterceptors,
      ...Service.registeredInterceptors,
      ...interceptors,
    ]

    const sortInterceptors = this.sortInterceptors(allInterceptors)

    return sortInterceptors
  }

  /**
   * 对拦截器根据enforce属性排序
   * @param {Array} interceptors
   * @memberof Service
   */
  sortInterceptors(interceptors) {
    if (!(interceptors && interceptors.length)) {
      return []
    }
    return interceptors.sort((a, b) => {
      const { enforce: aEnforce = 'normal' } = a
      const { enforce: bEnforce = 'normal' } = b

      const normalWeight = Service.INTERCEPTOR_ENFORCE_WEIGHT_MAP['normal']
      const aEnforceWeight =
        Service.INTERCEPTOR_ENFORCE_WEIGHT_MAP[aEnforce] || normalWeight
      const bEnforceWeight =
        Service.INTERCEPTOR_ENFORCE_WEIGHT_MAP[bEnforce] || normalWeight

      return aEnforceWeight - bEnforceWeight
    })
  }

  /**
   * 应用拦截器
   * @param {Object} interceptor 拦截器
   * @param {boolean} isTail 拦截器是否处于尾部
   * @memberof Service
   */
  applyInterceptor(interceptor, isTail) {
    const { type, onFulfilled, onRejected } = interceptor

    if (this.validateInterceptorType(type)) {
      this.axiosInstance.interceptors[type].use(
        val => onFulfilled(val, isTail),
        error => onRejected(error, isTail)
      )
    }
  }

  /**
   * 注册拦截器
   * @param {Object} interceptor
   * @param {string} interceptor.type 拦截器类型 ['request'|'response']
   * @param {string} interceptor.enforce 拦截器enforce顺序 ['pre'|'normal'|'post'],默认normal
   * @param {Function} interceptor.onFulfilled 拦截器成功回调
   * @param {Function} interceptor.onRejected 拦截器失败回调
   * @memberof Service
   */
  use(interceptor, config = { pre: false }) {
    if (config.pre) {
      Service.defaultInterceptors.unshift(interceptor)
    } else {
      Service.defaultInterceptors.push(interceptor)
    }
  }

  /**
   * 取消拦截器
   * @param {string} type 拦截器类型
   * @param {number} id 拦截器id
   * @memberof Service
   */
  ejectInterceptor(type, id) {
    if (this.validateInterceptorType(type)) {
      this.axiosInstance.interceptors.request.eject(id)
    }
  }

  /**
   * 验证拦截器类型
   * @param {string} type 拦截器类型
   * @returns {boolean} 是否是合法的拦截器
   * @memberof Service
   */
  validateInterceptorType(type) {
    if (!Service.INTERCEPTOR_TYPE_LIST.includes(type)) {
      throw new Error('未知拦截器类型')
    }
    return true
  }

  // 应用所有拦截器
  applyAllInterceptors() {
    try {
      if (!(this.interceptors && this.interceptors.length)) {
        return
      }
      this.interceptors.map((interceptor, index) => {
        const isTail = index === this.interceptors.length - 1
        this.applyInterceptor(interceptor, isTail)
      })
    } catch (error) {
      console.log(error)
    }
  }
}
