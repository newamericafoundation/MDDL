import { NuxtAxiosInstance } from '@nuxtjs/axios'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

export default ({ $axios }: { $axios: NuxtAxiosInstance }) => {
  // TODO: handle token expiry
  // const unauthorizedResponseInterceptor = (res: Response) => {
  //   if (res.status === 401) {
  //   }
  //   return res
  // }
  // $axios.interceptors.response.use(unauthorizedResponseInterceptor)

  const authTokenInterceptor = (config: AxiosRequestConfig) => {
    if (process.env.debugToken) {
      // TODO: remove me once we have proper auth implemented
      config.headers.Authorization = process.env.debugToken
    } else {
      // TODO: attach the real token to request
    }
    return config
  }

  $axios.interceptors.request.use(authTokenInterceptor)
}
