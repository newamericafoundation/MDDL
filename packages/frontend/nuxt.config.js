import messages from './assets/js/messages.ts'

const config = {
  ssr: false,
  target: 'static',
  head: {
    title: 'Loading...',
    titleTemplate: '%s | Datalocker',
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
  css: ['@/assets/scss/main.scss'],
  styleResources: {
    scss: [
      '@/assets/scss/_colors.scss',
      '@/assets/scss/_variables.scss',
      '@/assets/scss/_helpers.scss',
    ],
  },
  plugins: ['@/plugins/vee-validate.js'],
  components: true,
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify',
    '@nuxtjs/dotenv',
    '@nuxtjs/google-fonts',
    '@nuxtjs/google-analytics',
    '@nuxtjs/pwa',
  ],
  modules: [
    '@nuxtjs/style-resources',
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/pwa',
    'nuxt-i18n',
    '@nuxtjs/gtm',
  ],
  pwa: {
    // TODO: other PWA features like icon and colour scheme
    manifest: {
      name: 'Datalocker',
      short_name: 'Datalocker',
      useWebmanifestExtension: true,
      display: 'fullscreen',
    },
  },
  i18n: {
    locales: ['en', 'test'],
    defaultLocale: 'en',
    vueI18n: {
      fallbackLocale: 'en',
      messages,
    },
    strategy: 'no_prefix',
  },
  googleFonts: {
    families: {
      'Noto Sans': [300, 400, 500, 600, 700],
    },
  },
  googleAnalytics: {
    id: process.env.GOOGLE_ANALYTICS_TRACKING_ID,
  },
  // TODO: disabled until GTM is configured
  // gtm: {
  //   id: process.env.GTM_ID,
  //   pageTracking: true,
  //   pageViewEventName: 'navigation',
  //   enabled: true,
  // },
  vuetify: {
    treeShake: true,
    customVariables: ['@/assets/scss/_vuetifyVariables.scss'],
    optionsPath: './vuetify.options.ts',
  },
  publicRuntimeConfig: {
    agencyEmailDomainsWhitelist: process.env.AGENCY_EMAIL_DOMAINS_WHITELIST,
    authorizationEndpoint: process.env.AUTH_URL + '/login',
    buildNumber: process.env.BUILD_NUMBER,
    buildTime: process.env.CODEBUILD_START_TIME,
    googleAnalytics: {
      id: process.env.GOOGLE_ANALYTICS_TRACKING_ID,
    },
    showBuildInfo: process.env.SHOW_BUILD_INFO,
  },
  build: {
    // TODO: disabled due to issues with hot reloading
    //   extractCSS: true,
    transpile: ['vee-validate/dist/rules'],
  },
  generate: {
    dir: 'dist/' + process.env.OUTPUT_DIR,
  },
  /*
   ** Enforce auth for all routes
   ** Can be disabled by adding property `auth: false` to your page component
   */
  router: {
    middleware: ['auth', 'default'],
    extendRoutes(routes, resolve) {
      if (process.env.NODE_ENV === 'development') {
        routes.push({
          name: 'debug',
          path: '/debug',
          component: resolve(__dirname, 'components/DebugMenu/DebugMenu.vue'),
        })
      }
    },
  },
  /*
   ** Auth Config
   ** See https://auth.nuxtjs.org/schemes/oauth2.html#usage
   */
  auth: {
    strategies: {
      oauth2: {
        _scheme: 'oauth2',
        audience: process.env.API_URL,
        codeChallengeMethod: 'S256',
        authorization_endpoint: process.env.AUTH_URL + '/login',
        userinfo_endpoint: process.env.AUTH_URL + '/oauth2/userInfo',
        scope: ['openid', 'profile', 'email'],
        client_id: process.env.AUTH_CLIENT_ID,
        token_type: 'Bearer',
        token_key: 'access_token',
        response_type: 'token',
      },
      local: false,
    },
    redirect: {
      callback: '/authorize',
    },
    plugins: ['@plugins/store-accessor.ts', '@/plugins/api-accessor.ts'],
  },
}

if (process.env.MOBILE_TESTING === '1') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require('path')
  Object.assign(config, {
    server: {
      port: 3000,
      host: '0.0.0.0',
      timing: false,
      https: {
        key: fs.readFileSync(path.resolve(__dirname, 'local/localhost.key')),
        cert: fs.readFileSync(path.resolve(__dirname, 'local/localhost.crt')),
      },
    },
  })
}

export default config
