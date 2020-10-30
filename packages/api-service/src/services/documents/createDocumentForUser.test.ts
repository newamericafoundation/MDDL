import createDocumentForUser from './createDocumentForUser'
import {
  countDocumentsByOwnerId,
  createDocument,
  Document as DocumentModel,
} from '@/models/document'
import {
  createMockEvent,
  getObjectKeys,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { createFilePath } from '@/utils/s3'
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda'

jest.mock('@/utils/database')
jest.mock('@/utils/s3')
jest.mock('@/models/document')

describe('createDocumentForUser', () => {
  const userId = 'myUserId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          userId,
        },
      }),
    )
  })

  it('fails validation on no body', async () => {
    expect(await createDocumentForUser(event)).toEqual(
      expect.objectContaining({
        body: '{"message":"validation error: body was expected but empty"}',
      }),
    )
  })

  it('validation is applied', async () => {
    event.body = JSON.stringify({})
    expect(await createDocumentForUser(event)).toEqual(
      expect.objectContaining({
        body:
          '{"message":"validation error: \\"name\\" is required, \\"files\\" is required"}',
      }),
    )
  })

  it('validation requires files to be populated', async () => {
    event.body = JSON.stringify({ name: 'test', files: [] })
    expect(await createDocumentForUser(event)).toEqual(
      expect.objectContaining({
        body:
          '{"message":"validation error: \\"files\\" must contain at least 1 items"}',
      }),
    )
  })

  it('validation requires file to populated correctly', async () => {
    event.body = JSON.stringify({ name: 'test', files: [{}] })
    expect(await createDocumentForUser(event)).toEqual(
      expect.objectContaining({
        body:
          '{"message":"validation error: \\"files[0].name\\" is required, \\"files[0].contentLength\\" is required, \\"files[0].contentType\\" is required, \\"files[0].sha256Checksum\\" is required"}',
      }),
    )
  })

  it('checks max count of documents', async () => {
    toMockedFunction(countDocumentsByOwnerId).mockImplementationOnce(
      async () => 100,
    )
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
            contentType: 'image/jpeg',
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
        "files[0].contentType",
        "files[0].contentLength",
        "links[0].href",
        "links[0].rel",
        "links[0].type",
        "links[1].href",
        "links[1].rel",
        "links[1].type",
        "links[2].href",
        "links[2].rel",
        "links[2].type",
      ]
    `)
  })
})
