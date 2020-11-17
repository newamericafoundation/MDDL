import {
  CollectionList as CollectionListContract,
  CollectionListItem,
} from 'api-client'
import { requirePathParameter, requireUserId } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { getCollectionsByOwnerId } from '@/models/collection'
import {
  APIGatewayRequest,
  createApiGatewayHandler,
  setContext,
} from '@/utils/middleware'
import {
  requirePermissionToUser,
  UserPermission,
} from '@/services/users/authorization'
import { formatCollections } from '@/services/collections'
import { CollectionPermission } from './authorization'

connectDatabase()

export const handler = createApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
  setContext('userId', (r) => requireUserId(r.event)),
  requirePermissionToUser(UserPermission.ListCollections),
  async (request: APIGatewayRequest): Promise<CollectionListContract> => {
    const { ownerId } = request
    const foundCollections = await getCollectionsByOwnerId(ownerId)
    return formatCollections(foundCollections, [
      CollectionPermission.ListDocuments,
      CollectionPermission.ListGrants,
    ])
  },
)

export default handler
