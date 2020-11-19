import { DocumentList as DocumentListContract } from 'api-client'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { getDocumentsByCollectionId } from '@/models/collection'
import { createDocumentListItem } from '@/services/documents'
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
