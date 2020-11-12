import createCollectionForUser from './createCollectionForUser'
import {
  createMockEvent,
  getObjectKeys,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda'
import {
  createCollection,
  Collection as CollectionModel,
} from '@/models/collection'
import { allDocumentsExistById } from '@/models/document'
import { emailIsWhitelisted } from '@/utils/whitelist'

jest.mock('@/utils/database')
jest.mock('@/utils/s3')
jest.mock('@/utils/whitelist')
jest.mock('@/models/collection')
jest.mock('@/models/document')
jest.mock('@/services/user')
jest.mock('@/services/emails')
jest.mock('@/config')

describe('createCollectionForUser', () => {
  const userId = 'myUserId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    mockUserData(userId)
    toMockedFunction(emailIsWhitelisted).mockImplementationOnce(() => true)
    toMockedFunction(allDocumentsExistById).mockImplementationOnce(
      async () => true,
    )
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
    expect(await createCollectionForUser(event)).toEqual(
      expect.objectContaining({
        body: '{"message":"validation error: body was expected but empty"}',
      }),
    )
  })

  it('validation is applied', async () => {
    event.body = JSON.stringify({})
    expect(await createCollectionForUser(event)).toEqual(
      expect.objectContaining({
        body:
          '{"message":"validation error: \\"name\\" is required, \\"documentIds\\" is required, \\"individualEmailAddresses\\" is required"}',
      }),
    )
  })

  it('fails validation with unwhitelisted email address', async () => {
    toMockedFunction(emailIsWhitelisted)
      .mockReset()
      .mockImplementationOnce(() => false)
    event.body = JSON.stringify({
      name: 'test',
      documentIds: ['abc1234'],
      individualEmailAddresses: ['exampleagent@example.com'],
    })
    expect(await createCollectionForUser(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"validation error: \\\\\\"individualEmailAddresses[0]\\\\\\" failed custom validation because exampleagent@example.com is not a whitelisted email address\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 400,
      }
    `)
  })

  it('validation requires documentIds to be populated', async () => {
    event.body = JSON.stringify({
      name: 'test',
      documentIds: [],
      individualEmailAddresses: [],
    })
    expect(await createCollectionForUser(event)).toEqual(
      expect.objectContaining({
        body:
          '{"message":"validation error: \\"documentIds\\" must contain at least 1 items"}',
      }),
    )
  })

  it('fails if documents do not belong to user', async () => {
    event.body = JSON.stringify({
      name: 'test',
      documentIds: ['abc1234'],
      individualEmailAddresses: ['exampleagent@example.com'],
    })
    toMockedFunction(allDocumentsExistById)
      .mockReset()
      .mockImplementationOnce(async () => false)
    expect(await createCollectionForUser(event)).toEqual(
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
    event.body = JSON.stringify({
      name: 'test',
      documentIds: ['abc1234'],
      individualEmailAddresses: ['exampleagent@example.com'],
    })
    const result = (await createCollectionForUser(
      event,
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
        "name",
        "createdDate",
        "id",
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
