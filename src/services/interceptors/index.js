import cacheInterceptor from './cacheInterceptor'
import errorMessageInterceptor from './errorMessageInterceptor'
import globalLoadingInterceptor from './globalLoadingInterceptor'

export { cacheInterceptor, errorMessageInterceptor, globalLoadingInterceptor }

export default [
  ...cacheInterceptor,
  ...errorMessageInterceptor,
  ...globalLoadingInterceptor,
]
