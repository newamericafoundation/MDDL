import { handler as listAccountActivity } from './listAccountActivity'
import {
  createMockEvent,
  getObjectKeys,
  mockUserData,
  setUserId,
  toMockedFunction,
} from '@/utils/test'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

jest.mock('@/utils/database')
jest.mock('@/services/user')

describe('listAccountActivity', () => {
  const userId = 'myUserId'
  let event: APIGatewayProxyEventV2

  beforeEach(() => {
    mockUserData(userId)
    event = setUserId(
      userId,
      createMockEvent({
        pathParameters: {
          userId,
        },
      }),
    )
  })

  it('returns mock data', async () => {
    expect(await listAccountActivity(event)).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"activity\\":[{\\"date\\":\\"2020-11-10T12:43:00Z\\",\\"principal\\":{\\"id\\":\\"83B7646C-0275-41BC-8800-DC0246BEE3E7\\",\\"name\\":\\"sharon.harrison@cbo.org\\"},\\"requestId\\":\\"53A95AB4-CE20-4E07-924D-18D472A6A26D\\",\\"type\\":\\"COLLECTION.CREATED\\",\\"resource\\":{\\"type\\":\\"COLLECTION\\",\\"id\\":\\"910E0555-0C0D-404A-8A35-AFB031CCD786\\",\\"name\\":\\"Shared Files 10 Nov 2020\\"},\\"relatedResources\\":[{\\"id\\":\\"01347969-4511-4C7F-A0D2-6395839DD2CF\\",\\"name\\":\\"Social security card\\",\\"type\\":\\"DOCUMENT\\"},{\\"id\\":\\"BC1032DC-9ED6-4C01-AF47-F909FACAB9F0\\",\\"name\\":\\"Water bill\\",\\"type\\":\\"DOCUMENT\\"},{\\"id\\":\\"D64C50F4-FFB2-4B51-A1D0-4D45DA4EA82B\\",\\"name\\":\\"mycityagent2@nyc.gov\\",\\"type\\":\\"COLLECTION.INDIVIDUAL_EMAIL_GRANT\\"}]},{\\"date\\":\\"2020-10-30T15:43:00Z\\",\\"principal\\":{\\"id\\":\\"694052A1-8E17-46AA-92BB-35F2AB2144EB\\",\\"name\\":\\"felix@ny.gov\\"},\\"requestId\\":\\"BC9DFD18-A001-4462-A7FD-4571F6598B50\\",\\"type\\":\\"DOCUMENT.ACCESSED\\",\\"resource\\":{\\"id\\":\\"01347969-4511-4C7F-A0D2-6395839DD2CF\\",\\"name\\":\\"Social security card\\",\\"type\\":\\"DOCUMENT\\"}},{\\"date\\":\\"2020-10-30T15:43:00Z\\",\\"principal\\":{\\"id\\":\\"694052A1-8E17-46AA-92BB-35F2AB2144EB\\",\\"name\\":\\"felix@ny.gov\\"},\\"requestId\\":\\"11471E8F-9DF5-4016-812B-601FA631A390\\",\\"type\\":\\"DOCUMENT.ACCESSED\\",\\"resource\\":{\\"id\\":\\"BC1032DC-9ED6-4C01-AF47-F909FACAB9F0\\",\\"name\\":\\"Water bill\\",\\"type\\":\\"DOCUMENT\\"}},{\\"date\\":\\"2020-09-28T04:12:00Z\\",\\"principal\\":{\\"id\\":\\"myUserId\\",\\"name\\":\\"jcitizen@example.com\\"},\\"requestId\\":\\"53A95AB4-CE20-4E07-924D-18D472A6A26D\\",\\"type\\":\\"COLLECTION.CREATED\\",\\"resource\\":{\\"type\\":\\"COLLECTION\\",\\"id\\":\\"910E0555-0C0D-404A-8A35-AFB031CCD786\\",\\"name\\":\\"Shared Files 10 Nov 2020\\"},\\"relatedResources\\":[{\\"id\\":\\"01347969-4511-4C7F-A0D2-6395839DD2CF\\",\\"name\\":\\"Social security card\\",\\"type\\":\\"DOCUMENT\\"},{\\"id\\":\\"BC1032DC-9ED6-4C01-AF47-F909FACAB9F0\\",\\"name\\":\\"Water bill\\",\\"type\\":\\"DOCUMENT\\"},{\\"id\\":\\"D64C50F4-FFB2-4B51-A1D0-4D45DA4EA82B\\",\\"name\\":\\"mycityagent1@nyc.gov\\",\\"type\\":\\"COLLECTION.INDIVIDUAL_EMAIL_GRANT\\"}]},{\\"date\\":\\"2020-09-15T06:20:00Z\\",\\"principal\\":{\\"id\\":\\"83B7646C-0275-41BC-8800-DC0246BEE3E7\\",\\"name\\":\\"sharon.harrison@cbo.org\\"},\\"requestId\\":\\"11471E8F-9DF5-4016-812B-601FA631A390\\",\\"type\\":\\"DOCUMENT.CREATED\\",\\"resource\\":{\\"id\\":\\"BC1032DC-9ED6-4C01-AF47-F909FACAB9F0\\",\\"name\\":\\"Water bill\\",\\"type\\":\\"DOCUMENT\\"}},{\\"date\\":\\"2020-09-15T06:15:00Z\\",\\"principal\\":{\\"id\\":\\"83B7646C-0275-41BC-8800-DC0246BEE3E7\\",\\"name\\":\\"sharon.harrison@cbo.org\\"},\\"requestId\\":\\"11471E8F-9DF5-4016-812B-601FA631A390\\",\\"type\\":\\"DOCUMENT.EDITED\\",\\"resource\\":{\\"id\\":\\"01347969-4511-4C7F-A0D2-6395839DD2CF\\",\\"name\\":\\"SSN\\",\\"type\\":\\"DOCUMENT\\",\\"changes\\":[{\\"field\\":\\"name\\",\\"newValue\\":\\"Social security card\\",\\"oldValue\\":\\"SSN\\"}]}},{\\"date\\":\\"2020-09-15T06:10:00Z\\",\\"principal\\":{\\"id\\":\\"myUserId\\",\\"name\\":\\"jcitizen@example.com\\"},\\"requestId\\":\\"11471E8F-9DF5-4016-812B-601FA631A390\\",\\"type\\":\\"DOCUMENT.CREATED\\",\\"resource\\":{\\"id\\":\\"01347969-4511-4C7F-A0D2-6395839DD2CF\\",\\"name\\":\\"SSN\\",\\"type\\":\\"DOCUMENT\\"}}]}",
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
