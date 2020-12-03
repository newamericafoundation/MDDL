import { handler as getUser } from './getUser'
import { createMockEvent, mockUserData, setUserId } from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

jest.mock('@/config')
jest.mock('@/utils/database')
jest.mock('@/services/users')
jest.mock('@/services/users/authorization')

describe('getUser', () => {
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

  it('returns user data', async () => {
    mockUserData(userId)
    expect(await getUser(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"id\\":\\"myUserId\\",\\"givenName\\":\\"Jane\\",\\"familyName\\":\\"Citizen\\",\\"email\\":\\"jcitizen@example.com\\",\\"name\\":\\"Jane Citizen\\",\\"termsOfUseAccepted\\":false,\\"links\\":[]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })

  it('returns user data when no name', async () => {
    mockUserData(userId, 'jcitizen@example.com', {}, false)
    expect(await getUser(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"id\\":\\"myUserId\\",\\"givenName\\":null,\\"familyName\\":null,\\"email\\":\\"jcitizen@example.com\\",\\"name\\":\\"jcitizen@example.com\\",\\"termsOfUseAccepted\\":false,\\"links\\":[]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })

  it('returns user with terms of use accepted', async () => {
    mockUserData(userId, undefined, {
      termsOfUseAccepted: true,
    })
    expect(await getUser(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"id\\":\\"myUserId\\",\\"givenName\\":\\"Jane\\",\\"familyName\\":\\"Citizen\\",\\"email\\":\\"jcitizen@example.com\\",\\"name\\":\\"Jane Citizen\\",\\"termsOfUseAccepted\\":true,\\"links\\":[]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
})
