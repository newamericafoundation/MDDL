import getById from './getById'
import {
  getSingleDocumentById,
  Document as DocumentModel,
} from '@/models/document'
import {
  createMockEvent,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

jest.mock('@/utils/database')
jest.mock('@/services/user')
jest.mock('@/models/document')

describe('getById', () => {
  const documentId = 'myDocumentId'
  const fileId = 'myFileId'
  const userId = 'myUserId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    mockUserData(userId)
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          documentId,
        },
      }),
    )
  })

  it('returns document', async () => {
    toMockedFunction(getSingleDocumentById).mockImplementationOnce(() =>
      Promise.resolve(
        DocumentModel.fromJson({
          id: documentId,
          ownerId: userId,
          name: 'My First File',
          description: 'My First File Description',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          updatedBy: userId,
          createdBy: userId,
          files: [
            {
              id: fileId,
              documentId,
              path: 'myFile/path',
              received: true,
              createdBy: userId,
              createdAt: new Date('2015-01-12T13:14:15Z'),
              name: 'myFile',
              sha256Checksum: 'checksum',
              contentType: 'image/jpeg',
              contentLength: 10000,
            },
          ],
        }),
      ),
    )
    expect(await getById(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"name\\":\\"My First File\\",\\"description\\":\\"My First File Description\\",\\"id\\":\\"myDocumentId\\",\\"files\\":[{\\"id\\":\\"myFileId\\",\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"links\\":[{\\"href\\":\\"/documents/myDocumentId/files/myFileId/download?disposition=attachment\\",\\"rel\\":\\"download\\",\\"type\\":\\"GET\\"},{\\"href\\":\\"/documents/myDocumentId/files/myFileId/download?disposition=inline\\",\\"rel\\":\\"preview\\",\\"type\\":\\"GET\\"}],\\"name\\":\\"myFile\\",\\"sha256Checksum\\":\\"checksum\\",\\"contentType\\":\\"image/jpeg\\",\\"contentLength\\":10000}],\\"links\\":[]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('throws error when not found', async () => {
    toMockedFunction(getSingleDocumentById).mockImplementationOnce(
      async () => null,
    )
    expect(await getById(event)).toMatchInlineSnapshot(`
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
