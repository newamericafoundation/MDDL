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

export const getObjectKeys = (obj: any): string[] => {
  return gatherKeysFromObject(obj)
}

const gatherKeysFromObject = (
  obj: any,
  keys: string[] = [],
  prefix = '',
): string[] => {
  if (Array.isArray(obj)) {
    const itemKeys = obj.map((item, index) =>
      gatherKeysFromObject(item, keys, prefix + '[' + index + ']'),
    )
  } else if (obj.constructor === Object) {
    Object.entries(obj).map(([key, value]) =>
      gatherKeysFromObject(value, keys, prefix ? `${prefix}.${key}` : key),
    )
  } else if (prefix) {
    keys.push(prefix)
  }
  return keys
}
