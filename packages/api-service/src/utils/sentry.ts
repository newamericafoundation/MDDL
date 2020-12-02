import { EnvironmentVariable, getConfiguration } from '@/config'
import { AWSLambda } from '@sentry/serverless'
import { Handler as MiddlewareHandler } from './middleware'
import * as SentryTracing from '@sentry/tracing'

let inited = false
let useSentry = false

const initialize = () => {
  if (inited) {
    return
  }
  const dsn = getConfiguration(EnvironmentVariable.SENTRY_DSN)
  if (dsn) {
    SentryTracing.addExtensionMethods()
    AWSLambda.init({
      dsn,
      tracesSampleRate: 0,
      environment: getConfiguration(EnvironmentVariable.ENVIRONMENT_NAME),
    })
    useSentry = true
  }
  inited = true
}

export const wrapHandler = (handler: MiddlewareHandler): MiddlewareHandler => {
  initialize()
  return useSentry
    ? (AWSLambda.wrapHandler(handler) as MiddlewareHandler)
    : handler
}
