import { CollectionGrantList, CollectionGrantType } from 'api-client'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { getGrantsByCollectionId } from '@/models/collection'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import {
  CollectionPermission,
  requirePermissionToCollection,
} from './authorization'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'

connectDatabase()

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('collectionId', (r) =>
    requirePathParameter(r.event, 'collectionId'),
  ),
  requirePermissionToCollection(CollectionPermission.ListGrants),
  async (request: APIGatewayRequest): Promise<CollectionGrantList> => {
    const { collectionId } = request
    const foundGrants = await getGrantsByCollectionId(collectionId)
    return {
      collectionGrants: foundGrants
        .filter((g) => g.requirementType == CollectionGrantType.INDIVIDUALEMAIL)
        .map(({ id, createdAt, requirementValue }) => ({
          id,
          type: CollectionGrantType.INDIVIDUALEMAIL,
          createdDate: createdAt.toISOString(),
          individualEmailAddress: requirementValue,
          links: [],
        })),
    }
  },
)

export default handler
