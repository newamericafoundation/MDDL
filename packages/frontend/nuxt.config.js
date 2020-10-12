import messages from './locales/messages.ts'

export default {
  ssr: false,
  target: 'static',
  head: {
    titleTemplate: '%s - Homeless Data Locker',
    meta: [
      {
        charset: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
    ],
  },
  css: [],
  plugins: [
    '@/plugins/axios-interceptors.ts',
    '@/plugins/api-accessor.ts',
    '@plugins/store-accessor.ts',
  ],
  components: true,
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/vuetify', '@nuxtjs/dotenv'],
  modules: ['@nuxtjs/axios', '@nuxtjs/pwa', 'nuxt-i18n'],

  i18n: {
    locales: ['en', 'fr', 'es'],
    defaultLocale: 'en',
    vueI18n: {
      fallbackLocale: 'en',
      messages,
    },
  },
  axios: {},
  vuetify: {
    optionsPath: './vuetify.options.ts',
  },
  build: {
    extractCSS: true,
  },
  env: {
    apiUrl: process.env.API_URL || 'http://localhost:8080/',
    debugToken: process.env.DEBUG_TOKEN,
    buildNumber: process.env.CODEBUILD_BUILD_NUMBER,
    buildTime: process.env.CODEBUILD_START_TIME,
  },
  generate: {
    dir: 'dist/' + process.env.OUTPUT_DIR,
  },
  router: {
    middleware: 'auth',
  },
}
