import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda'

export const getPathParameter = (
  event: APIGatewayProxyEventV2,
  parameterName: string,
): string | undefined => {
  return event.pathParameters && event.pathParameters[parameterName]
    ? event.pathParameters[parameterName]
    : undefined
}

export const getQueryStringParameter = (
  event: APIGatewayProxyEventV2,
  parameterName: string,
): string | undefined => {
  return event.queryStringParameters &&
    event.queryStringParameters[parameterName]
    ? event.queryStringParameters[parameterName]
    : undefined
}

export const getUrl = (event: APIGatewayProxyEventV2): string => {
  return event.requestContext.domainName
}

export const getUserId = (
  event: APIGatewayProxyEventV2,
): string | undefined => {
  if (!event.requestContext.authorizer || !event.requestContext.authorizer.jwt)
    return undefined
  return event.requestContext.authorizer.jwt.claims['sub'] as string
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
