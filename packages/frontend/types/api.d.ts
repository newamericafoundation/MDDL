// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import { ApiService } from '@/plugins/api-accessor'

declare module 'vue/types/vue' {
  interface Vue {
    $api: ApiService
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $api: ApiService
  }
}
