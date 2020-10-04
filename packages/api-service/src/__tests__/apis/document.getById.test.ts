import { getById } from '../../apis/document'
import { getPathParameter, getUserId } from '../../utils/api-gateway'
import {
  getDocumentById,
  Document as DocumentModel,
} from '../../models/document'
import {
  createMockContext,
  createMockEvent,
  toMockedFunction,
} from '../helpers'

jest.mock('../../utils/database', () => {
  return {
    connectDatabase: jest.fn(),
  }
})

jest.mock('../../utils/api-gateway', () => {
  const module = jest.requireActual('../../utils/api-gateway')
  return {
    ...module,
    getPathParameter: jest.fn(),
    getUserId: jest.fn(),
  }
})

jest.mock('../../models/document', () => {
  const module = jest.requireActual('../../models/document')
  return {
    ...module,
    getDocumentById: jest.fn(),
  }
})

describe('getById', () => {
  const documentId = 'myDocumentId'
  const userId = 'myUserId'

  beforeEach(() => {
    toMockedFunction(getPathParameter).mockImplementationOnce(() => documentId)
    toMockedFunction(getUserId).mockImplementationOnce(() => userId)
  })

  it('returns document', async () => {
    toMockedFunction(getDocumentById).mockImplementationOnce(() =>
      Promise.resolve(
        DocumentModel.fromJson({
          id: documentId,
          ownerId: documentId,
          format: 'JPEG',
          source: 'SCAN',
          type: undefined,
          createdAt: new Date('2015-01-12T13:14:15Z'),
          filePath: 'myfile/burrito.jpeg',
          fileChecksum:
            'd6ef411b95dd65edea7e5c24e5fa2f7e1fe5505ef790bd65d366967cb181f547',
          fileContentType: 'image/jpeg',
        }),
      ),
    )
    expect(await getById(createMockEvent(), createMockContext(), jest.fn()))
      .toMatchInlineSnapshot(`
      Object {
        "body": "{\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"id\\":\\"myDocumentId\\",\\"format\\":\\"JPEG\\",\\"source\\":\\"SCAN\\"}",
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
    toMockedFunction(getDocumentById).mockImplementationOnce(() =>
      Promise.resolve(null),
    )
    expect(await getById(createMockEvent(), createMockContext(), jest.fn()))
      .toMatchInlineSnapshot(`
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
