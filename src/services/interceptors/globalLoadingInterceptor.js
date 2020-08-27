import { Loading } from 'element-ui'

let requestCount = 0
let loadingInstance

function addGlobalLoading(config) {
  if (!config || config.globalLoading === false) {
    return
  }
  requestCount++
  loadingInstance = Loading.service({
    background: 'rgba(0,0,0,0.4)',
  })
}

function closeGlobalLoading(config) {
  if (!config || config.globalLoading === false) {
    return
  }
  if (--requestCount < 1) {
    loadingInstance.close()
  }
}

// 全局加载指示器拦截器
export default [
  {
    name: 'globalLoadingInterceptor',
    type: 'request',
    onFulfilled: config => {
      addGlobalLoading(config)
      return config
    },
    onRejected: error => {
      return Promise.reject(error)
    },
  },
  {
    name: 'globalLoadingInterceptor',
    type: 'response',
    onFulfilled: (response, isTail) => {
      const { config } = response
      closeGlobalLoading(config)
      return isTail ? response.data : response
    },
    onRejected: err => {
      closeGlobalLoading(err.config)
      return Promise.reject(err)
    },
  },
]
