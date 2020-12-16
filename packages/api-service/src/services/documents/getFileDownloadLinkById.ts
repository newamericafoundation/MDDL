import {
  FileDownload as FileDownloadContract,
  FileDownloadDispositionTypeEnum,
} from 'api-client'
import { getFileByIdAndDocumentId } from '@/models/file'
import {
  getQueryStringParameter,
  requirePathParameter,
} from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { getPresignedDownloadUrl } from '@/utils/s3'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import createError from 'http-errors'
import {
  DocumentPermission,
  requirePermissionToDocument,
} from './authorization'
import { Document, getDocumentById } from '@/models/document'
import { validateDisposition } from './validation'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'
import { submitDocumentAccessedEvent } from '../activity'
import { User } from '@/models/user'
import { resolveFileName } from '@/utils/fileNamer'

connectDatabase()

type Request = {
  document: Document
  documentId: string
  fileId: string
  user: User
  disposition: 'attachment' | 'inline'
} & APIGatewayRequest

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('documentId', (r) => requirePathParameter(r.event, 'documentId')),
  setContext('fileId', (r) => requirePathParameter(r.event, 'fileId')),
  setContext(
    'disposition',
    (r) =>
      getQueryStringParameter(r.event, 'disposition') ||
      FileDownloadDispositionTypeEnum.Attachment,
  ),
  validateDisposition(),
  setContext('document', async (r) => await getDocumentById(r.documentId)),
  requirePermissionToDocument(DocumentPermission.GetDocument),
  async (request: APIGatewayRequest): Promise<FileDownloadContract> => {
    const {
      document,
      documentId,
      user,
      fileId,
      disposition,
      event,
    } = request as Request
    const file = await getFileByIdAndDocumentId(fileId, documentId)
    if (!file) {
      throw new createError.NotFound('file not found')
    }

    // submit audit activity
    await submitDocumentAccessedEvent({
      ownerId: document.ownerId,
      document,
      files: [file],
      user: user,
      event,
    })

    return {
      href: getPresignedDownloadUrl(
        file.path,
        resolveFileName(document, file),
        disposition,
      ),
    }
  },
)

export default handler
