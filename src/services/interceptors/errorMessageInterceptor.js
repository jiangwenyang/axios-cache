import { Message } from 'element-ui'

// 请求错误提示信息拦截器
export default [
  {
    name: 'errorMessageInterceptor',

    type: 'response',

    onFulfilled: response => response,

    onRejected: err => {
      Message({
        message: '请求失败，请重试',
        type: 'error',
        duration: 5 * 1000,
      })
      return Promise.reject(err)
    },
  },
]
