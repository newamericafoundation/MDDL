import { DocumentList as DocumentListContract } from 'api-client'
import { getDocumentsByOwnerId } from '@/models/document'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { createDocumentListItem } from '@/services/documents'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import {
  requirePermissionToUser,
  UserPermission,
} from '@/services/users/authorization'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'

connectDatabase()

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
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
