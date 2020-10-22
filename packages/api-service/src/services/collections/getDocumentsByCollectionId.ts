import { DocumentList as DocumentListContract } from 'api-client'
import { requirePathParameter, requireUserId } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { getDocumentsByCollectionId } from '@/models/collection'
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
  requirePermissionToCollection(CollectionPermission.ListDocuments),
  async (request: APIGatewayRequest): Promise<DocumentListContract> => {
    const { collectionId } = request
    const foundDocuments = await getDocumentsByCollectionId(collectionId)
    return {
      documents: foundDocuments.map(createDocumentListItem),
    }
  },
)

export default handler
