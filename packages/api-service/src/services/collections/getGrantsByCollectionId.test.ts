import handler from './getGrantsByCollectionId'
import {
  getGrantsByCollectionId,
  getCollectionById,
  Collection,
} from '@/models/collection'
import {
  createMockEvent,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { CollectionGrant } from '@/models/collectionGrant'
import { CollectionGrantType } from 'api-client'

jest.mock('@/utils/database')
jest.mock('@/models/collection')
jest.mock('@/services/user')

describe('getGrantsByCollectionId', () => {
  const userId = 'myUserId'
  const collectionId = 'myCollectionId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    mockUserData(userId)
    toMockedFunction(getCollectionById).mockImplementationOnce(async () =>
      Collection.fromDatabaseJson({
        ownerId: userId,
      }),
    )
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          collectionId,
        },
      }),
    )
  })

  it('returns documents', async () => {
    toMockedFunction(getGrantsByCollectionId).mockImplementationOnce(
      async () => [
        CollectionGrant.fromJson({
          id: 'myGrantId1',
          collectionId,
          requirementType: CollectionGrantType.INDIVIDUALEMAIL,
          requirementValue: 'myGrantId1',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          createdBy: userId,
        }),
        CollectionGrant.fromJson({
          id: 'myGrantId2',
          collectionId,
          requirementType: CollectionGrantType.INDIVIDUALEMAIL,
          requirementValue: 'myGrantId2',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          createdBy: userId,
        }),
      ],
    )
    expect(await handler(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"collectionGrants\\":[{\\"id\\":\\"myGrantId1\\",\\"type\\":\\"INDIVIDUAL_EMAIL\\",\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"individualEmailAddress\\":\\"myGrantId1\\",\\"links\\":[]},{\\"id\\":\\"myGrantId2\\",\\"type\\":\\"INDIVIDUAL_EMAIL\\",\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"individualEmailAddress\\":\\"myGrantId2\\",\\"links\\":[]}]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('returns empty when no grants found', async () => {
    toMockedFunction(getGrantsByCollectionId).mockImplementationOnce(() =>
      Promise.resolve([]),
    )
    expect(await handler(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"collectionGrants\\":[]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('returns not found when collection doesnt exist', async () => {
    toMockedFunction(getCollectionById)
      .mockReset()
      .mockImplementationOnce(async () => null)
    expect(await handler(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"collection not found\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 404,
      }
    `)
  })
})
