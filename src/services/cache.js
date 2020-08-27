import Cache from '../utils/cache'

// 缓存键前缀
export const CACHE_KEY_PREFIX = 'API_CACHE'

// 缓存配置
export const CACHE_CONFIG = {
  keyPrefix: CACHE_KEY_PREFIX, // 缓存key前缀,最终key：[keyPrefix]_[key]
  timeout: 5 * 60 * 1000, // 默认缓存5分钟
  storage: true, // 是否开启本地缓存
}

const cache = new Cache(CACHE_CONFIG)

/**
 * 根据请求信息生成缓存key
 * @param {Object} config 请求配置
 * @returns
 */
export const generateCacheKeyFromConfig = config => {
  const { url, method, params, data, cache } = config
  return `${url}-${method}-${JSON.stringify(params)}-${JSON.stringify(
    data
  )}-${cache && cache.promise}`
}

export default cache
