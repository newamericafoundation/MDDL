import { Document as DocumentContract } from 'api-client'
import { getDocumentById } from '@/models/document'
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
import createError from 'http-errors'

connectDatabase()

export const handler = createApiGatewayHandler(
  setContext('documentId', (r) => requirePathParameter(r.event, 'documentId')),
  setContext('userId', (r) => requireUserId(r.event)),
  requirePermissionToDocument(DocumentPermission.GetDocument),
  async (request: APIGatewayRequest): Promise<DocumentContract> => {
    const { documentId, userId } = request
    const foundDocument = await getDocumentById(documentId, userId)
    if (!foundDocument) {
      throw new createError.InternalServerError('document not found')
    }

    return await singleDocumentResult(foundDocument)
  },
)

export default handler
