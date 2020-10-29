/// <reference lib="DOM" />
// the above is required to resolve this issue: https://github.com/axios/axios/issues/3219

export interface LambdaDestinationsEvent<T = any, U = any> {
  version: string
  timestamp: string
  requestContext: {
    requestId: string
    functionArn: string
    condition: string
    approximateInvokeCount: number
  }
  requestPayload: T
  responseContext: {
    statusCode: number
    executedVersion: string
  }
  responsePayload: U
}
