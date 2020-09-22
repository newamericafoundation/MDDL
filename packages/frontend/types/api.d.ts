import { ApiService } from '@/plugins/api-accessor'

declare module 'vue/types/vue' {
  interface Vue {
    $api: typeof ApiService
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $api: typeof ApiService
  }
}
