import getByUserId from './getByUserId'
import {
  getDocumentsByOwnerId,
  Document as DocumentModel,
} from '@/models/document'
import { createMockEvent, setUserId, toMockedFunction } from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

jest.mock('@/utils/database')
jest.mock('@/models/document')
jest.mock('@/utils/s3')

describe('getByUserId', () => {
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

  it('returns document', async () => {
    toMockedFunction(getDocumentsByOwnerId).mockImplementationOnce(() =>
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
          thumbnailPath: 'my-thumbnail-path',
        }),
      ]),
    )
    expect(await getByUserId(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"documents\\":[{\\"name\\":\\"My First File\\",\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"id\\":\\"myDocumentId1\\",\\"links\\":[{\\"href\\":\\"/documents/myDocumentId1\\",\\"rel\\":\\"self\\",\\"type\\":\\"GET\\"}]},{\\"name\\":\\"My Second File\\",\\"createdDate\\":\\"2015-01-27T13:14:15.000Z\\",\\"id\\":\\"myDocumentId2\\",\\"links\\":[{\\"href\\":\\"/documents/myDocumentId2\\",\\"rel\\":\\"self\\",\\"type\\":\\"GET\\"},{\\"href\\":\\"https://presigned-url.for/my-thumbnail-path\\",\\"rel\\":\\"thumbnail\\",\\"type\\":\\"GET\\"}]}]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('returns empty when none found', async () => {
    toMockedFunction(getDocumentsByOwnerId).mockImplementationOnce(() =>
      Promise.resolve([]),
    )
    expect(await getByUserId(event)).toMatchInlineSnapshot(`
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
})
