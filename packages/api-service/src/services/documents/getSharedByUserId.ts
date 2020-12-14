import {
  CollectionGrantType,
  SharedDocumentsList as SharedDocumentsListContract,
} from 'api-client'
import {
  documentsInAnyCollectionWithGrantAndOwner,
  SharedDocument,
} from '@/models/document'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import {
  requirePermissionToUser,
  UserPermission,
} from '@/services/users/authorization'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'
import { getUsersById, User } from '@/models/user'
import { userToApiSharer } from '../users'
import { createDocumentListItem } from '.'

connectDatabase()

const determineLatestSharingDetails = (
  documents: SharedDocument[],
): {
  [index: string]: { sharerId: string; sharedDate: Date }
} => {
  const latestShareInformation: {
    [index: string]: { sharerId: string; sharedDate: Date }
  } = {}
  documents.forEach((doc) => {
    if (doc.grantCreatedAt > doc.documentCollectionCreatedAt) {
      latestShareInformation[doc.id] = {
        sharerId: doc.grantCreatedBy,
        sharedDate: doc.grantCreatedAt,
      }
    } else {
      latestShareInformation[doc.id] = {
        sharerId: doc.documentCollectionCreatedBy,
        sharedDate: doc.documentCollectionCreatedAt,
      }
    }
  })
  return latestShareInformation
}

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
  requirePermissionToUser(UserPermission.ListSharedDocuments),
  async (request: APIGatewayRequest): Promise<SharedDocumentsListContract> => {
    const { ownerId, user } = request
    const foundDocuments = await documentsInAnyCollectionWithGrantAndOwner(
      ownerId,
      CollectionGrantType.INDIVIDUALEMAIL,
      user.email,
    )
    const latestSharingDetails = determineLatestSharingDetails(foundDocuments)
    const userIds = [
      ...new Set(Object.values(latestSharingDetails).map((l) => l.sharerId)),
    ]
    let foundUsers: User[] = []
    if (userIds.length) {
      foundUsers = await getUsersById(userIds)
    }
    return {
      sharedDocuments: foundDocuments.map((document) => {
        const shareInfo = latestSharingDetails[document.id]
        const sharer = foundUsers.find(
          (u) => u.id === shareInfo.sharerId,
        ) as User
        return {
          document: createDocumentListItem(document),
          latestShareInformation: {
            sharedBy: userToApiSharer(sharer),
            sharedDate: shareInfo.sharedDate.toISOString(),
          },
        }
      }),
    }
  },
)

export default handler
