import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda'
import createError from 'http-errors'
import {
  getTokenTimestampClaimKey,
  getUserIdClaimKey,
} from './oauthIntegration'

export const requirePathParameter = (
  event: APIGatewayProxyEventV2,
  parameterName: string,
): string => {
  const parameter = getPathParameter(event, parameterName)
  if (!parameter) {
    throw new createError.BadRequest(
      `${parameterName} path parameter not found`,
    )
  }
  return parameter
}

export const getPathParameter = (
  event: APIGatewayProxyEventV2,
  parameterName: string,
): string | undefined => {
  return event.pathParameters && event.pathParameters[parameterName]
    ? event.pathParameters[parameterName]
    : undefined
}

export const requireQueryStringParameter = (
  event: APIGatewayProxyEventV2,
  parameterName: string,
): string => {
  const parameter = getQueryStringParameter(event, parameterName)
  if (!parameter) {
    throw new createError.BadRequest(
      `${parameterName} query string parameter not found`,
    )
  }
  return parameter
}

export const getQueryStringParameter = (
  event: APIGatewayProxyEventV2,
  parameterName: string,
): string | undefined => {
  return event.queryStringParameters &&
    event.queryStringParameters[parameterName]
    ? decodeURIComponent(event.queryStringParameters[parameterName])
    : undefined
}

export const requireToken = (event: APIGatewayProxyEventV2) =>
  requireHeader(event, 'authorization')

export const requireHeader = (
  event: APIGatewayProxyEventV2,
  headerName: string,
): string => {
  const parameter = getHeader(event, headerName)
  if (!parameter) {
    throw new createError.BadRequest(`${headerName} header not found`)
  }
  return parameter
}

export const getHeader = (
  event: APIGatewayProxyEventV2,
  headerName: string,
): string | undefined => {
  return event.headers && event.headers[headerName]
    ? event.headers[headerName]
    : undefined
}

export const requireUserId = (event: APIGatewayProxyEventV2): string =>
  '' + requireAuthorizerContext(event, getUserIdClaimKey())

export const requireTokenTimestamp = (event: APIGatewayProxyEventV2): string =>
  '' + requireAuthorizerContext(event, getTokenTimestampClaimKey())

export const requireAuthorizerContext = (
  event: APIGatewayProxyEventV2,
  contextKey: string,
): string | number | boolean | string[] => {
  const contextValue = getAuthorizerContext(event, contextKey)
  if (contextValue) {
    return contextValue
  }
  throw new createError.BadRequest(
    `${contextKey} authorizer context key not found`,
  )
}

type AuthorizerContext = {
  jwt: {
    claims: { [name: string]: string | number | boolean | string[] }
    scopes: string[]
  }
  lambda: { [name: string]: string | number | boolean | string[] | any }
}

export const getAuthorizerContext = (
  event: APIGatewayProxyEventV2,
  contextKey: string,
): string | number | boolean | string[] | undefined => {
  if (!event.requestContext.authorizer) {
    return undefined
  }

  const authorizerContext = event.requestContext.authorizer as AuthorizerContext

  if (authorizerContext.jwt && authorizerContext.jwt.claims[contextKey])
    return authorizerContext.jwt.claims[contextKey]

  if (authorizerContext.lambda && authorizerContext.lambda[contextKey]) {
    return authorizerContext.lambda[contextKey]
  }

  return undefined
}

export const createJsonResponse = <T = any>(
  body: T,
  httpStatusCode = 200,
): APIGatewayProxyStructuredResultV2 => {
  return {
    cookies: [],
    isBase64Encoded: false,
    statusCode: httpStatusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export const createStatusCodeResponse = (
  httpStatusCode = 200,
): APIGatewayProxyStructuredResultV2 => {
  return {
    cookies: [],
    isBase64Encoded: false,
    statusCode: httpStatusCode,
  }
}

export const createErrorResponse = (msg: string, httpStatusCode = 400) =>
  createJsonResponse({ message: msg }, httpStatusCode)
