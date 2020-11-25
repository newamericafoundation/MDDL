import {
  AccountDelegate,
  createAccountDelegate,
} from '@/models/accountDelegate'
import { getUserById, User } from '@/models/user'
import { addDaysFromNow } from '@/utils/date'
import {
  createMockEvent,
  importMock,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { UserDelegatedAccessStatus } from 'api-client'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { handler as addAccountDelegate } from './addAccountDelegate'
import createError from 'http-errors'

jest.mock('@/config')
jest.mock('@/utils/database')
jest.mock('@/utils/sqs')
jest.mock('@/models/user')
jest.mock('@/services/emails')
jest.mock('@/services/users')
jest.mock('@/services/users/authorization')
jest.mock('@/models/accountDelegate')

describe('addAccountDelegate', () => {
  const userId = 'myUserId'
  const email = 'myEmail'
  const delegateEmail = 'delegateUser@example.com'
  const accountDelegateId = 'myAccountDelegateId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    mockUserData(userId, email)
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          userId,
        },
      }),
    )
  })

  it('returns 404 if user not found', async () => {
    const requirePermissionToUserImpl = (
      await importMock('@/services/users/authorization')
    ).requirePermissionToUserImpl
    requirePermissionToUserImpl.mockImplementationOnce(async (request) => {
      throw new createError.NotFound('user not found')
    })
    expect(await addAccountDelegate(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"user not found\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 404,
      }
    `)
  })

  it('returns response if found', async () => {
    event.body = JSON.stringify({
      email: delegateEmail,
    })
    const data = {
      id: accountDelegateId,
      accountId: userId,
      delegateEmail,
      status: UserDelegatedAccessStatus.INVITATIONSENT,
      inviteValidUntil: addDaysFromNow(5),
      createdAt: new Date('2015-01-12T13:14:15Z'),
    }
    toMockedFunction(getUserById).mockImplementation(async (userId: string) => {
      return User.fromDatabaseJson({
        id: userId,
        givenName: userId,
        familyName: userId,
      })
    })
    toMockedFunction(createAccountDelegate).mockImplementationOnce(async () => {
      return AccountDelegate.fromDatabaseJson(data)
    })
    expect(await addAccountDelegate(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"email\\":\\"delegateUser@example.com\\",\\"id\\":\\"myAccountDelegateId\\",\\"links\\":[{\\"href\\":\\"/delegates/myAccountDelegateId\\",\\"rel\\":\\"delete\\",\\"type\\":\\"DELETE\\"}],\\"status\\":\\"INVITATION_SENT\\"}",
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
