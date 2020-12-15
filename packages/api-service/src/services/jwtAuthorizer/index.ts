import { decodeToken } from '@/utils/jwt'
import { logger } from '@/utils/logging'
import { wrapAsyncHandler } from '@/utils/sentry'

// see https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-lambda-authorizer.html#http-api-lambda-authorizer.payload-format-response
type AuthorizerResponse = {
  isAuthorized: boolean
  context?: Record<
    string,
    string | boolean | number | Array<string> | Record<string, string>
  >
}

// see https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-lambda-authorizer.html#http-api-lambda-authorizer.payload-format
type AuthorizerRequest = {
  headers: Record<string, string>
}

const UNAUTHORIZED: AuthorizerResponse = {
  isAuthorized: false,
}

export const handler = wrapAsyncHandler(
  async (request: AuthorizerRequest): Promise<AuthorizerResponse> => {
    if (!request.headers.authorization) {
      return UNAUTHORIZED
    }

    let token = request.headers.authorization
    if (token.startsWith('Bearer ')) {
      token = token.substring(7)
    }

    try {
      const data = await decodeToken(token)

      // check expiry date
      if (data['exp'] && new Date(data['exp'] * 1000) < new Date()) {
        return UNAUTHORIZED
      }

      // check not valid before date
      if (data['nbf'] && new Date(data['nbf'] * 1000) > new Date()) {
        return UNAUTHORIZED
      }

      return {
        isAuthorized: true,
        context: data,
      }
    } catch (err) {
      logger.warn('Token could not be verified. Token value:', token)
    }

    return UNAUTHORIZED
  },
  {
    rethrowAfterCapture: true,
  },
)
