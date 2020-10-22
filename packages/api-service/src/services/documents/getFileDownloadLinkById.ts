import {
  FileDownload as FileDownloadContract,
  FileDownloadDispositionTypeEnum,
} from 'api-client'
import { getFileByIdAndDocumentId } from '@/models/file'
import {
  getQueryStringParameter,
  requirePathParameter,
  requireUserId,
} from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { getPresignedDownloadUrl } from '@/utils/s3'
import {
  APIGatewayRequest,
  createApiGatewayHandler,
  setContext,
} from '@/utils/middleware'
import createError from 'http-errors'
import {
  DocumentPermission,
  requirePermissionToDocument,
} from './authorization'

connectDatabase()

export const handler = createApiGatewayHandler(
  setContext('documentId', (r) => requirePathParameter(r.event, 'documentId')),
  setContext('fileId', (r) => requirePathParameter(r.event, 'fileId')),
  setContext('userId', (r) => requireUserId(r.event)),
  setContext(
    'disposition',
    (r) =>
      getQueryStringParameter(r.event, 'disposition') ||
      FileDownloadDispositionTypeEnum.Attachment,
  ),
  (request: APIGatewayRequest): APIGatewayRequest => {
    const { disposition } = request
    if (
      !Object.values<string>(FileDownloadDispositionTypeEnum).includes(
        disposition,
      )
    ) {
      throw new createError.BadRequest('disposition type not found')
    }
    return request
  },
  requirePermissionToDocument(DocumentPermission.GetDocument),
  async (request: APIGatewayRequest): Promise<FileDownloadContract> => {
    const { documentId, fileId, disposition } = request
    const file = await getFileByIdAndDocumentId(fileId, documentId)
    if (!file) {
      throw new createError.NotFound('file not found')
    }

    return {
      href: await getPresignedDownloadUrl(file.path, file.name, disposition),
    }
  },
)

export default handler
