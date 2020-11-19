import { DocumentsDownload, DocumentsDownloadStatusEnum } from 'api-client'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { setContext, APIGatewayRequest } from '@/utils/middleware'
import {
  CollectionPermission,
  requirePermissionToCollection,
} from './authorization'
import { CollectionsPrefix } from '@/constants'
import { getPresignedDownloadUrl, objectExists } from '@/utils/s3'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'

connectDatabase()

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('collectionId', (r) =>
    requirePathParameter(r.event, 'collectionId'),
  ),
  setContext('downloadId', (r) => requirePathParameter(r.event, 'downloadId')),
  requirePermissionToCollection(CollectionPermission.DownloadDocuments),
  async (request: APIGatewayRequest): Promise<DocumentsDownload> => {
    const { collectionId, collection, downloadId: documentsHash } = request

    // read in documents
    const downloadPath = `${CollectionsPrefix}/${collectionId}/${documentsHash}`
    const success = await objectExists(downloadPath)

    // zip already prepared, return
    return {
      id: documentsHash,
      status: success
        ? DocumentsDownloadStatusEnum.SUCCESS
        : DocumentsDownloadStatusEnum.PENDING,
      fileDownload: success
        ? {
            href: getPresignedDownloadUrl(
              downloadPath,
              collection.name + '.zip',
              'attachment',
            ),
          }
        : null,
    }
  },
)

export default handler
