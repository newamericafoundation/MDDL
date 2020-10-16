import '../.nuxt-storybook/storybook/preview.js'
import { addDecorator } from '@storybook/vue'
import Vue from 'vue'
import Vuex from 'vuex'
import { withKnobs, select, boolean } from '@storybook/addon-knobs'
import VueI18n from 'vue-i18n'
import Vuetify, { VSnackbar } from 'vuetify/lib'
import 'vuetify/dist/vuetify.min.css'
import colors from 'vuetify/es5/util/colors'
import { withContexts } from '@storybook/addon-contexts/vue'
import messages from '@/locales/messages'
import VueRouter from 'vue-router'

Vue.use(Vuex)

addDecorator(withKnobs)

// Little hack to suppress errors when addon-contexts needs to serialise Vue instance
Vue.prototype.toJSON = function () {
  return this
}

Vue.use(Vuetify, {
  components: {
    VSnackbar,
  },
})

const vuetify = new Vuetify({
  customVariables: ['@/assets/scss/vuetifyVariables.scss'],
  theme: {
    dark: true,
    themes: {
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
  lang: {
    t: (key, ...params) => i18n.t(key, params),
  },
  icons: {
    iconfont: 'mdiSvg',
  },
})

const vuetifyDecorator = () => ({
  vuetify,
  template: '<v-app><story/></v-app>',
  props: {
    vuetifyDark: {
      type: Boolean,
      default: boolean('Vuetify Dark theme', true),
    },
  },
  watch: {
    vuetifyDark: {
      handler() {
        this.$vuetify.theme.dark = this.vuetifyDark
      },
      immediate: true,
    },
  },
})

addDecorator(vuetifyDecorator)

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'es',
  locales: ['en', 'es', 'fr'],
  messages,
})

// i18n._dataListeners = new Proxy([], {
//   push: (item) => {
//     console.log('pushing', item, 'to', i18n)
//     item._renderProxy._i18n = null
//   }
// })
// Object.assign({}, context, { hooks: null });

const i18nDecorator = () => ({
  i18n,
  template: `<story />`,
  props: {
    storybookLocale: {
      type: String,
      default: select('locale', ['en', 'es', 'fr'], 'es'),
    },
  },
  watch: {
    storybookLocale: {
      handler() {
        this.$i18n.locale = this.storybookLocale
      },
      immediate: true,
    },
  },
})

addDecorator(i18nDecorator)

const localeContext = {
  i18n,
  name: 'VueI18nProvider',
  template: '<div><slot /></div>',
  // props: ['locale'],
  // watch: {
  //   locale: (newValue) => {
  //     this.$i18n.locale = newValue
  //   },
  // },
  beforeCreate() {
    this.$root._i18n = this.$i18n
  },
}
const topLevelContexts = [
  {
    icon: 'globe',
    title: 'Locale',
    components: [localeContext],
    // params: [
    //   {
    //     name: 'English',
    //     props: {
    //       locale: 'en',
    //     },
    //     default: true,
    //   },
    //   {
    //     name: 'French',
    //     props: {
    //       locale: 'fr',
    //     },
    //   },
    // ],
  },
]
addDecorator(withContexts(topLevelContexts))
