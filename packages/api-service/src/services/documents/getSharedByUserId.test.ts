import { handler } from './getSharedByUserId'
import {
  createMockEvent,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { getUsersById, User } from '@/models/user'
import { emailIsWhitelisted } from '@/utils/whitelist'
import {
  Document,
  documentsInAnyCollectionWithGrantAndOwner,
  SharedDocument,
} from '@/models/document'

jest.mock('@/utils/database')
jest.mock('@/utils/whitelist')
jest.mock('@/models/document')
jest.mock('@/models/collectionGrant')
jest.mock('@/models/user')
jest.mock('@/services/users')
jest.mock('@/config')

describe('getSharedByUserId', () => {
  const userId = 'myUserId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    mockUserData(userId)
    toMockedFunction(emailIsWhitelisted).mockImplementationOnce(() => true)
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          userId,
        },
      }),
    )
  })

  it('returns documents', async () => {
    toMockedFunction(getUsersById).mockImplementationOnce(async () => [
      User.fromDatabaseJson({
        id: userId,
        givenName: 'Creator',
        familyName: 'User',
        email: 'myemail@example.com',
      }),
      User.fromDatabaseJson({
        id: 'mockUser1',
        givenName: 'User1',
        familyName: 'User1',
      }),
      User.fromDatabaseJson({
        id: 'mockUser2',
        givenName: 'User2',
        familyName: 'User2',
      }),
    ])
    toMockedFunction(
      documentsInAnyCollectionWithGrantAndOwner,
    ).mockImplementationOnce(() =>
      Promise.resolve([
        Document.fromDatabaseJson({
          id: 'df2380b9-ca2e-4f4c-9be5-7926b34c21b5',
          name: 'My Test Document 2',
          createdAt: new Date('2015-01-12T13:24:15.000Z'),
          thumbnailPath: null,
          updatedAt: new Date('2015-01-12T13:24:15.000Z'),
          grantCreatedBy: userId,
          grantCreatedAt: new Date('2015-01-17T13:14:15.000Z'),
          documentCollectionCreatedBy: userId,
          documentCollectionCreatedAt: new Date('2015-01-16T13:14:15.000Z'),
        }) as SharedDocument,
        Document.fromDatabaseJson({
          id: '0969dbd8-084e-4412-9260-34bd51f6e930',
          name: 'My Test Document 1',
          createdAt: new Date('2015-01-12T13:14:15.000Z'),
          thumbnailPath: null,
          updatedAt: new Date('2015-01-12T13:14:15.000Z'),
          grantCreatedBy: 'mockUser1',
          grantCreatedAt: new Date('2015-01-18T13:14:15.000Z'),
          documentCollectionCreatedBy: 'mockUser1',
          documentCollectionCreatedAt: new Date('2015-01-18T13:14:15.000Z'),
        }) as SharedDocument,
      ]),
    )
    expect(await handler(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"sharedDocuments\\":[{\\"document\\":{\\"name\\":\\"My Test Document 2\\",\\"createdDate\\":\\"2015-01-12T13:24:15.000Z\\",\\"id\\":\\"df2380b9-ca2e-4f4c-9be5-7926b34c21b5\\",\\"links\\":[{\\"href\\":\\"/documents/df2380b9-ca2e-4f4c-9be5-7926b34c21b5\\",\\"rel\\":\\"self\\",\\"type\\":\\"GET\\"}]},\\"latestShareInformation\\":{\\"sharedBy\\":{\\"id\\":\\"myUserId\\",\\"name\\":\\"Creator User\\",\\"email\\":\\"myemail@example.com\\"},\\"sharedDate\\":\\"2015-01-17T13:14:15.000Z\\"}},{\\"document\\":{\\"name\\":\\"My Test Document 1\\",\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"id\\":\\"0969dbd8-084e-4412-9260-34bd51f6e930\\",\\"links\\":[{\\"href\\":\\"/documents/0969dbd8-084e-4412-9260-34bd51f6e930\\",\\"rel\\":\\"self\\",\\"type\\":\\"GET\\"}]},\\"latestShareInformation\\":{\\"sharedBy\\":{\\"id\\":\\"mockUser1\\",\\"name\\":\\"User1 User1\\",\\"email\\":null},\\"sharedDate\\":\\"2015-01-18T13:14:15.000Z\\"}}]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('returns 404 when user doesnt exist', async () => {
    mockUserData('otherUserId')
    toMockedFunction(getUsersById).mockImplementationOnce(async () => [])
    expect(await handler(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"user not found\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 404,
      }
    `)
  })
  it('returns empty when none found', async () => {
    expect(await handler(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"sharedDocuments\\":[]}",
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
