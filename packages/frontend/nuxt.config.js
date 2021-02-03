import CspHtmlWebpackPlugin from 'csp-html-webpack-plugin'
import cheerio from 'cheerio'
import { CspEnum } from './types/environment'
import messages from './assets/js/messages.ts'
import { envConfig } from './plugins/env-config.ts'
import { getSrc } from './assets/js/csp.ts'

const config = {
  ssr: false,
  target: 'static',
  head: {
    title: 'Loading...',
    titleTemplate: '%s | My Digital Data Locker',
    meta: [
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
  plugins: [
    '@/plugins/vee-validate.js',
    // consider re-enabling when https://github.com/vue-a11y/vue-axe/issues/32 is resolved
    // {
    //   src: '@/plugins/axe.ts',
    //   mode: 'client',
    // },
  ],
  components: true,
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify',
    '@nuxtjs/dotenv',
    '@nuxtjs/google-analytics',
    '@nuxtjs/pwa',
  ],
  modules: [
    '@nuxtjs/style-resources',
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/pwa',
    'nuxt-i18n',
    '@nuxtjs/sentry',
  ],
  pwa: {
    // TODO: other PWA features like icon and colour scheme
    manifest: {
      name: 'My Digital Data Locker',
      short_name: 'My Digital Data Locker',
      useWebmanifestExtension: true,
      display: 'fullscreen',
    },
    icon: {
      sizes: [64, 120, 144, 152, 192, 384, 512],
    },
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
    vueI18n: {
      fallbackLocale: 'en',
      messages,
    },
    strategy: 'no_prefix',
  },
  vuetify: {
    treeShake: true,
    defaultAssets: false,
    customVariables: ['@/assets/scss/_vuetifyVariables.scss'],
    optionsPath: './vuetify.options.ts',
  },
  publicRuntimeConfig: envConfig,

  build: {
    transpile: ['vee-validate/dist/rules'],
    extractCSS: {
      ignoreOrder: true,
      filename: '[contenthash].css',
      chunkFilename: '[contenthash].css',
    },
    extend(config, { isClient }) {
      // Extend only webpack config for client-bundle
      if (isClient) {
        config.devtool = 'inline-source-map' // prevents eval() execution - see: https://github.com/webpack/webpack/issues/5627#issuecomment-374386048
      }
      config.module.rules.push({
        test: /\.md$/,
        loader: 'raw-loader',
        options: {},
      })
    },
    plugins: [
      new CspHtmlWebpackPlugin(
        {
          'default-src': ["'self'"],
          'base-uri': ["'self'"],
          'img-src': getSrc(CspEnum.IMAGE, process.env.CSP_IMG_SRC),
          'worker-src': ["'self'"],
          'style-src': ["'self'"],
          'script-src': getSrc(CspEnum.SCRIPT, process.env.CSP_SCRIPT_SRC),
          'connect-src': getSrc(CspEnum.CONNECT, process.env.CSP_CONNECT_SRC),
          'frame-src': getSrc(CspEnum.FRAME, process.env.CSP_FRAME_SRC),
          'form-action': ["'self'"],
          'object-src': ["'none'"],
        },
        {
          enabled: true,
          hashingMethod: 'sha256',
          hashEnabled: {
            'script-src': false,
            'style-src': false,
          },
          nonceEnabled: {
            'script-src': true,
            'style-src': true,
          },
          processFn: (builtPolicy, htmlPluginData, $) => {
            // this function was adapted from https://github.com/slackhq/csp-html-webpack-plugin/blob/master/plugin.js
            // to prepend charset since charset must be in first 1024 bytes on firefox
            let metaTag = $('meta[http-equiv="Content-Security-Policy"]')
            // Add element if it doesn't exist.
            if (!metaTag.length) {
              metaTag = cheerio.load(
                '<meta http-equiv="Content-Security-Policy">',
              )('meta')
              metaTag.prependTo($('head'))
            }
            // build the policy into the context attr of the csp meta tag
            metaTag.attr('content', builtPolicy)
            const charset = cheerio.load('<meta charset="utf-8">')('meta')
            charset.prependTo($('head'))
            // eslint-disable-next-line no-param-reassign
            htmlPluginData.html = $.html()
          },
        },
      ),
    ],
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
        authorization_endpoint: process.env.AUTH_URL,
        userinfo_endpoint: false,
        scope: (process.env.AUTH_SCOPES || '').split(','),
        client_id: process.env.AUTH_CLIENT_ID,
        token_type: 'Bearer',
        token_key: 'access_token',
        response_type: 'token',
      },
      local: false,
    },
    redirect: {
      callback: '/authorize',
      logout: process.env.AUTH_LOGOUT_URL,
    },
    plugins: [
      '@plugins/store-accessor.ts',
      '@/plugins/api-accessor.ts',
      '@/plugins/env-config.ts',
      '@/plugins/showdown.ts',
    ],
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

if (process.env.GOOGLE_ANALYTICS_TRACKING_ID) {
  Object.assign(config, {
    googleAnalytics: {
      id: process.env.GOOGLE_ANALYTICS_TRACKING_ID,
    },
  })
}

if (process.env.SENTRY_DSN) {
  Object.assign(config, {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      config: {
        environment: process.env.BUILD_ENVIRONMENT,
      },
    },
  })
}

export default config
