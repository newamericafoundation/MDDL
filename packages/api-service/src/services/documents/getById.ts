import { Document as DocumentContract } from 'api-client'
import { requirePathParameter, requireUserId } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { singleDocumentResult } from '@/services/documents'
import {
  APIGatewayRequest,
  createApiGatewayHandler,
  setContext,
} from '@/utils/middleware'
import {
  requirePermissionToDocument,
  DocumentPermission,
} from '@/services/documents/authorization'
import { getSingleDocumentById } from '@/models/document'

connectDatabase()

export const handler = createApiGatewayHandler(
  setContext('documentId', (r) => requirePathParameter(r.event, 'documentId')),
  setContext('userId', (r) => requireUserId(r.event)),
  setContext('document', (r) => getSingleDocumentById(r.documentId)),
  requirePermissionToDocument(DocumentPermission.GetDocument),
  async (request: APIGatewayRequest): Promise<DocumentContract> => {
    const { document } = request
    return await singleDocumentResult(document)
  },
)

export default handler
