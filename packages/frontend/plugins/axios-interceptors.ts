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
}
