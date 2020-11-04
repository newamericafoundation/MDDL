import { Context } from '@nuxt/types'
// eslint-disable-next-line import/named
import { Options } from '@nuxtjs/vuetify'
import colors from 'vuetify/es5/util/colors'

import Agency from '@/components/icons/agency.vue'
import Alert from '@/components/icons/alert.vue'
import ChevronLeft from '@/components/icons/chevron-left.vue'
import Close from '@/components/icons/close.vue'
import CloseCircleOutline from '@/components/icons/close-circle-outline.vue'
import Delete from '@/components/icons/delete.vue'
import Document from '@/components/icons/document.vue'
import DotsHorizontal from '@/components/icons/dots-horizontal.vue'
import Download from '@/components/icons/download.vue'
import Folder from '@/components/icons/folder.vue'
import HomeOutline from '@/components/icons/home-outline.vue'
import Menu from '@/components/icons/menu.vue'
import Pencil from '@/components/icons/pencil.vue'
import Plus from '@/components/icons/plus.vue'
import Profile from '@/components/icons/profile.vue'
import Send from '@/components/icons/send.vue'

const vuetifyOptions = (ctx: Context): Options => {
  return {
    treeShake: true,
    theme: {
      dark: false,
      disable: false,
      default: false,
      options: {},
      themes: {
        light: {
          primary: '#2157e4',
          accent: colors.blueGrey.darken3,
          secondary: colors.pink.darken1,
          info: colors.blue.lighten2,
          warning: colors.amber.base,
          error: '#ff5c62',
          success: '#2affb8',
        },
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
    icons: {
      iconfont: 'mdi',
      values: {
        alert: {
          component: Alert,
        },
        agency: {
          component: Agency,
        },
        'chevron-left': {
          component: ChevronLeft,
        },
        close: {
          component: Close,
        },
        'close-circle-outline': {
          component: CloseCircleOutline,
        },
        delete: {
          component: Delete,
        },
        document: {
          component: Document,
        },
        'dots-horizontal': {
          component: DotsHorizontal,
        },
        download: {
          component: Download,
        },
        folder: {
          component: Folder,
        },
        'home-outline': {
          component: HomeOutline,
        },
        menu: {
          component: Menu,
        },
        pencil: {
          component: Pencil,
        },
        plus: {
          component: Plus,
        },
        profile: {
          component: Profile,
        },
        send: {
          component: Send,
        },
      },
    },
    lang: {
      locales: {},
      current: '',
      t: (key, ...params) => ctx.app.i18n.t(key, params) as string,
    },
  }
}

export default vuetifyOptions
