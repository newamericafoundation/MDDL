import { CollectionGrantList, CollectionGrantType } from 'api-client'
import { requirePathParameter, requireUserId } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import {
  getDocumentsByCollectionId,
  getGrantsByCollectionId,
} from '@/models/collection'
import { createDocumentListItem } from '@/services/documents'
import {
  APIGatewayRequest,
  createApiGatewayHandler,
  setContext,
} from '@/utils/middleware'
import {
  CollectionPermission,
  requirePermissionToCollection,
} from './authorization'

connectDatabase()

export const handler = createApiGatewayHandler(
  setContext('collectionId', (r) =>
    requirePathParameter(r.event, 'collectionId'),
  ),
  setContext('userId', (r) => requireUserId(r.event)),
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
