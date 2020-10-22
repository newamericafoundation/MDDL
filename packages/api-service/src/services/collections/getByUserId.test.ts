import getByUserId from './getByUserId'
import {
  getCollectionsByOwnerId,
  Collection as CollectionModel,
} from '@/models/collection'
import { createMockEvent, setUserId, toMockedFunction } from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

jest.mock('@/utils/database', () => {
  return {
    connectDatabase: jest.fn(),
  }
})

jest.mock('@/models/collection', () => {
  const module = jest.requireActual('@/models/collection')
  return {
    ...module,
    getCollectionsByOwnerId: jest.fn(),
  }
})

describe('getByUserId', () => {
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

  it('returns collections', async () => {
    toMockedFunction(getCollectionsByOwnerId).mockImplementationOnce(() =>
      Promise.resolve([
        CollectionModel.fromJson({
          id: 'myCollectionId1',
          ownerId: userId,
          name: 'My First Collection',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          createdBy: userId,
          updatedBy: userId,
        }),
        CollectionModel.fromJson({
          id: 'myCollectionId2',
          ownerId: userId,
          name: 'My Second Collection',
          createdAt: new Date('2015-01-27T13:14:15Z'),
          createdBy: userId,
          updatedBy: userId,
        }),
      ]),
    )
    expect(await getByUserId(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"collections\\":[{\\"name\\":\\"My First Collection\\",\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"id\\":\\"myCollectionId1\\",\\"links\\":[]},{\\"name\\":\\"My Second Collection\\",\\"createdDate\\":\\"2015-01-27T13:14:15.000Z\\",\\"id\\":\\"myCollectionId2\\",\\"links\\":[]}]}",
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
    toMockedFunction(getCollectionsByOwnerId).mockImplementationOnce(() =>
      Promise.resolve([]),
    )
    expect(await getByUserId(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"User not found\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 404,
      }
    `)
  })
  it('returns empty when none found', async () => {
    toMockedFunction(getCollectionsByOwnerId).mockImplementationOnce(() =>
      Promise.resolve([]),
    )
    expect(await getByUserId(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"collections\\":[]}",
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
