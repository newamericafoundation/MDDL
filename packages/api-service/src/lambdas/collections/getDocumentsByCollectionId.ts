import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda'
import { DocumentList as DocumentListContract } from 'api-client'
import {
  createErrorResponse,
  getPathParameter,
  getUserId,
} from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import {
  collectionExists,
  getDocumentsByCollectionId,
} from '@/models/collection'
import { createDocumentListResult } from '@/lambdas/documents'

connectDatabase()

export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2<
  DocumentListContract
>> = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2<DocumentListContract>> => {
  const collectionId = getPathParameter(event, 'collectionId')
  const userId = getUserId(event)
  if (!collectionId) {
    return createErrorResponse('collectionId path parameter not found')
  }
  if (!userId) {
    return createErrorResponse('userId not found')
  }
  const collectionExistsCheck = await collectionExists(collectionId, userId)
  if (!collectionExistsCheck) {
    return createErrorResponse('collection not found', 404)
  }
  const foundDocuments = await getDocumentsByCollectionId(collectionId)
  return createDocumentListResult(foundDocuments)
}

export default handler
