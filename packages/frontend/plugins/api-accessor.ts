import Vue from 'vue'
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import { NuxtAxiosInstance } from '@nuxtjs/axios'
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import { DocumentApi, AgencyApi, UserApi, Configuration } from 'api-client'

const initialisedAPIs = {
  document: null as DocumentApi | null,
  user: null as UserApi | null,
  agency: null as AgencyApi | null,
}

export class ApiService {
  private axios: NuxtAxiosInstance
  private config: Configuration

  constructor(axiosInstance: NuxtAxiosInstance) {
    this.axios = axiosInstance
    this.config = {
      basePath: process.env.apiUrl,
      // TODO: add access token
      // accessToken: '',
    }
  }

  get document() {
    if (initialisedAPIs.document === null) {
      initialisedAPIs.document = new DocumentApi(
        this.config,
        process.env.apiUrl,
        this.axios
      )
    }
    return initialisedAPIs.document
  }

  get user() {
    if (initialisedAPIs.user === null) {
      initialisedAPIs.user = new UserApi(
        this.config,
        process.env.apiUrl,
        this.axios
      )
    }
    return initialisedAPIs.user
  }

  get agency() {
    if (initialisedAPIs.agency === null) {
      initialisedAPIs.agency = new AgencyApi(
        this.config,
        process.env.apiUrl,
        this.axios
      )
    }
    return initialisedAPIs.agency
  }
}

export default ({ $axios }: { $axios: NuxtAxiosInstance }) => {
  const apiService = new ApiService($axios)
  Vue.prototype.$api = apiService
  ;(Vue as any).$api = apiService
}
