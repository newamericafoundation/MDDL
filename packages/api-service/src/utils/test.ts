import { APIGatewayProxyEventV2, Context } from 'aws-lambda'

export const toMockedFunction = <T extends (...args: any[]) => any>(
  input: T,
) => {
  return input as jest.MockedFunction<T>
}

export const createMockEvent = (): APIGatewayProxyEventV2 => {
  return {
    headers: {},
    isBase64Encoded: false,
    rawPath: 'test',
    rawQueryString: 'test',
    requestContext: {
      accountId: '1111111111',
      apiId: 'apiId',
      domainName: 'domainName',
      domainPrefix: 'domainPrefix',
      http: {
        method: 'GET',
        path: 'path',
        protocol: 'HTTPS',
        sourceIp: '127.0.0.1',
        userAgent: 'Custom-UA',
      },
      requestId: '4A047E06-98D3-43AA-8501-424D8E0DEA32',
      routeKey: '4A047E06-98D3-43AA-8501-424D8E0DEA32',
      stage: 'stage',
      time: '2020-01-01T00:00:00.000Z',
      timeEpoch: 123456789,
    },
    routeKey: 'routeKey',
    version: '1',
  }
}

export const createMockContext = (): Context =>
  (jest.fn() as unknown) as Context
