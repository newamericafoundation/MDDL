import getDownloadForCollectionDocuments from './getDownloadForCollectionDocuments'
import { getCollectionById, Collection } from '@/models/collection'
import {
  createMockEvent,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { objectExists } from '@/utils/s3'

jest.mock('@/utils/database')
jest.mock('@/utils/s3')
jest.mock('@/models/collection')
jest.mock('@/services/users')

describe('getDownloadForCollectionDocuments', () => {
  const userId = 'myUserId'
  const collectionId = 'myCollectionId'
  const downloadId = 'myDownloadId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    mockUserData(userId)
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          collectionId,
          downloadId,
        },
      }),
    )
  })

  it('returns success status', async () => {
    toMockedFunction(getCollectionById).mockImplementationOnce(async () =>
      Collection.fromDatabaseJson({
        ownerId: userId,
      }),
    )
    toMockedFunction(objectExists).mockImplementationOnce(async () => true)
    expect(await getDownloadForCollectionDocuments(event))
      .toMatchInlineSnapshot(`
      Object {
        "body": "{\\"id\\":\\"myDownloadId\\",\\"status\\":\\"SUCCESS\\",\\"fileDownload\\":{\\"href\\":\\"https://presigned-url.for/collections/myCollectionId/myDownloadId\\"}}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('returns 404 when collection doesnt exist', async () => {
    expect(await getDownloadForCollectionDocuments(event))
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
  it('returns pending when object not found', async () => {
    toMockedFunction(getCollectionById).mockImplementationOnce(async () =>
      Collection.fromDatabaseJson({
        ownerId: userId,
      }),
    )
    toMockedFunction(objectExists).mockImplementationOnce(async () => false)
    expect(await getDownloadForCollectionDocuments(event))
      .toMatchInlineSnapshot(`
      Object {
        "body": "{\\"id\\":\\"myDownloadId\\",\\"status\\":\\"PENDING\\",\\"fileDownload\\":null}",
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
