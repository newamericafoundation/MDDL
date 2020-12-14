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

export const handler = wrapAsyncHandler(
  async (request: AuthorizerRequest): Promise<AuthorizerResponse> => {
    if (!request.headers.authorization) {
      return {
        isAuthorized: false,
      }
    }

    let token = request.headers.authorization
    if (token.startsWith('Bearer ')) {
      token = token.substring(7)
    }

    try {
      const data = await decodeToken(token)
      return {
        isAuthorized: true,
        context: data,
      }
    } catch (err) {
      logger.warn('Token could not be verified. Token value:', token)
    }

    return {
      isAuthorized: false,
    }
  },
  {
    rethrowAfterCapture: true,
  },
)
