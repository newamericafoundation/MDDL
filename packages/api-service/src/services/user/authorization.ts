import { APIGatewayRequest } from '@/utils/middleware'
import createError from 'http-errors'

export enum UserPermission {
  WriteCollection = 'write:collection',
  ListCollections = 'list:collection',
  WriteDocument = 'write:document',
  ListDocuments = 'list:document',
}

export const requirePermissionToUser = (permission: UserPermission) => (
  request: APIGatewayRequest,
): APIGatewayRequest => {
  const { ownerId, userId } = request

  // placeholder - run permissions checks here
  if (!ownerId || !userId || ownerId !== userId) {
    throw new createError.NotFound('User not found')
  }
  return request
}
