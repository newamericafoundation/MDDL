import { Document as DocumentContract } from 'api-client'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { singleDocumentResult } from '@/services/documents'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import {
  requirePermissionToDocument,
  DocumentPermission,
} from '@/services/documents/authorization'
import { getSingleDocumentById } from '@/models/document'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'

connectDatabase()

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('documentId', (r) => requirePathParameter(r.event, 'documentId')),
  setContext('document', (r) => getSingleDocumentById(r.documentId)),
  requirePermissionToDocument(DocumentPermission.GetDocument),
  async (request: APIGatewayRequest): Promise<DocumentContract> => {
    const { document, documentPermissions } = request
    return singleDocumentResult(document, documentPermissions)
  },
)

export default handler
