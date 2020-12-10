import { Context } from '@nuxt/types'
// eslint-disable-next-line import/named
import { Options } from '@nuxtjs/vuetify'
import colors from 'vuetify/es5/util/colors'

import Agency from '@/components/icons/agency.vue'
import Alert from '@/components/icons/alert.vue'
import Arrow from '@/components/icons/arrow.vue'
import ChevronLeft from '@/components/icons/chevron-left.vue'
import Clock from '@/components/icons/clock.vue'
import Close from '@/components/icons/close.vue'
import CloseBold from '@/components/icons/close-bold.vue'
import CloseCircleOutline from '@/components/icons/close-circle-outline.vue'
import Cog from '@/components/icons/cog.vue'
import Delete from '@/components/icons/delete.vue'
import DeleteAlt from '@/components/icons/delete-alt.vue'
import Document from '@/components/icons/document.vue'
import DotsHorizontal from '@/components/icons/dots-horizontal.vue'
import Download from '@/components/icons/download.vue'
import Eye from '@/components/icons/eye.vue'
import File from '@/components/icons/file.vue'
import Folder from '@/components/icons/folder.vue'
import HomeOutline from '@/components/icons/home-outline.vue'
import Menu from '@/components/icons/menu.vue'
import Delegate from '@/components/icons/delegate.vue'
import Pencil from '@/components/icons/pencil.vue'
import Plus from '@/components/icons/plus.vue'
import Profile from '@/components/icons/profile.vue'
import Send from '@/components/icons/send.vue'
import SignOut from '@/components/icons/sign-out.vue'
import SwitchAccount from '@/components/icons/switch-account.vue'

const vuetifyOptions = (ctx: Context): Options => {
  return {
    theme: {
      dark: false,
      disable: true,
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
          'grey-2': '#f8f8f9',
          'grey-5': '#b4b8bf',
          'grey-7': '#6b6e76',
          'grey-8': '#55585e',
          'grey-9': '#2f3033',
          'blue-mid-light': '#f0f3f9',
          'blue-light': '#6489ec',
          'blue-super-light': '#fafcff',
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
    defaultAssets: false,
    icons: {
      iconfont: 'mdi',
      values: {
        agency: {
          component: Agency,
        },
        alert: {
          component: Alert,
        },
        'arrow-left': {
          component: Arrow,
        },
        'chevron-left': {
          component: ChevronLeft,
        },
        'chevron-right': {
          component: ChevronLeft,
          props: {
            rotation: 180,
          },
        },
        clock: {
          component: Clock,
        },
        close: {
          component: Close,
        },
        'close-bold': {
          component: CloseBold,
        },
        'close-circle-outline': {
          component: CloseCircleOutline,
        },
        cog: {
          component: Cog,
        },
        delete: {
          component: Delete,
        },
        deleteAlt: {
          component: DeleteAlt,
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
        eye: {
          component: Eye,
        },
        file: {
          component: File,
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
        delegate: {
          component: Delegate,
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
        'sign-out': {
          component: SignOut,
        },
        'switch-account': {
          component: SwitchAccount,
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
