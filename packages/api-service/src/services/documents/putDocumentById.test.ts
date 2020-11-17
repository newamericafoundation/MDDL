import putDocumentById from './putDocumentById'
import { Document, getDocumentById, updateDocument } from '@/models/document'
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
jest.mock('@/models/document')
jest.mock('@/services/users')

describe('putDocumentById', () => {
  const documentId = 'myDocumentId'
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
        },
      }),
    )
  })

  it('fails validation on no body', async () => {
    expect(await putDocumentById(event)).toEqual(
      expect.objectContaining({
        body: '{"message":"validation error: body was expected but empty"}',
      }),
    )
  })

  it('validation requires name or description', async () => {
    event.body = JSON.stringify({})
    expect(await putDocumentById(event)).toEqual(
      expect.objectContaining({
        body:
          '{"message":"validation error: \\"value\\" must contain at least one of [name, description]"}',
      }),
    )
  })

  it('updates name', async () => {
    toMockedFunction(updateDocument).mockImplementationOnce(async () => 1)
    const body = {
      name: 'test update',
    }
    event.body = JSON.stringify(body)
    const result = (await putDocumentById(
      event,
    )) as APIGatewayProxyStructuredResultV2
    expect(result).toMatchInlineSnapshot(`
      Object {
        "cookies": Array [],
        "isBase64Encoded": false,
        "statusCode": 204,
      }
    `)
    expect(toMockedFunction(updateDocument)).toHaveBeenCalledWith(
      documentId,
      expect.objectContaining(body),
    )
  })

  it('updates description', async () => {
    toMockedFunction(updateDocument).mockImplementationOnce(async () => 1)
    const body = {
      description: 'test update',
    }
    event.body = JSON.stringify(body)
    const result = (await putDocumentById(
      event,
    )) as APIGatewayProxyStructuredResultV2
    expect(result).toMatchInlineSnapshot(`
      Object {
        "cookies": Array [],
        "isBase64Encoded": false,
        "statusCode": 204,
      }
    `)
    expect(toMockedFunction(updateDocument)).toHaveBeenCalledWith(
      documentId,
      expect.objectContaining(body),
    )
  })
})
