import createDocumentForUser from './createDocumentForUser'
import { getPathParameter, getUserId } from '@/utils/api-gateway'
import {
  countDocumentsByOwnerId,
  createDocument,
  Document as DocumentModel,
} from '@/models/document'
import {
  createMockContext,
  createMockEvent,
  getObjectKeys,
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
    countDocumentsByOwnerId: jest.fn(),
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

  it('checks max count of documents', async () => {
    toMockedFunction(countDocumentsByOwnerId).mockImplementationOnce(
      async () => 100,
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
    expect(result).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"validation error: maximum document count of 100 reached\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 400,
      }
    `)
  })

  it('validation passes', async () => {
    const documentId = 'myDocumentId'
    const fileId = 'myFileId'
    toMockedFunction(createDocument).mockImplementationOnce(() =>
      Promise.resolve(
        DocumentModel.fromJson({
          id: documentId,
          ownerId: userId,
          name: 'My First File',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          createdBy: userId,
          updatedBy: userId,
          files: [
            {
              id: fileId,
              documentId,
              name: 'MyFile1.jpg',
              path: createFilePath(userId, documentId, fileId),
              received: false,
              sha256Checksum: 'ABC123',
              contentType: 'image/jpeg',
              createdAt: new Date('2015-01-12T13:14:15Z'),
              createdBy: userId,
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
    const response = JSON.parse(result.body as string)
    expect(response).toEqual(
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
                  'https://presigned-url.for/documents/myUserId/myDocumentId/myFileId+ABC123',
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
            contentLength: 1000,
          },
        ],
        links: [],
      }),
    )
    expect(getObjectKeys(response)).toMatchInlineSnapshot(`
      Array [
        "createdDate",
        "name",
        "id",
        "files[0].id",
        "files[0].createdDate",
        "files[0].links[0].href",
        "files[0].links[0].rel",
        "files[0].links[0].type",
        "files[0].links[0].includeFormData.Content-Type",
        "files[0].links[0].includeFormData.Content-Length",
        "files[0].name",
        "files[0].sha256Checksum",
        "files[0].contentLength",
      ]
    `)
  })
})
