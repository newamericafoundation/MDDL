import {
  CollectionGrantType,
  SharedCollectionList as SharedCollectionListContract,
} from 'api-client'
import { requirePathParameter, requireUserId } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { getCollectionsByGrantType } from '@/models/collection'
import {
  APIGatewayRequest,
  createApiGatewayHandler,
  setContext,
} from '@/utils/middleware'
import { requirePermissionToAgent, UserPermission } from '../user/authorization'
import { requireUserData } from '@/services/user'
import { getUsersById, User } from '@/models/user'
import { formatSharedCollections } from '@/services/collections'
import { CollectionPermission } from './authorization'

connectDatabase()

export const handler = createApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
  setContext('userId', (r) => requireUserId(r.event)),
  setContext('user', async (r) => await requireUserData(r)),
  requirePermissionToAgent(UserPermission.ListCollections),
  async (request: APIGatewayRequest): Promise<SharedCollectionListContract> => {
    const { user } = (request as unknown) as APIGatewayRequest & { user: User }
    const foundCollections = await getCollectionsByGrantType(
      CollectionGrantType.INDIVIDUALEMAIL,
      user.email as string, // checked in auth layer
    )
    const userIds = [...new Set(foundCollections.map((c) => c.ownerId))]
    let foundOwners: User[] = []
    if (userIds.length) {
      foundOwners = await getUsersById(userIds)
    }
    return formatSharedCollections(foundCollections, foundOwners, [
      CollectionPermission.ListDocuments,
    ])
  },
)

export default handler
