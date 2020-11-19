import { User } from '@/models/user'
import { requireUserData } from '@/services/users'
import { APIGatewayProxyEventV2, Context } from 'aws-lambda'
import { setContext } from './middleware'

export const toMockedFunction = <T extends (...args: any[]) => any>(
  input: T,
) => {
  return input as jest.MockedFunction<T>
}

export const importMock = async (modulePath: string) => {
  return (await import(modulePath)) as { [index: string]: jest.Mock }
}

export const setUserId = (userId: string, event: APIGatewayProxyEventV2) => {
  event.requestContext.authorizer = {
    jwt: {
      claims: {
        sub: userId,
        iat: 1605745134,
      },
      scopes: [],
    },
  }
  return event
}
export const createMockEvent = (
  data?: Partial<APIGatewayProxyEventV2>,
): APIGatewayProxyEventV2 => {
  return {
    headers: {
      authorization: 'my-token',
    },
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
    ...data,
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
  if (obj === null || obj === undefined) {
    return keys
  } else if (Array.isArray(obj)) {
    obj.map((item, index) =>
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

export const mockUserData = (
  userId: string,
  email = 'jcitizen@example.com',
  attributes?: any,
) => {
  const data = {
    id: userId,
    givenName: 'Jane',
    familyName: 'Citizen',
    email,
    attributes,
  }
  toMockedFunction(requireUserData).mockImplementation(
    async (request, requireTermsOfUseAcceptance) => {
      await setContext('userId', () => userId)(request)
      return User.fromJson(data)
    },
  )
  return data
}
