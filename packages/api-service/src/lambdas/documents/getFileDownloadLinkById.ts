import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda'
import { FileDownload as FileDownloadContract } from 'api-client'
import { documentExistsById } from '@/models/document'
import { getFileByIdAndDocumentId } from '@/models/file'
import {
  createErrorResponse,
  createJsonResponse,
  getPathParameter,
  getUserId,
} from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { getPresignedDownloadUrl } from '@/utils/s3'

connectDatabase()

export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2<
  FileDownloadContract
>> = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2<FileDownloadContract>> => {
  const documentId = getPathParameter(event, 'documentId')
  const fileId = getPathParameter(event, 'fileId')
  const userId = getUserId(event)
  if (!documentId) {
    return createErrorResponse('documentId path parameter not found')
  }
  if (!fileId) {
    return createErrorResponse('fileId path parameter not found')
  }
  if (!userId) {
    return createErrorResponse('userId not found')
  }

  const documentExists = await documentExistsById(documentId, userId)
  if (!documentExists) {
    return createErrorResponse('document not found', 404)
  }

  const file = await getFileByIdAndDocumentId(fileId, documentId)
  if (!file) {
    return createErrorResponse('file not found', 404)
  }

  return createJsonResponse<FileDownloadContract>({
    href: await getPresignedDownloadUrl(file.path),
  })
}

export default handler
