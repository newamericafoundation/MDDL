import {
  CollectionGrantType,
  SharedCollectionList as SharedCollectionListContract,
} from 'api-client'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { getCollectionsByGrantType } from '@/models/collection'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import {
  requirePermissionToAgent,
  UserPermission,
} from '@/services/users/authorization'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'
import { getUsersById, User } from '@/models/user'
import { formatSharedCollections } from '@/services/collections'
import { CollectionPermission } from './authorization'

connectDatabase()

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
  requirePermissionToAgent(UserPermission.ListCollections),
  async (request: APIGatewayRequest): Promise<SharedCollectionListContract> => {
    const { user } = (request as unknown) as APIGatewayRequest & { user: User }
    const foundCollections = await getCollectionsByGrantType(
      CollectionGrantType.INDIVIDUALEMAIL,
      user.email as string, // checked in auth layer
    )
    const userIds = [
      ...new Set([
        ...foundCollections.map((c) => c.ownerId),
        ...foundCollections.map((c) => c.createdBy),
      ]),
    ]
    let foundUsers: User[] = []
    if (userIds.length) {
      foundUsers = await getUsersById(userIds)
    }
    return formatSharedCollections(foundCollections, foundUsers, [
      CollectionPermission.ListDocuments,
    ])
  },
)

export default handler
