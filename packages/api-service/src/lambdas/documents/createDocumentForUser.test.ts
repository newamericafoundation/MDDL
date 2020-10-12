import createDocumentForUser from './createDocumentForUser'
import { getPathParameter, getUserId } from '@/utils/api-gateway'
import { createDocument, Document as DocumentModel } from '@/models/document'
import {
  createMockContext,
  createMockEvent,
  toMockedFunction,
} from '@/utils/test'
import { createFilePath } from '@/utils/s3'
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

jest.mock('@/utils/s3', () => {
  const module = jest.requireActual('@/utils/s3')
  return {
    ...module,
    getPresignedUploadUrl: (
      path: string,
      contentType: string,
      contentLength: number,
      sha256Checksum: string,
    ) =>
      Promise.resolve({
        url: `https://presigned-url.for/${path}+${sha256Checksum}`,
        fields: {
          'Content-Type': contentType,
          'Content-Length': contentLength,
        },
      }),
  }
})

jest.mock('@/models/document', () => {
  const module = jest.requireActual('@/models/document')
  return {
    ...module,
    createDocument: jest.fn(),
  }
})

describe('createDocumentForUser', () => {
  const userId = 'myUserId'

  beforeEach(() => {
    toMockedFunction(getPathParameter).mockImplementationOnce(() => userId)
    toMockedFunction(getUserId).mockImplementationOnce(() => userId)
  })

  it('fails validation on no body', async () => {
    expect(
      await createDocumentForUser(
        createMockEvent(),
        createMockContext(),
        jest.fn(),
      ),
    ).toEqual(
      expect.objectContaining({
        body: '{"message":"body not supplied"}',
      }),
    )
  })

  it('validation requires name', async () => {
    const event = createMockEvent()
    event.body = JSON.stringify({})
    expect(
      await createDocumentForUser(event, createMockContext(), jest.fn()),
    ).toEqual(
      expect.objectContaining({
        body: '{"message":"validation error: \\"name\\" is required"}',
      }),
    )
  })

  it('validation requires files', async () => {
    const event = createMockEvent()
    event.body = JSON.stringify({ name: 'test' })
    expect(
      await createDocumentForUser(event, createMockContext(), jest.fn()),
    ).toEqual(
      expect.objectContaining({
        body: '{"message":"validation error: \\"files\\" is required"}',
      }),
    )
  })

  it('validation requires files to be populated', async () => {
    const event = createMockEvent()
    event.body = JSON.stringify({ name: 'test', files: [] })
    expect(
      await createDocumentForUser(event, createMockContext(), jest.fn()),
    ).toEqual(
      expect.objectContaining({
        body:
          '{"message":"validation error: \\"files\\" must contain at least 1 items"}',
      }),
    )
  })

  it('validation requires file to populated correctly', async () => {
    const event = createMockEvent()
    event.body = JSON.stringify({ name: 'test', files: [{}] })
    expect(
      await createDocumentForUser(event, createMockContext(), jest.fn()),
    ).toEqual(
      expect.objectContaining({
        body: '{"message":"validation error: \\"files[0].name\\" is required"}',
      }),
    )
  })

  it('validation passes', async () => {
    const ownerId = 'myOwnerId'
    const documentId = 'myDocumentId'
    const fileId = 'myFileId'
    toMockedFunction(createDocument).mockImplementationOnce(() =>
      Promise.resolve(
        DocumentModel.fromJson({
          id: documentId,
          ownerId: documentId,
          name: 'My First File',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          files: [
            {
              id: fileId,
              documentId,
              name: 'MyFile1.jpg',
              path: createFilePath(ownerId, documentId, fileId),
              received: false,
              sha256Checksum: 'ABC123',
              contentType: 'image/jpeg',
              createdAt: new Date('2015-01-12T13:14:15Z'),
              createdBy: ownerId,
              contentLength: 1000,
            },
          ],
        }),
      ),
    )
    const event = createMockEvent()
    event.body = JSON.stringify({
      name: 'test',
      files: [
        {
          name: 'MyFile1.jpg',
          contentLength: 1000,
          contentType: 'image/jpeg',
          sha256Checksum: 'ABC123',
        },
      ],
    })
    const result = (await createDocumentForUser(
      event,
      createMockContext(),
      jest.fn(),
    )) as APIGatewayProxyStructuredResultV2
    expect(result.statusCode).toEqual(200)
    expect(JSON.parse(result.body as string)).toEqual(
      expect.objectContaining({
        createdDate: '2015-01-12T13:14:15.000Z',
        name: 'My First File',
        id: 'myDocumentId',
        files: [
          {
            createdDate: '2015-01-12T13:14:15.000Z',
            id: 'myFileId',
            links: [
              {
                href:
                  'https://presigned-url.for/documents/myOwnerId/myDocumentId/myFileId+ABC123',
                includeFormData: {
                  'Content-Length': 1000,
                  'Content-Type': 'image/jpeg',
                },
                rel: 'upload',
                type: 'POST',
              },
            ],
            name: 'MyFile1.jpg',
            sha256Checksum: 'ABC123',
          },
        ],
        links: [],
      }),
    )
  })
})
