import {
  createErrorResponse,
  createJsonResponse,
  createStatusCodeResponse,
} from '@/utils/api-gateway'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { AnySchema } from 'joi'
import createError from 'http-errors'
import pPipe from 'p-pipe'
import { parseAndValidate } from './validation'

export const compose = pPipe

export type Context = {
  context: Record<string, any>
}

type EventProcessor = (request: APIGatewayRequest) => APIGatewayRequest
type EventProcessorPromise = (
  request: APIGatewayRequest,
) => Promise<APIGatewayRequest>
type EventHandler<R> = (request: APIGatewayRequest) => Promise<R>
type EventBodyHandler<T, R> = (request: APIGatewayRequestBody<T>) => Promise<R>

export const createApiGatewayHandler = <R, T = any>(
  ...middleware: (
    | EventProcessor
    | EventProcessorPromise
    | EventBodyHandler<T, R>
    | EventHandler<R>
  )[]
) => {
  return formatApiGatewayResult(compose(combineRequest, ...middleware))
}

export const formatApiGatewayResult = <E = APIGatewayProxyEventV2>(
  innerFunction: (event: E) => any | void,
) => async (event: E) => {
  try {
    const result = await innerFunction(event)
    if (result) {
      return createJsonResponse(result)
    }
    return createStatusCodeResponse(204)
  } catch (error) {
    if (error.statusCode && error.message) {
      return createErrorResponse(error.message, error.statusCode)
    }

    console.error(error)
    return createErrorResponse('An internal error occurred', 500)
  }
}

export type APIGatewayRequest = {
  [index: string]: any
  event: APIGatewayProxyEventV2
}

const combineRequest = (event: APIGatewayProxyEventV2): APIGatewayRequest => {
  return {
    event,
  }
}

export const setContext = (
  key: string,
  valueResolver: (e: APIGatewayRequest) => any,
) => (request: APIGatewayRequest): APIGatewayRequest => {
  request[key] = valueResolver(request)
  return request
}

export type APIGatewayRequestBody<T> = APIGatewayRequest & { body: T }

export const requireValidBody = <T>(schema: AnySchema) => (
  request: APIGatewayRequest,
): APIGatewayRequestBody<T> => {
  const { body } = request.event
  if (!body) {
    throw new createError.BadRequest(
      `validation error: body was expected but empty`,
    )
  }

  const { error, value } = parseAndValidate<T>(body, schema)
  if (error) {
    throw new createError.BadRequest(
      `validation error: ${error.details.map((x) => x.message).join(', ')}`,
    )
  }
  return { ...request, body: value }
}
