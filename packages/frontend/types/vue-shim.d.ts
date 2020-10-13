import { ApiService } from '@/plugins/api-accessor'
import { Store } from 'vuex'
import VueRouter, { Route } from 'vue-router'
import { Auth } from 'nuxtjs__auth'

declare module 'vue/types/vue' {
  interface Vue {
    $api: ApiService
    $store: Store<any>
    $router: VueRouter
    $route: Route
    $auth: Auth
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $api: ApiService
  }
}
