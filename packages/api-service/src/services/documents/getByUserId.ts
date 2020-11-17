import { DocumentList as DocumentListContract } from 'api-client'
import { getDocumentsByOwnerId } from '@/models/document'
import { requirePathParameter, requireUserId } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { createDocumentListItem } from '@/services/documents'
import {
  APIGatewayRequest,
  createApiGatewayHandler,
  setContext,
} from '@/utils/middleware'
import {
  requirePermissionToUser,
  UserPermission,
} from '@/services/users/authorization'

connectDatabase()

export const handler = createApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
  setContext('userId', (r) => requireUserId(r.event)),
  requirePermissionToUser(UserPermission.ListDocuments),
  async (request: APIGatewayRequest): Promise<DocumentListContract> => {
    const { ownerId } = request
    const foundDocuments = await getDocumentsByOwnerId(ownerId)
    return {
      documents: foundDocuments.map(createDocumentListItem),
    }
  },
)

export default handler
