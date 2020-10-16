import handler from './getDocumentsByCollectionId'
import { getPathParameter, getUserId } from '@/utils/api-gateway'
import {
  getDocumentsByCollectionId,
  collectionExists,
} from '@/models/collection'
import {
  createMockContext,
  createMockEvent,
  toMockedFunction,
} from '@/utils/test'
import { Document as DocumentModel } from '@/models/document'

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

jest.mock('@/models/collection', () => {
  const module = jest.requireActual('@/models/collection')
  return {
    ...module,
    collectionExists: jest.fn(),
    getDocumentsByCollectionId: jest.fn(),
  }
})

describe('getDocumentsByCollectionId', () => {
  const userId = 'myUserId'

  beforeEach(() => {
    toMockedFunction(getPathParameter).mockImplementationOnce(() => userId)
    toMockedFunction(getUserId).mockImplementationOnce(() => userId)
  })

  it('returns documents', async () => {
    toMockedFunction(collectionExists).mockImplementationOnce(async () => true)
    toMockedFunction(getDocumentsByCollectionId).mockImplementationOnce(() =>
      Promise.resolve([
        DocumentModel.fromJson({
          id: 'myDocumentId1',
          ownerId: userId,
          name: 'My First File',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          createdBy: userId,
          updatedBy: userId,
        }),
        DocumentModel.fromJson({
          id: 'myDocumentId2',
          ownerId: userId,
          name: 'My Second File',
          createdAt: new Date('2015-01-27T13:14:15Z'),
          createdBy: userId,
          updatedBy: userId,
        }),
      ]),
    )
    expect(await handler(createMockEvent(), createMockContext(), jest.fn()))
      .toMatchInlineSnapshot(`
      Object {
        "body": "{\\"documents\\":[{\\"name\\":\\"My First File\\",\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"id\\":\\"myDocumentId1\\",\\"links\\":[{\\"href\\":\\"/documents/myDocumentId1\\",\\"rel\\":\\"self\\",\\"type\\":\\"GET\\"}]},{\\"name\\":\\"My Second File\\",\\"createdDate\\":\\"2015-01-27T13:14:15.000Z\\",\\"id\\":\\"myDocumentId2\\",\\"links\\":[{\\"href\\":\\"/documents/myDocumentId2\\",\\"rel\\":\\"self\\",\\"type\\":\\"GET\\"}]}]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('returns empty when no documents found', async () => {
    toMockedFunction(collectionExists).mockImplementationOnce(async () => true)
    toMockedFunction(getDocumentsByCollectionId).mockImplementationOnce(() =>
      Promise.resolve([]),
    )
    expect(await handler(createMockEvent(), createMockContext(), jest.fn()))
      .toMatchInlineSnapshot(`
      Object {
        "body": "{\\"documents\\":[]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('returns not found when collection doesnt exist', async () => {
    toMockedFunction(collectionExists).mockImplementationOnce(async () => false)
    expect(await handler(createMockEvent(), createMockContext(), jest.fn()))
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
})
