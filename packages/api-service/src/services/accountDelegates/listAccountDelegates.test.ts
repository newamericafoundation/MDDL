import {
  AccountDelegate,
  getAccountDelegatesForUser,
} from '@/models/accountDelegate'
import { getUserById, getUsersById, User } from '@/models/user'
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
import { handler as listAccountDelegates } from './listAccountDelegates'
import createError from 'http-errors'

jest.mock('@/config')
jest.mock('@/utils/database')
jest.mock('@/models/user')
jest.mock('@/services/users')
jest.mock('@/services/users/authorization')
jest.mock('@/models/accountDelegate')

describe('listAccountDelegates', () => {
  const userId = 'myUserId'
  const email = 'myEmail'
  const ids = [
    '676018A-0272-4561-98E6-C900BB69C055',
    'EDD765F9-C3DE-4E4F-BFE1-E41FB38E4FBE',
    '261B6669-1909-4F72-9EF9-0A35A2C0ABAD',
    'AE75BF31-CCDC-4694-9B84-8EDDCFF14B8E',
    '8B14A371-8223-46B2-AD42-42B15FE0A65A',
    'B60FC735-3D85-47BE-BF35-6B3E969A910B',
  ]
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

  it('returns 404 if delegate not found', async () => {
    const requirePermissionToUserImpl = (
      await importMock('@/services/users/authorization')
    ).requirePermissionToUserImpl
    requirePermissionToUserImpl.mockImplementationOnce(async (request) => {
      throw new createError.NotFound('user not found')
    })
    expect(await listAccountDelegates(event)).toMatchInlineSnapshot(`
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

  it('returns list response', async () => {
    toMockedFunction(getUserById).mockImplementation(async (userId: string) => {
      return User.fromDatabaseJson({
        id: userId,
        givenName: userId,
        familyName: userId,
      })
    })
    toMockedFunction(getUsersById).mockImplementation(
      async (userIds: string[]) => {
        return userIds.map((userId, index) =>
          User.fromDatabaseJson({
            id: userId,
            givenName: index % 2 ? undefined : userId,
            familyName: index % 2 ? undefined : userId,
            email: index % 2 ? userId : undefined,
          }),
        )
      },
    )
    toMockedFunction(getAccountDelegatesForUser).mockImplementationOnce(
      async () => {
        return [
          // pending invite from current user
          AccountDelegate.fromDatabaseJson({
            id: ids[0],
            accountId: userId,
            delegateEmail: 'otherUser',
            status: UserDelegatedAccessStatus.INVITATIONSENT,
            inviteValidUntil: addDaysFromNow(5),
            createdAt: new Date('2015-01-12T13:14:15Z'),
          }),
          // expired invite from current user
          AccountDelegate.fromDatabaseJson({
            id: ids[1],
            accountId: userId,
            delegateEmail: 'otherUser1',
            status: UserDelegatedAccessStatus.INVITATIONSENT,
            inviteValidUntil: addDaysFromNow(-5),
            createdAt: new Date('2015-01-12T13:14:15Z'),
          }),
          // accepted invite from current user
          AccountDelegate.fromDatabaseJson({
            id: ids[2],
            accountId: userId,
            delegateEmail: 'otherUser2',
            status: UserDelegatedAccessStatus.ACTIVE,
            inviteValidUntil: addDaysFromNow(-5),
            createdAt: new Date('2015-01-12T13:14:15Z'),
          }),
          // pending invite to current user
          AccountDelegate.fromDatabaseJson({
            id: ids[3],
            accountId: 'otherUser3',
            delegateEmail: email,
            status: UserDelegatedAccessStatus.INVITATIONSENT,
            inviteValidUntil: addDaysFromNow(5),
            createdAt: new Date('2015-01-12T13:14:15Z'),
          }),
          // expired invite to current user
          AccountDelegate.fromDatabaseJson({
            id: ids[4],
            accountId: 'otherUser4',
            delegateEmail: email,
            status: UserDelegatedAccessStatus.INVITATIONSENT,
            inviteValidUntil: addDaysFromNow(-5),
            createdAt: new Date('2015-01-12T13:14:15Z'),
          }),
          // accepted invite to current user
          AccountDelegate.fromDatabaseJson({
            id: ids[5],
            accountId: 'otherUser5',
            delegateEmail: email,
            status: UserDelegatedAccessStatus.ACTIVE,
            inviteValidUntil: addDaysFromNow(-5),
            createdAt: new Date('2015-01-12T13:14:15Z'),
          }),
        ]
      },
    )
    const response = await listAccountDelegates(event)
    expect(JSON.parse(response.body as string)).toMatchInlineSnapshot(`
      Object {
        "delegatedAccess": Array [
          Object {
            "createdDate": "2015-01-12T13:14:15.000Z",
            "email": "otherUser",
            "id": "676018A-0272-4561-98E6-C900BB69C055",
            "links": Array [
              Object {
                "href": "/delegates/676018A-0272-4561-98E6-C900BB69C055",
                "rel": "delete",
                "type": "DELETE",
              },
            ],
            "status": "INVITATION_SENT",
          },
          Object {
            "createdDate": "2015-01-12T13:14:15.000Z",
            "email": "otherUser1",
            "id": "EDD765F9-C3DE-4E4F-BFE1-E41FB38E4FBE",
            "links": Array [
              Object {
                "href": "/delegates/EDD765F9-C3DE-4E4F-BFE1-E41FB38E4FBE",
                "rel": "delete",
                "type": "DELETE",
              },
            ],
            "status": "INVITATION_EXPIRED",
          },
          Object {
            "createdDate": "2015-01-12T13:14:15.000Z",
            "email": "otherUser2",
            "id": "261B6669-1909-4F72-9EF9-0A35A2C0ABAD",
            "links": Array [
              Object {
                "href": "/delegates/261B6669-1909-4F72-9EF9-0A35A2C0ABAD",
                "rel": "delete",
                "type": "DELETE",
              },
            ],
            "status": "ACTIVE",
          },
          Object {
            "allowsAccessToUser": Object {
              "familyName": "otherUser3",
              "givenName": "otherUser3",
              "id": "otherUser3",
              "name": "otherUser3 otherUser3",
            },
            "createdDate": "2015-01-12T13:14:15.000Z",
            "email": "myEmail",
            "id": "AE75BF31-CCDC-4694-9B84-8EDDCFF14B8E",
            "links": Array [
              Object {
                "href": "/delegates/AE75BF31-CCDC-4694-9B84-8EDDCFF14B8E",
                "rel": "delete",
                "type": "DELETE",
              },
              Object {
                "href": "/delegates/AE75BF31-CCDC-4694-9B84-8EDDCFF14B8E/accept",
                "rel": "accept",
                "type": "POST",
              },
            ],
            "status": "INVITATION_SENT",
          },
          Object {
            "allowsAccessToUser": Object {
              "familyName": null,
              "givenName": null,
              "id": "otherUser4",
              "name": "otherUser4",
            },
            "createdDate": "2015-01-12T13:14:15.000Z",
            "email": "myEmail",
            "id": "8B14A371-8223-46B2-AD42-42B15FE0A65A",
            "links": Array [
              Object {
                "href": "/delegates/8B14A371-8223-46B2-AD42-42B15FE0A65A",
                "rel": "delete",
                "type": "DELETE",
              },
              Object {
                "href": "/delegates/8B14A371-8223-46B2-AD42-42B15FE0A65A/accept",
                "rel": "accept",
                "type": "POST",
              },
            ],
            "status": "INVITATION_EXPIRED",
          },
          Object {
            "allowsAccessToUser": Object {
              "familyName": "otherUser5",
              "givenName": "otherUser5",
              "id": "otherUser5",
              "name": "otherUser5 otherUser5",
            },
            "createdDate": "2015-01-12T13:14:15.000Z",
            "email": "myEmail",
            "id": "B60FC735-3D85-47BE-BF35-6B3E969A910B",
            "links": Array [
              Object {
                "href": "/delegates/B60FC735-3D85-47BE-BF35-6B3E969A910B",
                "rel": "delete",
                "type": "DELETE",
              },
              Object {
                "href": "/delegates/B60FC735-3D85-47BE-BF35-6B3E969A910B/accept",
                "rel": "accept",
                "type": "POST",
              },
            ],
            "status": "ACTIVE",
          },
        ],
      }
    `)
  })
})
