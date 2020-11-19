import { CollectionList as CollectionListContract } from 'api-client'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { getCollectionsByOwnerId } from '@/models/collection'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import {
  requirePermissionToUser,
  UserPermission,
} from '@/services/users/authorization'
import { formatCollections } from '@/services/collections'
import { CollectionPermission } from './authorization'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'

connectDatabase()

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
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
