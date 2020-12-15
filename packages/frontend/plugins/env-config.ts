export const envConfig = {
  config: {
    agencyEmailDomainsWhitelist: process.env.AGENCY_EMAIL_DOMAINS_WHITELIST,
    authorizationEndpoint: process.env.AUTH_URL,
    buildNumber: process.env.BUILD_NUMBER,
    buildTime: process.env.CODEBUILD_START_TIME,
    googleAnalytics: {
      id: process.env.GOOGLE_ANALYTICS_TRACKING_ID,
    },
    showBuildInfo: process.env.SHOW_BUILD_INFO,
    authStrategy: 'oauth2',
    authTokenIdClaim: process.env.AUTH_TOKEN_ID_CLAIM || 'sub',
    footerLogo: process.env.FOOTER_LOGO,
    maxFileSize: 10000000,
  },
}
/**
 * Nuxt's default behaviour writes out environment variables to the window.__NUXT__
 * object via an inline <script> tag. As our CSP policy doesn't allow inline scripts,
 * and as Nuxt currently doesn't support appending nonce/hash to inline scripts
 * (see issue:  https://github.com/nuxt/nuxt.js/issues/6592), we instead write out
 * the config object via compiled code.
 */
if (typeof window !== 'undefined') {
  ;(<any>window).__NUXT__ = envConfig
}
