import { EnvironmentVariable, getConfiguration } from '@/config'
import { AWSLambda } from '@sentry/serverless'
import { CaptureContext } from '@sentry/types'
import { Handler as MiddlewareHandler } from './middleware'
import * as SentryTracing from '@sentry/tracing'
import { Handler as LambdaHandler } from 'aws-lambda'
import { WrapperOptions } from '@sentry/serverless/dist/awslambda'

export type AsyncHandler<TEvent = any, TResult = any> = (
  event: TEvent,
) => Promise<TResult>

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

export const wrapAsyncHandler = <TEvent = any, TResult = any>(
  handler: AsyncHandler<TEvent, TResult>,
  wrapOptions?: Partial<WrapperOptions>,
): AsyncHandler<TEvent, TResult | undefined> => {
  initialize()
  if (useSentry) {
    return AWSLambda.wrapHandler(handler, wrapOptions) as AsyncHandler<
      TEvent,
      TResult
    >
  }
  return handler
}

export const wrapMiddlewareHandler = (
  handler: MiddlewareHandler,
): MiddlewareHandler => {
  initialize()
  return useSentry
    ? (AWSLambda.wrapHandler(handler) as MiddlewareHandler)
    : handler
}

export const captureException = (
  exception: any,
  captureContext?: CaptureContext,
) => {
  initialize()
  if (useSentry) {
    AWSLambda.captureException(exception, captureContext)
  }
}
