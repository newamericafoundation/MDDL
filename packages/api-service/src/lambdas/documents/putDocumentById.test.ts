import putDocumentById from './putDocumentById'
import { getPathParameter, getUserId } from '@/utils/api-gateway'
import { documentExistsById, updateDocument } from '@/models/document'
import {
  createMockContext,
  createMockEvent,
  toMockedFunction,
} from '@/utils/test'
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda'

jest.mock('@/utils/database', () => {
  return {
    connectDatabase: jest.fn(),
  }
})

jest.mock('@/utils/api-gateway', () => {
  const module = jest.requireActual('@/utils/api-gateway')
  return {
    ...module,
    getPathParameter: jest.fn(),
    getUserId: jest.fn(),
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
  const userId = 'myUserId'

  beforeEach(() => {
    toMockedFunction(getPathParameter).mockImplementationOnce(() => userId)
    toMockedFunction(getUserId).mockImplementationOnce(() => userId)
    toMockedFunction(documentExistsById).mockImplementationOnce(
      async () => true,
    )
  })

  it('fails validation on no body', async () => {
    expect(
      await putDocumentById(createMockEvent(), createMockContext(), jest.fn()),
    ).toEqual(
      expect.objectContaining({
        body: '{"message":"body not supplied"}',
      }),
    )
  })

  it('validation requires name or description', async () => {
    const event = createMockEvent()
    event.body = JSON.stringify({})
    expect(
      await putDocumentById(event, createMockContext(), jest.fn()),
    ).toEqual(
      expect.objectContaining({
        body:
          '{"message":"validation error: \\"value\\" must contain at least one of [name, description]"}',
      }),
    )
  })

  it('updates name', async () => {
    toMockedFunction(updateDocument).mockImplementationOnce(async () => 1)
    const event = createMockEvent()
    const body = {
      name: 'test update',
    }
    event.body = JSON.stringify(body)
    const result = (await putDocumentById(
      event,
      createMockContext(),
      jest.fn(),
    )) as APIGatewayProxyStructuredResultV2
    expect(result).toMatchInlineSnapshot(`
      Object {
        "cookies": Array [],
        "isBase64Encoded": false,
        "statusCode": 204,
      }
    `)
    expect(toMockedFunction(updateDocument)).toHaveBeenCalledWith(
      userId,
      expect.objectContaining(body),
    )
  })

  it('updates description', async () => {
    toMockedFunction(updateDocument).mockImplementationOnce(async () => 1)
    const event = createMockEvent()
    const body = {
      description: 'test update',
    }
    event.body = JSON.stringify(body)
    const result = (await putDocumentById(
      event,
      createMockContext(),
      jest.fn(),
    )) as APIGatewayProxyStructuredResultV2
    expect(result).toMatchInlineSnapshot(`
      Object {
        "cookies": Array [],
        "isBase64Encoded": false,
        "statusCode": 204,
      }
    `)
    expect(toMockedFunction(updateDocument)).toHaveBeenCalledWith(
      userId,
      expect.objectContaining(body),
    )
  })
})
