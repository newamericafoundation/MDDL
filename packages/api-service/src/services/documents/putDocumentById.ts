import {
  Document,
  UpdateDocumentInput,
  updateDocument,
} from '@/models/document'
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
import { User } from '@/models/user'
import { changesBetween, submitDocumentEditedEvent } from '@/services/activity'

connectDatabase()

type Request = {
  documentId: string
  user: User
  document: Document
  userId: string
} & APIGatewayRequestBody<DocumentUpdate>

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('documentId', (r) => requirePathParameter(r.event, 'documentId')),
  requirePermissionToDocument(DocumentPermission.WriteDocument),
  requireValidBody<DocumentUpdate>(putDocumentSchema),
  async (request: APIGatewayRequestBody<DocumentUpdate>): Promise<any> => {
    const {
      documentId,
      userId,
      user,
      document: originalDocument,
      body,
      event,
    } = request as Request

    const updatedDate = new Date()
    const document: UpdateDocumentInput = {
      ...body,
      updatedAt: updatedDate,
      updatedBy: userId,
    }

    // submit change event
    await submitDocumentEditedEvent({
      ownerId: originalDocument.ownerId,
      document: originalDocument,
      changes: changesBetween(originalDocument, body),
      event,
      user,
    })

    const updatedDocument = await updateDocument(documentId, document)
    if (!updatedDocument) {
      throw new createError.InternalServerError('document could not be updated')
    }
  },
)

export default handler
