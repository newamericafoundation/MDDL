import getFileDownloadLinkById from './getFileDownloadLinkById'
import { documentExistsById } from '@/models/document'
import { getPathParameter, getUserId } from '@/utils/api-gateway'
import { File as FileModel } from '@/models/file'

import {
  createMockContext,
  createMockEvent,
  toMockedFunction,
} from '@/utils/test'
import { getFileByIdAndDocumentId } from '@/models/file'

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

jest.mock('@/utils/s3', () => {
  const module = jest.requireActual('@/utils/s3')
  return {
    ...module,
    getPresignedDownloadUrl: (path: string) =>
      Promise.resolve(`https://presigned-url.for/${path}`),
  }
})

jest.mock('@/models/document', () => {
  const module = jest.requireActual('@/models/document')
  return {
    ...module,
    documentExistsById: jest.fn(),
  }
})

jest.mock('@/models/file', () => {
  const module = jest.requireActual('@/models/file')
  return {
    ...module,
    getFileByIdAndDocumentId: jest.fn(),
  }
})

describe('getFileDownloadLinkById', () => {
  const documentId = 'myDocumentId'
  const fileId = 'myFileId'
  const userId = 'myUserId'

  beforeEach(() => {
    toMockedFunction(getPathParameter)
      .mockImplementationOnce(() => documentId)
      .mockImplementationOnce(() => fileId)
    toMockedFunction(getUserId).mockImplementationOnce(() => userId)
  })

  it('returns file', async () => {
    toMockedFunction(documentExistsById).mockImplementationOnce(() =>
      Promise.resolve(true),
    )
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
    expect(
      await getFileDownloadLinkById(
        createMockEvent(),
        createMockContext(),
        jest.fn(),
      ),
    ).toMatchInlineSnapshot(`
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
    toMockedFunction(documentExistsById).mockImplementationOnce(() =>
      Promise.resolve(true),
    )
    toMockedFunction(getFileByIdAndDocumentId).mockImplementationOnce(() =>
      Promise.resolve(null),
    )
    expect(
      await getFileDownloadLinkById(
        createMockEvent(),
        createMockContext(),
        jest.fn(),
      ),
    ).toMatchInlineSnapshot(`
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
    toMockedFunction(documentExistsById).mockImplementationOnce(() =>
      Promise.resolve(false),
    )
    expect(
      await getFileDownloadLinkById(
        createMockEvent(),
        createMockContext(),
        jest.fn(),
      ),
    ).toMatchInlineSnapshot(`
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
