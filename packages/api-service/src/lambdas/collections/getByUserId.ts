import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda'
import {
  CollectionList as CollectionListContract,
  CollectionListItem,
} from 'api-client'
import {
  createErrorResponse,
  createJsonResponse,
  getPathParameter,
  getUserId,
} from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { getCollectionsByOwnerId } from '@/models/collection'

connectDatabase()

export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2<
  CollectionListContract
>> = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2<CollectionListContract>> => {
  const ownerId = getPathParameter(event, 'userId')
  const userId = getUserId(event)
  if (!ownerId) {
    return createErrorResponse('userId path parameter not found')
  }
  if (ownerId != userId) {
    return createErrorResponse('user not found', 404)
  }
  const foundCollections = await getCollectionsByOwnerId(ownerId)
  return createJsonResponse<CollectionListContract>({
    collections: foundCollections.map(
      (collection): CollectionListItem => {
        const { id, name, createdAt } = collection
        return {
          name,
          createdDate: createdAt.toISOString(),
          id,
          links: [],
        }
      },
    ),
  })
}

export default handler
