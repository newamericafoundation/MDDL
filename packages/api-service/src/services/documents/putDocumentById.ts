import { UpdateDocumentInput, updateDocument } from '@/models/document'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { putDocumentSchema } from './validation'
import { DocumentUpdate } from 'api-client'
import {
  APIGatewayRequestBody,
  requireValidBody,
  setContext,
} from '@/utils/middleware'
import {
  DocumentPermission,
  requirePermissionToDocument,
} from './authorization'
import createError from 'http-errors'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'

connectDatabase()

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('documentId', (r) => requirePathParameter(r.event, 'documentId')),
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
