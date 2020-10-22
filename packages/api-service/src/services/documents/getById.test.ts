import getById from './getById'
import {
  getDocumentById,
  documentExistsById,
  Document as DocumentModel,
} from '@/models/document'
import { createMockEvent, setUserId, toMockedFunction } from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

jest.mock('@/utils/database', () => {
  return {
    connectDatabase: jest.fn(),
  }
})

jest.mock('@/models/document', () => {
  const module = jest.requireActual('@/models/document')
  return {
    ...module,
    getDocumentById: jest.fn(),
    documentExistsById: jest.fn(),
  }
})

describe('getById', () => {
  const documentId = 'myDocumentId'
  const userId = 'myUserId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    toMockedFunction(documentExistsById).mockImplementationOnce(
      async () => true,
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

  it('returns document', async () => {
    toMockedFunction(getDocumentById).mockImplementationOnce(() =>
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
    toMockedFunction(documentExistsById)
      .mockReset()
      .mockImplementationOnce(async () => false)
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
