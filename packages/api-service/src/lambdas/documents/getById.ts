import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda'
import { Document as DocumentContract } from 'api-client'
import { getDocumentById } from '@/models/document'
import {
  createErrorResponse,
  getPathParameter,
  getUserId,
} from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { createSingleDocumentResult } from '@/lambdas/documents'

connectDatabase()

export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2<
  DocumentContract
>> = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2<DocumentContract>> => {
  const documentId = getPathParameter(event, 'documentId')
  const userId = getUserId(event)
  if (!documentId) {
    return createErrorResponse('documentId path parameter not found')
  }
  if (!userId) {
    return createErrorResponse('userId not found')
  }

  const foundDocument = await getDocumentById(documentId, userId)
  if (!foundDocument) {
    return createErrorResponse('document not found', 404)
  }

  return await createSingleDocumentResult(foundDocument)
}

export default handler
