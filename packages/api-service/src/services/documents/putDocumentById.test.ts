import putDocumentById from './putDocumentById'
import { documentExistsById, updateDocument } from '@/models/document'
import { createMockEvent, setUserId, toMockedFunction } from '@/utils/test'
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda'

jest.mock('@/utils/database', () => {
  return {
    connectDatabase: jest.fn(),
  }
})

jest.mock('@/models/document', () => {
  const module = jest.requireActual('@/models/document')
  return {
    ...module,
    documentExistsById: jest.fn(),
    updateDocument: jest.fn(),
  }
})

describe('putDocumentById', () => {
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
