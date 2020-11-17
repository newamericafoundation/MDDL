import downloadCollectionDocuments from './downloadCollectionDocuments'
import {
  getCollectionById,
  Collection,
  getDocumentsByCollectionId,
} from '@/models/collection'
import {
  createMockEvent,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import {
  DocumentsDownloadCreate,
  DocumentsDownloadFormatEnum,
} from 'api-client'
import { invokeFunction } from '@/utils/lambda'
import { Document as DocumentModel } from '@/models/document'
import { File as FileModel, getFilesByDocumentId } from '@/models/file'
import { objectExists } from '@/utils/s3'

jest.mock('@/utils/database')
jest.mock('@/utils/s3')
jest.mock('@/utils/lambda')
jest.mock('@/models/collection')
jest.mock('@/models/file')
jest.mock('@/services/users')
jest.mock('@/config')

describe('downloadCollectionDocuments', () => {
  const userId = 'myUserId'
  const collectionId = 'myCollectionId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    mockUserData(userId)
    toMockedFunction(invokeFunction).mockImplementationOnce(async () => 202)
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
    toMockedFunction(getFilesByDocumentId).mockImplementationOnce(
      async (documentId) => [
        FileModel.fromJson({
          id: 'file1' + documentId,
          documentId,
          path: 'myFile/file1',
          received: true,
          createdBy: userId,
          createdAt: new Date('2015-01-12T13:14:15Z'),
          name: 'myFile1.jpg',
          sha256Checksum: 'checksum',
          contentType: 'image/jpeg',
          contentLength: 10000,
        }),
        FileModel.fromJson({
          id: 'file2' + documentId,
          documentId,
          path: 'myFile/file2',
          received: true,
          createdBy: userId,
          createdAt: new Date('2015-01-12T13:14:15Z'),
          name: 'myFile2',
          sha256Checksum: 'checksum',
          contentType: 'image/jpeg',
          contentLength: 10000,
        }),
      ],
    )
    const body: DocumentsDownloadCreate = {
      format: DocumentsDownloadFormatEnum.ZIP,
    }
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          collectionId,
        },
        body: JSON.stringify(body),
      }),
    )
  })

  it('returns success status if file exists', async () => {
    toMockedFunction(getCollectionById).mockImplementationOnce(async () =>
      Collection.fromDatabaseJson({
        ownerId: userId,
      }),
    )
    toMockedFunction(objectExists).mockImplementationOnce(async () => true)
    expect(await downloadCollectionDocuments(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"id\\":\\"21ada2387bdfd35ad360d2ee7836674484a5bf14e288ddc44fa92df587e618f7\\",\\"status\\":\\"SUCCESS\\",\\"fileDownload\\":{\\"href\\":\\"https://presigned-url.for/collections/myCollectionId/21ada2387bdfd35ad360d2ee7836674484a5bf14e288ddc44fa92df587e618f7\\"}}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('returns 404 when collection doesnt exist', async () => {
    expect(await downloadCollectionDocuments(event)).toMatchInlineSnapshot(`
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
      }),
    )
    expect(await downloadCollectionDocuments(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"id\\":\\"21ada2387bdfd35ad360d2ee7836674484a5bf14e288ddc44fa92df587e618f7\\",\\"status\\":\\"PENDING\\",\\"fileDownload\\":null}",
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
