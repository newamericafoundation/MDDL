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
import {
  getCollectionDetails,
  submitCollectionDownloaded,
} from '@/services/collections'
import createError from 'http-errors'

connectDatabase()

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('collectionId', (r) =>
    requirePathParameter(r.event, 'collectionId'),
  ),
  setContext('downloadId', (r) => requirePathParameter(r.event, 'downloadId')),
  requirePermissionToCollection(CollectionPermission.DownloadDocuments),
  async (request: APIGatewayRequest): Promise<DocumentsDownload> => {
    const {
      collectionId,
      collection,
      downloadId: documentsHash,
      event,
      user,
    } = request

    // read in documents
    const downloadPath = `${CollectionsPrefix}/${collectionId}/${documentsHash}`
    const success = await objectExists(downloadPath)

    if (success) {
      // prepare audit activity data

      const {
        documents,
        documentsHash: currentDocumentsHash,
      } = await getCollectionDetails(collection.id)

      if (currentDocumentsHash != documentsHash) {
        throw new createError.BadRequest(
          'The requested download does not contain the latest group of documents ' +
            currentDocumentsHash +
            ' - ' +
            documentsHash,
        )
      }

      // submit audit activity data
      await submitCollectionDownloaded(collection, documents, event, user)
    }

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
