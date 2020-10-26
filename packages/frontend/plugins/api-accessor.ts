import { NuxtAxiosInstance } from '@nuxtjs/axios'
import { DocumentApi, UserApi, CollectionsApi, Configuration } from 'api-client'

const initialisedAPIs = {
  document: null as DocumentApi | null,
  user: null as UserApi | null,
  collection: null as CollectionsApi | null,
}

export class ApiService {
  private axios: NuxtAxiosInstance
  private config: Configuration

  constructor(axiosInstance: NuxtAxiosInstance) {
    this.axios = axiosInstance
    this.config = {
      basePath: process.env.API_URL,
      // TODO: add access token
      // accessToken: '',
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
}

// eslint-disable-next-line import/no-mutable-exports
export let api: ApiService

export default (
  { $axios }: { $axios: NuxtAxiosInstance },
  inject: (s: string, o: any) => void,
) => {
  api = new ApiService($axios)
  inject('api', api)
}
