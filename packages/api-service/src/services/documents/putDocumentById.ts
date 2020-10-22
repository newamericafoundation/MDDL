import { UpdateDocumentInput, updateDocument } from '@/models/document'
import { requirePathParameter, requireUserId } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { putDocumentSchema } from './validation'
import { DocumentUpdate } from 'api-client'
import {
  APIGatewayRequestBody,
  createApiGatewayHandler,
  requireValidBody,
  setContext,
} from '@/utils/middleware'
import {
  DocumentPermission,
  requirePermissionToDocument,
} from './authorization'
import createError from 'http-errors'

connectDatabase()

export const handler = createApiGatewayHandler(
  setContext('documentId', (r) => requirePathParameter(r.event, 'documentId')),
  setContext('userId', (r) => requireUserId(r.event)),
  requirePermissionToDocument(DocumentPermission.WriteDocument),
  requireValidBody<DocumentUpdate>(putDocumentSchema),
  async (request: APIGatewayRequestBody<DocumentUpdate>): Promise<any> => {
    const { documentId, userId, body } = request

    const updatedDate = new Date()
    const document: UpdateDocumentInput = {
      ...body,
      updatedAt: updatedDate,
      updatedBy: userId,
    }

    const updatedDocument = await updateDocument(documentId, document)
    if (!updatedDocument) {
      throw new createError.InternalServerError('document could not be updated')
    }
  },
)

export default handler
