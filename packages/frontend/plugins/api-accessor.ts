import { NuxtAxiosInstance } from '@nuxtjs/axios'
import {
  DocumentApi,
  UserApi,
  CollectionsApi,
  Configuration,
  DelegateApi,
} from 'api-client'
import { AxiosResponse, AxiosError } from 'axios'
import { Auth } from '@nuxtjs/auth'
import VueRouter from 'vue-router'

const initialisedAPIs = {
  document: null as DocumentApi | null,
  user: null as UserApi | null,
  collection: null as CollectionsApi | null,
  delegate: null as DelegateApi | null,
}

export class ApiService {
  private axios: NuxtAxiosInstance
  private config: Configuration

  constructor(axiosInstance: NuxtAxiosInstance) {
    this.axios = axiosInstance
    this.config = {
      basePath: process.env.API_URL,
    }
  }

  get document(): DocumentApi {
    if (initialisedAPIs.document === null) {
      initialisedAPIs.document = new DocumentApi(
        this.config,
        process.env.API_URL,
        this.axios,
      )
    }
    return initialisedAPIs.document
  }

  get user(): UserApi {
    if (initialisedAPIs.user === null) {
      initialisedAPIs.user = new UserApi(
        this.config,
        process.env.API_URL,
        this.axios,
      )
    }
    return initialisedAPIs.user
  }

  get collection(): CollectionsApi {
    if (initialisedAPIs.collection === null) {
      initialisedAPIs.collection = new CollectionsApi(
        this.config,
        process.env.API_URL,
        this.axios,
      )
    }
    return initialisedAPIs.collection
  }

  get delegate(): DelegateApi {
    if (initialisedAPIs.delegate === null) {
      initialisedAPIs.delegate = new DelegateApi(
        this.config,
        process.env.API_URL,
        this.axios,
      )
    }
    return initialisedAPIs.delegate
  }
}

// eslint-disable-next-line import/no-mutable-exports
export let api: ApiService

export default async (
  {
    $axios,
    $auth,
  }: {
    $axios: NuxtAxiosInstance
    $auth: Auth
  },
  inject: (s: string, o: any) => void,
) => {
  await $axios.interceptors.response.use(
    (res: AxiosResponse) => {
      // happy response :)
      return res
    },
    (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        $auth.login()
      }
    },
  )
  api = new ApiService($axios)
  inject('api', api)
}
