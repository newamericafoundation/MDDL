import {
  AccountDelegate,
  getAccountDelegateById,
  updateAccountDelegate,
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
import { handler as acceptDelegatedAccount } from './acceptDelegatedAccount'
import createError from 'http-errors'

jest.mock('@/utils/database')
jest.mock('@/models/user')
jest.mock('@/services/users')
jest.mock('@/services/accountDelegates/authorization')
jest.mock('@/models/accountDelegate')

describe('acceptDelegatedAccount', () => {
  const userId = 'myUserId'
  const email = 'myEmail'
  const accountId = 'otherAccountId'
  const accountDelegateId = 'myAccountDelegateId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    mockUserData(userId)
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          delegateId: accountDelegateId,
        },
      }),
    )
  })

  it('returns 404 if delegate not found', async () => {
    const requirePermissionToAccountDelegateImpl = (
      await importMock('@/services/accountDelegates/authorization')
    ).requirePermissionToAccountDelegateImpl
    requirePermissionToAccountDelegateImpl.mockImplementationOnce(
      async (request) => {
        throw new createError.NotFound('accountDelegate not found')
      },
    )
    expect(await acceptDelegatedAccount(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"accountDelegate not found\\"}",
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
    const data = {
      id: accountDelegateId,
      accountId: accountId,
      delegateEmail: email,
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
    toMockedFunction(getAccountDelegateById).mockImplementationOnce(
      async () => {
        return AccountDelegate.fromDatabaseJson(data)
      },
    )
    toMockedFunction(updateAccountDelegate).mockImplementationOnce(async () => {
      return AccountDelegate.fromDatabaseJson({
        ...data,
        status: UserDelegatedAccessStatus.ACTIVE,
      })
    })
    expect(await acceptDelegatedAccount(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"email\\":\\"myEmail\\",\\"id\\":\\"myAccountDelegateId\\",\\"links\\":[{\\"href\\":\\"/delegates/myAccountDelegateId\\",\\"rel\\":\\"delete\\",\\"type\\":\\"DELETE\\"},{\\"href\\":\\"/delegates/myAccountDelegateId/accept\\",\\"rel\\":\\"accept\\",\\"type\\":\\"POST\\"}],\\"status\\":\\"ACTIVE\\",\\"allowsAccessToUser\\":{\\"id\\":\\"otherAccountId\\",\\"givenName\\":\\"otherAccountId\\",\\"familyName\\":\\"otherAccountId\\"}}",
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
