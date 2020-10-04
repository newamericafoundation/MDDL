// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import { Context } from '@nuxt/types'
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, import/named
import { Options } from '@nuxtjs/vuetify'
import colors from 'vuetify/es5/util/colors'
const vuetifyOptions = (ctx: Context): Options => {
  return {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      disable: false,
      default: false,
      options: {},
      themes: {
        light: {
          primary: colors.teal.lighten2,
          accent: colors.blueGrey.darken3,
          secondary: colors.pink.darken1,
          info: colors.blue.lighten2,
          warning: colors.amber.base,
          error: colors.red.accent4,
          success: colors.green.accent3,
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
    lang: {
      locales: {},
      current: '',
      t: (key, ...params) => ctx.app.i18n.t(key, params) as string,
    },
  }
}

export default vuetifyOptions
