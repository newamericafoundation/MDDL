import { collectionExists } from '@/models/collection'
import { APIGatewayRequest } from '@/utils/middleware'
import createError from 'http-errors'

export enum CollectionPermission {
  ListDocuments = 'list:documents',
}

export const requirePermissionToCollection = (
  permission: CollectionPermission,
) => async (request: APIGatewayRequest): Promise<APIGatewayRequest> => {
  const { collectionId, userId } = request

  const collectionExistsCheck = await collectionExists(collectionId, userId)
  if (!collectionExistsCheck) {
    throw new createError.NotFound('collection not found')
  }
  return request
}
