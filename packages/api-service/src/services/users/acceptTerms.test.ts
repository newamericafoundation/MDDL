import { handler as acceptTerms } from './acceptTerms'
import {
  createMockEvent,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { updateUser, User } from '@/models/user'

jest.mock('@/utils/database')
jest.mock('@/models/user')
jest.mock('@/services/users')
jest.mock('@/services/users/authorization')

describe('acceptTerms', () => {
  const userId = 'myUserId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          userId,
        },
      }),
    )
  })

  it('processes the update', async () => {
    const baseUserData = mockUserData(userId)
    toMockedFunction(updateUser).mockImplementationOnce(async (u) =>
      User.fromDatabaseJson({
        ...baseUserData,
        attributes: {
          termsOfUseAccepted: true,
        },
      }),
    )
    expect(await acceptTerms(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"id\\":\\"myUserId\\",\\"givenName\\":\\"Jane\\",\\"familyName\\":\\"Citizen\\",\\"termsOfUseAccepted\\":true,\\"links\\":[]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })

  it('blocks update if terms of use is already accepted', async () => {
    mockUserData(userId, undefined, {
      termsOfUseAccepted: true,
    })
    expect(await acceptTerms(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"terms of use already accepted for user!\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 400,
      }
    `)
  })
})
