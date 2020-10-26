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
          createdAt: new Date('2015-01-12T13:14:15Z'),
          updatedBy: userId,
          createdBy: userId,
        }),
      ),
    )
    expect(await getById(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"name\\":\\"My First File\\",\\"id\\":\\"myDocumentId\\",\\"files\\":[],\\"links\\":[]}",
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
