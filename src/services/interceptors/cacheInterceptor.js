import axios from 'axios'
import cache, { generateCacheKeyFromConfig } from '../cache'
import { isGetRequest, isCache } from '../utils'

// 缓存拦截器
export default [
  {
    name: 'cacheInterceptor',
    type: 'request',
    enforce: 'post', // 缓存拦截器放到最后
    onFulfilled: config => {
      if (isCache(config)) {
        let source = axios.CancelToken.source()
        config.cancelToken = source.token

        // 判断缓存数据是否存在 存在的话 是否过期 没过期就返回
        const cacheKey = generateCacheKeyFromConfig(config)
        const cacheItem = cache.get(cacheKey, { storage: config.cache.storage })

        // 如果有缓存，并且没有超时，则取消请求
        if (cacheItem) {
          const { data, expireTime } = cacheItem
          const currentTime = Date.now()
          if (
            currentTime - expireTime <
            (config.cache.timeout || cache.config.timeout)
          ) {
            source.cancel(data)
          } else {
            cache.remove(cacheKey, { storage: config.cache.storage })
          }
        }
      }

      return config
    },
    onRejected: error => {
      return Promise.reject(error)
    },
  },

  {
    name: 'cacheInterceptor',
    type: 'response',
    enforce: 'post', // 缓存拦截器放到最后
    onFulfilled: (response, isTail) => {
      if (isGetRequest(response.config) && isCache(response.config)) {
        const cacheKey = generateCacheKeyFromConfig(response.config)
        cache.set(cacheKey, response, {
          storage: response.config.cache.storage,
          timeout: response.config.cache.timeout,
        })
      }
      return isTail ? response.data : response
    },
    onRejected: (error, isTail) => {
      // 返回缓存数据
      if (axios.isCancel(error)) {
        return Promise.resolve(isTail ? error.message.data : error.message)
      }
      return Promise.reject(error)
    },
  },
]
