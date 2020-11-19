import {
  ActivityActionTypeEnum,
  ActivityList,
  ActivityResourceTypeEnum,
} from 'api-client'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import {
  requirePermissionToUser,
  UserPermission,
} from '@/services/users/authorization'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'
import { User } from '@/models/user'

connectDatabase()
type Request = APIGatewayRequest & { ownerId: string; user: User }

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
  requirePermissionToUser(UserPermission.ListActivity),
  async (request: APIGatewayRequest): Promise<ActivityList> => {
    const { ownerId, user } = request as Request
    return {
      activity: [
        {
          date: '2020-11-10T12:43:00Z',
          principal: {
            id: '83B7646C-0275-41BC-8800-DC0246BEE3E7',
            name: 'sharon.harrison@cbo.org',
          },
          requestId: '53A95AB4-CE20-4E07-924D-18D472A6A26D',
          type: ActivityActionTypeEnum.COLLECTIONCREATED,
          resource: {
            type: ActivityResourceTypeEnum.COLLECTION,
            id: '910E0555-0C0D-404A-8A35-AFB031CCD786',
            name: 'Shared Files 10 Nov 2020',
          },
          relatedResources: [
            {
              id: '01347969-4511-4C7F-A0D2-6395839DD2CF',
              name: 'Social security card',
              type: ActivityResourceTypeEnum.DOCUMENT,
            },
            {
              id: 'BC1032DC-9ED6-4C01-AF47-F909FACAB9F0',
              name: 'Water bill',
              type: ActivityResourceTypeEnum.DOCUMENT,
            },
            {
              id: 'D64C50F4-FFB2-4B51-A1D0-4D45DA4EA82B',
              name: 'mycityagent2@nyc.gov',
              type: ActivityResourceTypeEnum.COLLECTIONINDIVIDUALEMAILGRANT,
            },
          ],
        },
        {
          date: '2020-10-30T15:43:00Z',
          principal: {
            id: '694052A1-8E17-46AA-92BB-35F2AB2144EB',
            name: 'felix@ny.gov',
          },
          requestId: 'BC9DFD18-A001-4462-A7FD-4571F6598B50',
          type: ActivityActionTypeEnum.DOCUMENTACCESSED,
          resource: {
            id: '01347969-4511-4C7F-A0D2-6395839DD2CF',
            name: 'Social security card',
            type: ActivityResourceTypeEnum.DOCUMENT,
          },
        },
        {
          date: '2020-10-30T15:43:00Z',
          principal: {
            id: '694052A1-8E17-46AA-92BB-35F2AB2144EB',
            name: 'felix@ny.gov',
          },
          requestId: '11471E8F-9DF5-4016-812B-601FA631A390',
          type: ActivityActionTypeEnum.DOCUMENTACCESSED,
          resource: {
            id: 'BC1032DC-9ED6-4C01-AF47-F909FACAB9F0',
            name: 'Water bill',
            type: ActivityResourceTypeEnum.DOCUMENT,
          },
        },
        {
          date: '2020-09-28T04:12:00Z',
          principal: {
            id: ownerId,
            name: user.email as string,
          },
          requestId: '53A95AB4-CE20-4E07-924D-18D472A6A26D',
          type: ActivityActionTypeEnum.COLLECTIONCREATED,
          resource: {
            type: ActivityResourceTypeEnum.COLLECTION,
            id: '910E0555-0C0D-404A-8A35-AFB031CCD786',
            name: 'Shared Files 10 Nov 2020',
          },
          relatedResources: [
            {
              id: '01347969-4511-4C7F-A0D2-6395839DD2CF',
              name: 'Social security card',
              type: ActivityResourceTypeEnum.DOCUMENT,
            },
            {
              id: 'BC1032DC-9ED6-4C01-AF47-F909FACAB9F0',
              name: 'Water bill',
              type: ActivityResourceTypeEnum.DOCUMENT,
            },
            {
              id: 'D64C50F4-FFB2-4B51-A1D0-4D45DA4EA82B',
              name: 'mycityagent1@nyc.gov',
              type: ActivityResourceTypeEnum.COLLECTIONINDIVIDUALEMAILGRANT,
            },
          ],
        },
        {
          date: '2020-09-15T06:20:00Z',
          principal: {
            id: '83B7646C-0275-41BC-8800-DC0246BEE3E7',
            name: 'sharon.harrison@cbo.org',
          },
          requestId: '11471E8F-9DF5-4016-812B-601FA631A390',
          type: ActivityActionTypeEnum.DOCUMENTCREATED,
          resource: {
            id: 'BC1032DC-9ED6-4C01-AF47-F909FACAB9F0',
            name: 'Water bill',
            type: ActivityResourceTypeEnum.DOCUMENT,
          },
        },
        {
          date: '2020-09-15T06:15:00Z',
          principal: {
            id: '83B7646C-0275-41BC-8800-DC0246BEE3E7',
            name: 'sharon.harrison@cbo.org',
          },
          requestId: '11471E8F-9DF5-4016-812B-601FA631A390',
          type: ActivityActionTypeEnum.DOCUMENTEDITED,
          resource: {
            id: '01347969-4511-4C7F-A0D2-6395839DD2CF',
            name: 'SSN',
            type: ActivityResourceTypeEnum.DOCUMENT,
            changes: [
              {
                field: 'name',
                newValue: 'Social security card',
                oldValue: 'SSN',
              },
            ],
          },
        },
        {
          date: '2020-09-15T06:10:00Z',
          principal: {
            id: ownerId,
            name: user.email as string,
          },
          requestId: '11471E8F-9DF5-4016-812B-601FA631A390',
          type: ActivityActionTypeEnum.DOCUMENTCREATED,
          resource: {
            id: '01347969-4511-4C7F-A0D2-6395839DD2CF',
            name: 'SSN',
            type: ActivityResourceTypeEnum.DOCUMENT,
          },
        },
      ],
    }
  },
)
