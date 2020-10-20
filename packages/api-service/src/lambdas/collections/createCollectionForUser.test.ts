import createCollectionForUser from './createCollectionForUser'
import { getPathParameter, getUserId } from '@/utils/api-gateway'
import {
  createMockContext,
  createMockEvent,
  getObjectKeys,
  toMockedFunction,
} from '@/utils/test'
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import {
  createCollection,
  Collection as CollectionModel,
} from '@/models/collection'
import { allDocumentsExistById } from '@/models/document'

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

jest.mock('@/models/collection', () => {
  const module = jest.requireActual('@/models/collection')
  return {
    ...module,
    createCollection: jest.fn(),
  }
})

jest.mock('@/models/document', () => {
  const module = jest.requireActual('@/models/document')
  return {
    ...module,
    allDocumentsExistById: jest.fn(),
  }
})

describe('createCollectionForUser', () => {
  const userId = 'myUserId'

  beforeEach(() => {
    toMockedFunction(getPathParameter).mockImplementationOnce(() => userId)
    toMockedFunction(getUserId).mockImplementationOnce(() => userId)
    toMockedFunction(allDocumentsExistById).mockImplementationOnce(
      async () => true,
    )
  })

  it('fails validation on no body', async () => {
    expect(
      await createCollectionForUser(
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
      await createCollectionForUser(event, createMockContext(), jest.fn()),
    ).toEqual(
      expect.objectContaining({
        body: '{"message":"validation error: \\"name\\" is required"}',
      }),
    )
  })

  it('validation requires documentIds', async () => {
    const event = createMockEvent()
    event.body = JSON.stringify({ name: 'test' })
    expect(
      await createCollectionForUser(event, createMockContext(), jest.fn()),
    ).toEqual(
      expect.objectContaining({
        body: '{"message":"validation error: \\"documentIds\\" is required"}',
      }),
    )
  })

  it('validation requires documentIds to be populated', async () => {
    const event = createMockEvent()
    event.body = JSON.stringify({ name: 'test', documentIds: [] })
    expect(
      await createCollectionForUser(event, createMockContext(), jest.fn()),
    ).toEqual(
      expect.objectContaining({
        body:
          '{"message":"validation error: \\"documentIds\\" must contain at least 1 items"}',
      }),
    )
  })

  it('validation requires individualEmailAddresses', async () => {
    const event = createMockEvent()
    event.body = JSON.stringify({ name: 'test', documentIds: ['abc1234'] })
    expect(
      await createCollectionForUser(event, createMockContext(), jest.fn()),
    ).toEqual(
      expect.objectContaining({
        body:
          '{"message":"validation error: \\"individualEmailAddresses\\" is required"}',
      }),
    )
  })

  // relaxing this requirement for now till agency operations are completed
  // it('validation requires agencyOfficersEmailAddresses to be populated', async () => {
  //   const event = createMockEvent()
  //   event.body = JSON.stringify({
  //     name: 'test',
  //     documentIds: ['abc1234'],
  //     agencyOfficersEmailAddresses: [],
  //   })
  //   expect(
  //     await createCollectionForUser(event, createMockContext(), jest.fn()),
  //   ).toEqual(
  //     expect.objectContaining({
  //       body:
  //         '{"message":"validation error: \\"agencyOfficersEmailAddresses\\" must contain at least 1 items"}',
  //     }),
  //   )
  // })

  it('fails if documents do not belong to user', async () => {
    const event = createMockEvent()
    event.body = JSON.stringify({
      name: 'test',
      documentIds: ['abc1234'],
      individualEmailAddresses: ['exampleagent@example.com'],
    })
    toMockedFunction(allDocumentsExistById)
      .mockReset()
      .mockImplementationOnce(async () => false)
    expect(
      await createCollectionForUser(event, createMockContext(), jest.fn()),
    ).toEqual(
      expect.objectContaining({
        body: '{"message":"validation error: documents not found"}',
      }),
    )
  })

  it('creates collection', async () => {
    const ownerId = 'myOwnerId'
    const documentId = 'myDocumentId'
    toMockedFunction(createCollection).mockImplementationOnce(() =>
      Promise.resolve(
        CollectionModel.fromJson({
          id: documentId,
          ownerId: ownerId,
          name: 'My First File',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          createdBy: ownerId,
          updatedBy: ownerId,
        }),
      ),
    )
    const event = createMockEvent()
    event.body = JSON.stringify({
      name: 'test',
      documentIds: ['abc1234'],
      individualEmailAddresses: ['exampleagent@example.com'],
    })
    const result = (await createCollectionForUser(
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
        id: documentId,
        links: expect.arrayContaining([
          expect.objectContaining({ rel: 'grants' }),
          expect.objectContaining({ rel: 'documents' }),
        ]),
      }),
    )
    expect(getObjectKeys(response)).toMatchInlineSnapshot(`
      Array [
        "createdDate",
        "id",
        "name",
        "links[0].href",
        "links[0].rel",
        "links[0].type",
        "links[1].href",
        "links[1].rel",
        "links[1].type",
      ]
    `)
  })
})
