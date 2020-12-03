import getById from './getById'
import {
  getSingleDocumentById,
  Document as DocumentModel,
} from '@/models/document'
import {
  createMockEvent,
  importMock,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { DocumentPermission } from './authorization'
import { setContext } from '@/utils/middleware'
import createError from 'http-errors'

jest.mock('@/utils/database')
jest.mock('@/services/users')
jest.mock('@/models/document')
jest.mock('@/services/documents/authorization')
jest.mock('@/config')

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

  it('returns document for owner', async () => {
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
        "body": "{\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"name\\":\\"My First File\\",\\"description\\":\\"My First File Description\\",\\"id\\":\\"myDocumentId\\",\\"files\\":[{\\"id\\":\\"myFileId\\",\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"links\\":[{\\"href\\":\\"/documents/myDocumentId/files/myFileId/download?disposition=attachment\\",\\"rel\\":\\"download\\",\\"type\\":\\"GET\\"},{\\"href\\":\\"/documents/myDocumentId/files/myFileId/download?disposition=inline\\",\\"rel\\":\\"preview\\",\\"type\\":\\"GET\\"}],\\"name\\":\\"myFile\\",\\"sha256Checksum\\":\\"checksum\\",\\"contentType\\":\\"image/jpeg\\",\\"contentLength\\":10000}],\\"links\\":[{\\"href\\":\\"/documents/myDocumentId\\",\\"rel\\":\\"self\\",\\"type\\":\\"GET\\"},{\\"href\\":\\"/documents/myDocumentId\\",\\"rel\\":\\"update\\",\\"type\\":\\"PUT\\"},{\\"href\\":\\"/documents/myDocumentId\\",\\"rel\\":\\"delete\\",\\"type\\":\\"DELETE\\"}]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })

  it('returns document for delegated user', async () => {
    const requirePermissionToDocumentImpl = (
      await importMock('@/services/documents/authorization')
    ).requirePermissionToDocumentImpl
    requirePermissionToDocumentImpl.mockImplementationOnce(async (request) => {
      await setContext('documentPermissions', () => [
        DocumentPermission.GetDocument,
        DocumentPermission.WriteDocument,
      ])(request)
      return request
    })
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
        "body": "{\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"name\\":\\"My First File\\",\\"description\\":\\"My First File Description\\",\\"id\\":\\"myDocumentId\\",\\"files\\":[{\\"id\\":\\"myFileId\\",\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"links\\":[{\\"href\\":\\"/documents/myDocumentId/files/myFileId/download?disposition=attachment\\",\\"rel\\":\\"download\\",\\"type\\":\\"GET\\"},{\\"href\\":\\"/documents/myDocumentId/files/myFileId/download?disposition=inline\\",\\"rel\\":\\"preview\\",\\"type\\":\\"GET\\"}],\\"name\\":\\"myFile\\",\\"sha256Checksum\\":\\"checksum\\",\\"contentType\\":\\"image/jpeg\\",\\"contentLength\\":10000}],\\"links\\":[{\\"href\\":\\"/documents/myDocumentId\\",\\"rel\\":\\"self\\",\\"type\\":\\"GET\\"},{\\"href\\":\\"/documents/myDocumentId\\",\\"rel\\":\\"update\\",\\"type\\":\\"PUT\\"}]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })

  it('returns document for agency', async () => {
    const requirePermissionToDocumentImpl = (
      await importMock('@/services/documents/authorization')
    ).requirePermissionToDocumentImpl
    requirePermissionToDocumentImpl.mockImplementationOnce(async (request) => {
      await setContext('documentPermissions', () => [
        DocumentPermission.GetDocument,
      ])(request)
      return request
    })
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
        "body": "{\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"name\\":\\"My First File\\",\\"description\\":\\"My First File Description\\",\\"id\\":\\"myDocumentId\\",\\"files\\":[{\\"id\\":\\"myFileId\\",\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"links\\":[{\\"href\\":\\"/documents/myDocumentId/files/myFileId/download?disposition=attachment\\",\\"rel\\":\\"download\\",\\"type\\":\\"GET\\"},{\\"href\\":\\"/documents/myDocumentId/files/myFileId/download?disposition=inline\\",\\"rel\\":\\"preview\\",\\"type\\":\\"GET\\"}],\\"name\\":\\"myFile\\",\\"sha256Checksum\\":\\"checksum\\",\\"contentType\\":\\"image/jpeg\\",\\"contentLength\\":10000}],\\"links\\":[{\\"href\\":\\"/documents/myDocumentId\\",\\"rel\\":\\"self\\",\\"type\\":\\"GET\\"}]}",
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
    const requirePermissionToDocumentImpl = (
      await importMock('@/services/documents/authorization')
    ).requirePermissionToDocumentImpl
    requirePermissionToDocumentImpl.mockImplementationOnce(async (request) => {
      throw new createError.NotFound('document not found')
    })
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
