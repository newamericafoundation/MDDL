import getDownloadForCollectionDocuments from './getDownloadForCollectionDocuments'
import {
  getCollectionById,
  Collection,
  getDocumentsByCollectionId,
} from '@/models/collection'
import { Document as DocumentModel } from '@/models/document'
import {
  createMockEvent,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { objectExists } from '@/utils/s3'
import { putMessages } from '@/utils/sqs'

jest.mock('@/utils/database')
jest.mock('@/utils/s3')
jest.mock('@/utils/sqs')
jest.mock('@/models/collection')
jest.mock('@/models/file')
jest.mock('@/services/users')
jest.mock('@/config')

describe('getDownloadForCollectionDocuments', () => {
  const userId = 'myUserId'
  const collectionId = 'myCollectionId'
  const downloadId =
    '1b771c7a36ef722cbcbb8ac962e0233ae8fa1463587ab803a7d706107ba243af'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    mockUserData(userId)
    toMockedFunction(getDocumentsByCollectionId).mockImplementation(
      async () => [
        DocumentModel.fromJson({
          id: 'myDocumentId1',
          ownerId: userId,
          name: 'My First File',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          createdBy: userId,
          updatedAt: new Date('2015-01-27T13:14:15Z'),
          updatedBy: userId,
        }),
        DocumentModel.fromJson({
          id: 'myDocumentId2',
          ownerId: userId,
          name: 'My Second File',
          createdAt: new Date('2015-01-27T13:14:15Z'),
          createdBy: userId,
          updatedBy: userId,
          updatedAt: new Date('2015-01-27T13:14:15Z'),
          thumbnailPath: 'my-thumbnail-path',
        }),
      ],
    )
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          collectionId,
          downloadId,
        },
      }),
    )
  })

  it('returns success status', async () => {
    toMockedFunction(getCollectionById).mockImplementationOnce(async () =>
      Collection.fromDatabaseJson({
        ownerId: userId,
        name: 'Collection 1',
      }),
    )
    toMockedFunction(objectExists).mockImplementationOnce(async () => true)
    expect(await getDownloadForCollectionDocuments(event))
      .toMatchInlineSnapshot(`
      Object {
        "body": "{\\"id\\":\\"1b771c7a36ef722cbcbb8ac962e0233ae8fa1463587ab803a7d706107ba243af\\",\\"status\\":\\"SUCCESS\\",\\"fileDownload\\":{\\"href\\":\\"https://presigned-url.for/collections/myCollectionId/1b771c7a36ef722cbcbb8ac962e0233ae8fa1463587ab803a7d706107ba243af?filename=Collection 1.zip&disposition=attachment\\"}}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
    expect(toMockedFunction(putMessages as any)).toBeCalledTimes(1)
  })

  it('correctly creates messages for large collection', async () => {
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          collectionId,
          downloadId:
            '46f4bb20f05b34f3504eb57f1f18885c7c3e7517cd5790f9ac4199a73728c772',
        },
      }),
    )
    toMockedFunction(putMessages as any).mockClear()
    toMockedFunction(getDocumentsByCollectionId).mockImplementationOnce(
      async () =>
        [...Array(100).keys()].map((e, i) =>
          DocumentModel.fromJson({
            id: 'myDocumentId' + i,
            ownerId: userId,
            name: `My ${i}th File`,
            createdAt: new Date('2015-01-12T13:14:15Z'),
            createdBy: userId,
            updatedAt: new Date('2015-01-27T13:14:15Z'),
            updatedBy: userId,
          }),
        ),
    )
    toMockedFunction(getCollectionById).mockImplementationOnce(async () =>
      Collection.fromDatabaseJson({
        ownerId: userId,
        name: 'Collection 1',
      }),
    )
    toMockedFunction(objectExists).mockImplementationOnce(async () => true)
    expect(await getDownloadForCollectionDocuments(event))
      .toMatchInlineSnapshot(`
      Object {
        "body": "{\\"id\\":\\"46f4bb20f05b34f3504eb57f1f18885c7c3e7517cd5790f9ac4199a73728c772\\",\\"status\\":\\"SUCCESS\\",\\"fileDownload\\":{\\"href\\":\\"https://presigned-url.for/collections/myCollectionId/46f4bb20f05b34f3504eb57f1f18885c7c3e7517cd5790f9ac4199a73728c772?filename=Collection 1.zip&disposition=attachment\\"}}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
    expect(toMockedFunction(putMessages as any)).toBeCalledWith(
      Array(100).fill(expect.anything()),
      expect.anything(),
    )
  })
  it('returns 404 when collection doesnt exist', async () => {
    expect(await getDownloadForCollectionDocuments(event))
      .toMatchInlineSnapshot(`
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
  it('returns pending when object not found', async () => {
    toMockedFunction(getCollectionById).mockImplementationOnce(async () =>
      Collection.fromDatabaseJson({
        ownerId: userId,
        name: 'Collection 1',
      }),
    )
    toMockedFunction(objectExists).mockImplementationOnce(async () => false)
    expect(await getDownloadForCollectionDocuments(event))
      .toMatchInlineSnapshot(`
      Object {
        "body": "{\\"id\\":\\"1b771c7a36ef722cbcbb8ac962e0233ae8fa1463587ab803a7d706107ba243af\\",\\"status\\":\\"PENDING\\",\\"fileDownload\\":null}",
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
