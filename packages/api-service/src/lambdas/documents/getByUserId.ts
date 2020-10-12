import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda'
import {
  DocumentListItem,
  DocumentList as DocumentListContract,
} from 'api-client'
import { getDocumentsByOwnerId } from '@/models/document'
import {
  createErrorResponse,
  createJsonResponse,
  getPathParameter,
  getUserId,
} from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'

connectDatabase()

export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2<
  DocumentListContract
>> = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2<DocumentListContract>> => {
  const ownerId = getPathParameter(event, 'userId')
  const userId = getUserId(event)
  if (!ownerId) {
    return createErrorResponse('userId path parameter not found')
  }
  if (ownerId != userId) {
    return createErrorResponse('userId not found')
  }
  const foundDocuments = await getDocumentsByOwnerId(ownerId)
  return createJsonResponse<DocumentListContract>({
    documents: foundDocuments.map(
      (document): DocumentListItem => {
        const { id, name, createdAt } = document

        return {
          name,
          createdDate: createdAt.toISOString(),
          id,
          links: [
            {
              href: `/documents/${id}`,
              rel: 'self',
              type: 'GET',
            },
          ],
        }
      },
    ),
  })
}

export default handler
