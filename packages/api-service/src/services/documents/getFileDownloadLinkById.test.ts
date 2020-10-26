import getFileDownloadLinkById from './getFileDownloadLinkById'
import { Document, getDocumentById } from '@/models/document'
import { File as FileModel } from '@/models/file'
import {
  createMockEvent,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { getFileByIdAndDocumentId } from '@/models/file'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

jest.mock('@/utils/database')
jest.mock('@/utils/s3')
jest.mock('@/models/document')
jest.mock('@/models/file')
jest.mock('@/services/user')

describe('getFileDownloadLinkById', () => {
  const documentId = 'myDocumentId'
  const fileId = 'myFileId'
  const userId = 'myUserId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    mockUserData(userId)
    toMockedFunction(getDocumentById).mockImplementationOnce(async () =>
      Document.fromDatabaseJson({
        id: documentId,
        ownerId: userId,
      }),
    )
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          documentId,
          fileId,
        },
        queryStringParameters: {
          disposition: 'attachment',
        },
      }),
    )
  })

  it('returns file', async () => {
    toMockedFunction(getFileByIdAndDocumentId).mockImplementationOnce(() =>
      Promise.resolve(
        FileModel.fromJson({
          id: fileId,
          documentId,
          name: 'My First File',
          path: 'path/to/file',
          received: false,
          sha256Checksum: 'sha256Checksum',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          createdBy: 'me',
          contentType: 'image/jpeg',
          contentLength: 2000,
        }),
      ),
    )
    expect(await getFileDownloadLinkById(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"href\\":\\"https://presigned-url.for/path/to/file\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('returns error when file not found', async () => {
    toMockedFunction(getFileByIdAndDocumentId).mockImplementationOnce(() =>
      Promise.resolve(null),
    )
    expect(await getFileDownloadLinkById(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"file not found\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 404,
      }
    `)
  })
  it('returns error when document not found', async () => {
    toMockedFunction(getDocumentById)
      .mockReset()
      .mockImplementationOnce(async () => null)
    expect(await getFileDownloadLinkById(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"document not found\\"}",
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
