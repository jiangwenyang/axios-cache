import { setStorage, getStorage, removeStorage } from './storage'

/**
 * 获取超时时间
 * @param {number} timeout 超时周期
 * @returns {number} 超时时间
 */
const getExpireTime = timeout => {
  const currentTime = Date.now()
  return currentTime + timeout
}

export default class Cache {
  constructor(config) {
    const defaultConfig = {
      keyPrefix: 'CACHE', // 缓存key前缀，用于区分是否是cache
      timeout: 5 * 60 * 1000, // 默认缓存5分钟
      storage: false, // 是否开启localStorage缓存
    }

    this.CACHE_MAP = {} // 缓存映射

    this.config = {
      ...defaultConfig,
      ...(config || {}),
    }

    if (this.config.storage) {
      // 如果开启了本地存储，则将本地存储提取到storage中
      this.mapStorageToCaches()
    }
  }

  /**
   * 获取添加前缀后的key
   * @param {string} key 传入的key值
   * @returns
   * @memberof Cache
   */
  getKey(key) {
    return `${this.config.keyPrefix}-${key}`
  }

  /**
   * 获取缓存映射值，如果开启了本地存储，则在未命中缓存时尝试从本地存储取值
   * @param {string} key 传入的key值
   * @param {Object} config 配置对象
   * @param {boolean} config.storage 是否开启本地存储
   * @returns
   * @memberof Cache
   */
  get(key, config = {}) {
    key = this.getKey(key)

    const cacheItem = this.CACHE_MAP[key]
    if (cacheItem) {
      return cacheItem
    }

    if (config.storage && this.config.storage) {
      return getStorage(key)
    }
  }

  /**
   * 添加缓存映射，如果开启了本地存储，则同步存储到本地缓存中
   * @param {string} key 传入的key值
   * @param {any} value 缓存值
   * @param {Object} config 配置对象
   * @param {boolean} config.storage 是否开启本地存储
   * @returns
   * @memberof Cache
   */
  set(key, value, config = {}) {
    key = this.getKey(key)

    let data = {
      expireTime: getExpireTime(config.timeout || this.config.timeout),
      data: value,
    }

    this.CACHE_MAP[key] = data

    if (config.storage && this.config.storage) {
      setStorage(key, data)
    }
  }

  /**
   * 移除缓存映射，如果开启了本地存储，则同步移除本地存储中的值
   * @param {string} key 传入的key值
   * @param {Object} config 配置对象
   * @param {boolean} config.storage 是否开启本地存储
   * @returns
   * @memberof Cache
   */
  remove(key, config = {}) {
    key = this.getKey(key)

    delete this.CACHE_MAP[key]
    if (config.storage && this.config.storage) {
      removeStorage(key)
    }
  }

  /**
   * 清空缓存映射，如果开启了本地存储，则同步清空本地存储中的值
   * @param {Object} config 配置对象
   * @param {boolean} config.storage 是否开启本地存储
   * @memberof Cache
   */
  clear(config) {
    const keys = Object.keys(this.CACHE_MAP)
    this.CACHE_MAP = {}

    if (config.storage && this.config.storage) {
      keys.map(key => {
        removeStorage(key)
      })
    }
  }

  /**
   * 判断是否是缓存key
   * @param {string} key
   * @returns
   * @memberof Cache
   */
  isCacheKey(key) {
    return key.startsWith(this.config.keyPrefix)
  }

  /**
   * 将本地缓存映射到缓存表中
   * @memberof Cache
   */
  mapStorageToCaches() {
    Object.entries(localStorage).map(entry => {
      const [key, value] = entry
      if (this.isCacheKey(key)) {
        this.CACHE_MAP[key] = JSON.parse(value)
      }
    })
  }
}
