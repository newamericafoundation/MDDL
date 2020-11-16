import {
  DocumentsDownloadCreate,
  DocumentsDownload,
  DocumentsDownloadStatusEnum,
} from 'api-client'
import { requirePathParameter, requireUserId } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { downloadCollectionDocumentsSchema } from './validation'
import {
  setContext,
  APIGatewayRequestBody,
  createApiGatewayHandler,
  requireValidBody,
} from '@/utils/middleware'
import {
  CollectionPermission,
  requirePermissionToCollection,
} from './authorization'
import { CollectionsPrefix } from '@/constants'
import { getPresignedDownloadUrl, objectExists } from '@/utils/s3'
import { getCollectionDetails } from '@/services/collections'
import { EnvironmentVariable, requireConfiguration } from '@/config'
import { invokeFunction } from '@/utils/lambda'
import { CreateCollectionZipEvent } from './createCollectionZip'

connectDatabase()

export const handler = createApiGatewayHandler(
  setContext('collectionId', (r) =>
    requirePathParameter(r.event, 'collectionId'),
  ),
  setContext('userId', (r) => requireUserId(r.event)),
  requirePermissionToCollection(CollectionPermission.DownloadDocuments),
  requireValidBody<DocumentsDownloadCreate>(downloadCollectionDocumentsSchema),
  async (
    request: APIGatewayRequestBody<DocumentsDownloadCreate>,
  ): Promise<DocumentsDownload> => {
    const { collectionId, userId, collection } = request

    // read in documents
    const { documentsHash } = await getCollectionDetails(collectionId)
    const downloadPath = `${CollectionsPrefix}/${collectionId}/${documentsHash}`

    if (await objectExists(downloadPath)) {
      // zip already prepared, return
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
