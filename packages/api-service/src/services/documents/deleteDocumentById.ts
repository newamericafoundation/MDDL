import { deleteDocument, getSingleDocumentById } from '@/models/document'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import {
  DocumentPermission,
  requirePermissionToDocument,
} from './authorization'
import createError from 'http-errors'
import { deleteObject } from '@/utils/s3'
import { Document } from '@/models/document'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'
import { submitDocumentDeletedEvent } from '../activity'
import { User } from '@/models/user'
import { hasValue } from '@/utils/array'

connectDatabase()

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('documentId', (r) => requirePathParameter(r.event, 'documentId')),
  setContext('document', (r) => getSingleDocumentById(r.documentId)),
  requirePermissionToDocument(DocumentPermission.DeleteDocument),
  async (request: APIGatewayRequest): Promise<any> => {
    const {
      documentId,
      document,
      event,
      user,
    } = request as APIGatewayRequest & {
      document: Document
      user: User
    }

    if (!document.files) {
      throw new createError.InternalServerError(
        'document.files was not loaded so document may not get cleaned up correctly',
      )
    }

    // submit audit activity
    await submitDocumentDeletedEvent({
      ownerId: document.ownerId,
      document: document,
      files: document.files,
      user,
      event,
    })

    // delete files from S3
    const filePathsToRemove = document.files.map((f) => f.path).filter(hasValue)
    if (filePathsToRemove.length) {
      await Promise.all(filePathsToRemove.map((p) => deleteObject(p)))
    }

    if (document.thumbnailPath) {
      // remove thumbnail too
      await deleteObject(document.thumbnailPath)
    }

    const documentDeleted = await deleteDocument(documentId)
    if (!documentDeleted) {
      throw new createError.InternalServerError('document could not be deleted')
    }
  },
)

export default handler
