import { ApiService } from '@/plugins/api-accessor'
import { Store } from 'vuex'
import VueRouter, { Route } from 'vue-router'
import { Auth } from 'nuxtjs__auth'
import VueAnalytics from 'vue-analytics'
import VueI18n, { IVueI18n } from 'vue-i18n'
import { Context } from '@nuxt/types'
// eslint-disable-next-line import/named
import { NuxtVueI18n } from 'nuxt-i18n'

declare module 'vue/types/vue' {
  interface Vue extends NuxtVueI18n.Options.NuxtI18nInterface {
    $api: ApiService
    $store: Store<any>
    $router: VueRouter
    $route: Route
    $auth: Auth
    $gtm: {
      push(options: {
        event: string
        [attribute: string]: string
      }): Promise<void>
    }
    $ga: VueAnalytics
    readonly $i18n: VueI18n & IVueI18n
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $api: ApiService
  }
}

declare module 'vuex-module-decorators' {
  interface VuexModule {
    $ga: VueAnalytics
  }
}
