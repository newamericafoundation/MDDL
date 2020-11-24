import {
  DocumentsDownloadCreate,
  DocumentsDownload,
  DocumentsDownloadStatusEnum,
} from 'api-client'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { downloadCollectionDocumentsSchema } from './validation'
import {
  setContext,
  APIGatewayRequestBody,
  requireValidBody,
} from '@/utils/middleware'
import {
  CollectionPermission,
  requirePermissionToCollection,
} from './authorization'
import { CollectionsPrefix } from '@/constants'
import { getPresignedDownloadUrl, objectExists } from '@/utils/s3'
import {
  getCollectionDetails,
  submitCollectionDownloaded,
} from '@/services/collections'
import { EnvironmentVariable, requireConfiguration } from '@/config'
import { invokeFunction } from '@/utils/lambda'
import { CreateCollectionZipEvent } from './createCollectionZip'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'

connectDatabase()

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('collectionId', (r) =>
    requirePathParameter(r.event, 'collectionId'),
  ),
  requirePermissionToCollection(CollectionPermission.DownloadDocuments),
  requireValidBody<DocumentsDownloadCreate>(downloadCollectionDocumentsSchema),
  async (
    request: APIGatewayRequestBody<DocumentsDownloadCreate>,
  ): Promise<DocumentsDownload> => {
    const { collectionId, userId, collection, user, event } = request

    // read in documents
    const { documents, documentsHash } = await getCollectionDetails(
      collectionId,
    )
    const downloadPath = `${CollectionsPrefix}/${collectionId}/${documentsHash}`

    if (await objectExists(downloadPath)) {
      // zip already prepared, submit audit activity data
      await submitCollectionDownloaded(collection, documents, event, user)

      // return file access
      return {
        id: documentsHash,
        status: DocumentsDownloadStatusEnum.SUCCESS,
        fileDownload: {
          href: getPresignedDownloadUrl(
            downloadPath,
            collection.name + '.zip',
            'attachment',
          ),
        },
      }
    }

    const functionName = requireConfiguration(
      EnvironmentVariable.CREATE_COLLECTION_ZIP_FUNCTION_NAME,
    )
    await invokeFunction<CreateCollectionZipEvent>(functionName, {
      collectionId,
      userId,
    })

    // return handle to file
    return {
      id: documentsHash,
      status: DocumentsDownloadStatusEnum.PENDING,
      fileDownload: null,
    }
  },
)

export default handler
