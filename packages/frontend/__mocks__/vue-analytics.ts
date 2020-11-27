import VueAnalytics from 'vue-analytics'

/* eslint-disable @typescript-eslint/no-empty-function */

// Note: this is not how you are supposed to mock GA but
//       it works for now
const createMockGa = () =>
  ({
    event: jest.fn(),
    install: () => {},
    analyticsMiddleware: (_) => {},
    onAnalyticsReady: () => Promise.resolve(),
    ecommerce: {
      addItem: () => {},
      addTransaction: () => {},
      addProduct: () => {},
      addImpression: () => {},
      setAction: () => {},
      addPromo: () => {},
      send: () => {},
    },
    set: () => {},
    page: () => {},
    query: () => {},
    screenview: () => {},
    time: () => {},
    require: () => {},
    exception: () => {},
    social: () => {},
    disable: () => {},
    enable: () => {},
  } as VueAnalytics)

export default createMockGa
