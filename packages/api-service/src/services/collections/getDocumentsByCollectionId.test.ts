import handler from './getDocumentsByCollectionId'
import {
  getDocumentsByCollectionId,
  getCollectionById,
  Collection,
} from '@/models/collection'
import {
  createMockEvent,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { Document as DocumentModel } from '@/models/document'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

jest.mock('@/utils/database')
jest.mock('@/utils/s3')
jest.mock('@/models/collection')
jest.mock('@/services/users')

describe('getDocumentsByCollectionId', () => {
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
    toMockedFunction(getDocumentsByCollectionId).mockImplementationOnce(() =>
      Promise.resolve([
        DocumentModel.fromJson({
          id: 'myDocumentId1',
          ownerId: userId,
          name: 'My First File',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          createdBy: userId,
          updatedBy: userId,
        }),
        DocumentModel.fromJson({
          id: 'myDocumentId2',
          ownerId: userId,
          name: 'My Second File',
          createdAt: new Date('2015-01-27T13:14:15Z'),
          createdBy: userId,
          updatedBy: userId,
          thumbnailPath: 'my-thumbnail-path',
        }),
      ]),
    )
    expect(await handler(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"documents\\":[{\\"name\\":\\"My First File\\",\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"id\\":\\"myDocumentId1\\",\\"links\\":[{\\"href\\":\\"/documents/myDocumentId1\\",\\"rel\\":\\"self\\",\\"type\\":\\"GET\\"}]},{\\"name\\":\\"My Second File\\",\\"createdDate\\":\\"2015-01-27T13:14:15.000Z\\",\\"id\\":\\"myDocumentId2\\",\\"links\\":[{\\"href\\":\\"/documents/myDocumentId2\\",\\"rel\\":\\"self\\",\\"type\\":\\"GET\\"},{\\"href\\":\\"https://presigned-url.for/my-thumbnail-path\\",\\"rel\\":\\"thumbnail\\",\\"type\\":\\"GET\\"}]}]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('returns empty when no documents found', async () => {
    toMockedFunction(getDocumentsByCollectionId).mockImplementationOnce(() =>
      Promise.resolve([]),
    )
    expect(await handler(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"documents\\":[]}",
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
