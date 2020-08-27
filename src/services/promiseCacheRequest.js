import cache, { generateCacheKeyFromConfig } from './cache'
import { isGetRequest, isCachePromise } from './utils'

export default (config, request) => {
  if (isGetRequest(config) && isCachePromise(config)) {
    // 判断缓存数据是否存在 存在的话 是否过期 没过期就返回
    const cacheKey = generateCacheKeyFromConfig(config)
    const cacheItem = cache.get(cacheKey)
    // 如果有缓存，并且没有超时，则直接返回数据
    if (cacheItem) {
      const { data: requestPromise, expireTime } = cacheItem
      const currentTime = Date.now()
      if (currentTime - expireTime < (config.timeout || cache.config.timeout)) {
        return requestPromise
      }
    }

    // 恢复原始请求并且缓存Promise
    config.cache.promise = false
    const requestPromise = request(config)
    cache.set(cacheKey, requestPromise)

    return requestPromise
  }

  return request(config)
}
