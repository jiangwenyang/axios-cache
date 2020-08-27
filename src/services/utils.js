/**
 * 是否是数据缓存
 * @param {Object} config
 */
const isCache = config => config.cache

/**
 * 是否是Promise缓存
 * @param {Object} config
 */
const isCachePromise = config => isCache(config) && config.cache.promise

/**
 * 是否是GET请求
 * @param {Object} config
 */
const isGetRequest = config => config.method === 'get'

export { isCache, isGetRequest, isCachePromise }
