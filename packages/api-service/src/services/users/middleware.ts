import {
  createAuthenticatedApiGatewayHandlerBase,
  MiddlewareEventProcessor,
  setContext,
} from '@/utils/middleware'
import { requireUserData } from '@/services/users'

export type HandlerProps = {
  requireTermsOfUseAcceptance?: boolean
}

export const createAuthenticatedApiGatewayHandler = <R, T = any>(
  ...middleware: MiddlewareEventProcessor<R, T>[]
) => {
  return createCustomAuthenticatedApiGatewayHandler({}, ...middleware)
}

export const createCustomAuthenticatedApiGatewayHandler = <R, T = any>(
  props: HandlerProps,
  ...middleware: MiddlewareEventProcessor<R, T>[]
) => {
  const { requireTermsOfUseAcceptance = true } = props
  return createAuthenticatedApiGatewayHandlerBase(
    setContext(
      'user',
      async (r) => await requireUserData(r, requireTermsOfUseAcceptance),
    ),
    ...middleware,
  )
}
