import getSharedToUserId from './getSharedToUserId'
import {
  Collection as CollectionModel,
  getCollectionsByGrantType,
} from '@/models/collection'
import {
  createMockEvent,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { getUsersById, User } from '@/models/user'
import { emailIsWhitelisted } from '@/utils/whitelist'

jest.mock('@/utils/database')
jest.mock('@/utils/whitelist')
jest.mock('@/models/collection')
jest.mock('@/models/user')
jest.mock('@/services/users')

describe('getSharedToUserId', () => {
  const userId = 'myUserId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    mockUserData(userId)
    toMockedFunction(emailIsWhitelisted).mockImplementationOnce(() => true)
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          userId,
        },
      }),
    )
  })

  it('returns collections', async () => {
    toMockedFunction(getUsersById).mockImplementationOnce(async () => [
      User.fromDatabaseJson({
        id: 'mockUser1',
        givenName: 'User1',
        familyName: 'User1',
      }),
      User.fromDatabaseJson({
        id: 'mockUser2',
        givenName: 'User2',
        familyName: 'User2',
      }),
    ])
    toMockedFunction(getCollectionsByGrantType).mockImplementationOnce(() =>
      Promise.resolve([
        CollectionModel.fromJson({
          id: 'myCollectionId1',
          ownerId: 'mockUser1',
          name: 'My First Collection',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          createdBy: userId,
          updatedBy: userId,
        }),
        CollectionModel.fromJson({
          id: 'myCollectionId2',
          ownerId: 'mockUser2',
          name: 'My Second Collection',
          createdAt: new Date('2015-01-27T13:14:15Z'),
          createdBy: userId,
          updatedBy: userId,
        }),
      ]),
    )
    expect(await getSharedToUserId(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"sharedCollections\\":[{\\"collection\\":{\\"name\\":\\"My First Collection\\",\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"id\\":\\"myCollectionId1\\",\\"links\\":[{\\"href\\":\\"/collections/myCollectionId1/documents\\",\\"rel\\":\\"documents\\",\\"type\\":\\"GET\\"}]},\\"owner\\":{\\"id\\":\\"mockUser1\\",\\"givenName\\":\\"User1\\",\\"familyName\\":\\"User1\\"}},{\\"collection\\":{\\"name\\":\\"My Second Collection\\",\\"createdDate\\":\\"2015-01-27T13:14:15.000Z\\",\\"id\\":\\"myCollectionId2\\",\\"links\\":[{\\"href\\":\\"/collections/myCollectionId2/documents\\",\\"rel\\":\\"documents\\",\\"type\\":\\"GET\\"}]},\\"owner\\":{\\"id\\":\\"mockUser2\\",\\"givenName\\":\\"User2\\",\\"familyName\\":\\"User2\\"}}]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('returns 404 when user doesnt exist', async () => {
    event = setUserId('otherUserId', event)
    toMockedFunction(getCollectionsByGrantType).mockImplementationOnce(() =>
      Promise.resolve([]),
    )
    toMockedFunction(getUsersById).mockImplementationOnce(async () => [])
    expect(await getSharedToUserId(event)).toMatchInlineSnapshot(`
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
  it('returns forbidden when user not whitelisted', async () => {
    toMockedFunction(emailIsWhitelisted)
      .mockReset()
      .mockImplementationOnce(() => false)
    expect(await getSharedToUserId(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"Forbidden\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 403,
      }
    `)
  })
  it('returns empty when none found', async () => {
    toMockedFunction(getCollectionsByGrantType).mockImplementationOnce(() =>
      Promise.resolve([]),
    )
    expect(await getSharedToUserId(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"sharedCollections\\":[]}",
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
