import { getUserById, insertUser, updateUser, User } from '@/models/user'
import { createCustomAuthenticatedApiGatewayHandler } from '@/services/users/middleware'
import { getUserInfo } from '@/utils/oauth'
import { createMockEvent, setUserId, toMockedFunction } from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'

jest.mock('@/config')
jest.mock('@/constants')
jest.mock('@/models/user')
jest.mock('@/utils/oauth')

const mockUserResponse = (userId: string, termsOfUseAccepted: boolean) => {
  const mockImplementation = async () => {
    return User.fromDatabaseJson({
      id: userId,
      givenName: userId,
      familyName: userId,
      attributes: {
        termsOfUseAccepted,
      },
    })
  }
  toMockedFunction(getUserById).mockImplementationOnce(mockImplementation)
  toMockedFunction(insertUser).mockImplementationOnce(mockImplementation)
  toMockedFunction(updateUser).mockImplementationOnce(mockImplementation)
}

describe('createCustomAuthenticatedApiGatewayHandler', () => {
  const userId = uuidv4()
  const middleware = jest.fn(async () => ({ field: 'value' }))
  let event: APIGatewayProxyEventV2
  beforeEach(() => {
    toMockedFunction(getUserInfo).mockImplementationOnce(async (userId) => ({
      sub: userId,
      email_verified: 'true',
      given_name: userId,
      family_name: userId,
      email: userId,
      username: userId,
    }))
    event = setUserId(userId, createMockEvent())
    middleware.mockClear()
  })
  it('calls middleware if terms not accepted and flag is disabled', async () => {
    mockUserResponse(userId, false)
    const result = await createCustomAuthenticatedApiGatewayHandler(
      {
        requireTermsOfUseAcceptance: false,
      },
      middleware,
    )(event)
    expect(result.statusCode).toStrictEqual(200)
    expect(middleware).toHaveBeenCalledTimes(1)
  })
  it('calls middleware if terms are accepted and flag is enabled', async () => {
    mockUserResponse(userId, true)
    const result = await createCustomAuthenticatedApiGatewayHandler(
      {
        requireTermsOfUseAcceptance: true,
      },
      middleware,
    )(event)
    expect(result.statusCode).toStrictEqual(200)
    expect(middleware).toHaveBeenCalledTimes(1)
  })
  it('errors if terms not accepted and flag is enabled', async () => {
    mockUserResponse(userId, false)
    const result = await createCustomAuthenticatedApiGatewayHandler(
      {
        requireTermsOfUseAcceptance: true,
      },
      middleware,
    )(event)
    expect(result.statusCode).toStrictEqual(403)
    expect(middleware).toHaveBeenCalledTimes(0)
  })
  it('calls middleware if terms are accepted and flag is disabled', async () => {
    mockUserResponse(userId, true)
    const result = await createCustomAuthenticatedApiGatewayHandler(
      {
        requireTermsOfUseAcceptance: false,
      },
      middleware,
    )(event)
    expect(result.statusCode).toStrictEqual(200)
    expect(middleware).toHaveBeenCalledTimes(1)
  })
})
