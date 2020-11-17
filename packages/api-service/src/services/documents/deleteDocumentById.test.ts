import deleteDocumentById from './deleteDocumentById'
import { Document, deleteDocument, getDocumentById } from '@/models/document'
import { File } from '@/models/file'
import {
  createMockEvent,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda'

jest.mock('@/utils/database')
jest.mock('@/utils/s3')
jest.mock('@/models/document')
jest.mock('@/services/users')

describe('deleteDocumentById', () => {
  const documentId = 'myDocumentId'
  const fileId = 'myFileId'
  const userId = 'myUserId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    mockUserData(userId)
    toMockedFunction(deleteDocument).mockImplementationOnce(async () => 1)
    toMockedFunction(getDocumentById).mockImplementationOnce(async () =>
      Document.fromDatabaseJson({
        id: documentId,
        ownerId: userId,
        files: [
          File.fromDatabaseJson({
            id: fileId,
          }),
        ],
      }),
    )
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          documentId,
        },
      }),
    )
  })

  it('returns error if document could not be deleted', async () => {
    toMockedFunction(deleteDocument)
      .mockReset()
      .mockImplementationOnce(async () => 0)
    expect(await deleteDocumentById(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"document could not be deleted\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 500,
      }
    `)
    expect(toMockedFunction(deleteDocument)).toHaveBeenCalledWith(documentId)
  })

  it('returns success if document could be deleted', async () => {
    const result = (await deleteDocumentById(
      event,
    )) as APIGatewayProxyStructuredResultV2
    expect(result).toMatchInlineSnapshot(`
      Object {
        "cookies": Array [],
        "isBase64Encoded": false,
        "statusCode": 204,
      }
    `)
    expect(toMockedFunction(deleteDocument)).toHaveBeenCalledWith(documentId)
  })
})
