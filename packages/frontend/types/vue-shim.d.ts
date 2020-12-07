import { ApiService } from '@/plugins/api-accessor'
import { Store } from 'vuex'
import VueRouter, { Route } from 'vue-router'
import { Auth } from 'nuxtjs__auth'
import VueAnalytics from 'vue-analytics'
import VueI18n, { IVueI18n } from 'vue-i18n'
// eslint-disable-next-line import/named
import { NuxtVueI18n } from 'nuxt-i18n'
import { $content } from '@nuxt/content'

declare module 'vue/types/vue' {
  interface Vue extends NuxtVueI18n.Options.NuxtI18nInterface {
    $api: ApiService
    $auth: Auth
    $content: typeof $content
    $ga: VueAnalytics
    $gtm: {
      push(options: {
        event: string
        [attribute: string]: string
      }): Promise<void>
    }
    readonly $i18n: VueI18n & IVueI18n
    $route: Route
    $router: VueRouter
    $store: Store<any>
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
