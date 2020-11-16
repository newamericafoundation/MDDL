import { User } from '@/models/user'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import { emailIsWhitelisted } from '@/utils/whitelist'
import createError from 'http-errors'

export enum UserPermission {
  WriteUser = 'write:user',
  WriteCollection = 'write:collection',
  ListCollections = 'list:collection',
  WriteDocument = 'write:document',
  ListDocuments = 'list:document',
  ListActivity = 'list:activity',
}

const getPermissionsToUser = async (
  userId: string,
  ownerId: string,
): Promise<UserPermission[]> => {
  // check if owner
  if (userId === ownerId) {
    return Object.values(UserPermission)
  }
  // can't find any permissions
  return []
}

const getPermissionsToAgent = async (
  userId: string,
  ownerId: string,
  user: User,
): Promise<UserPermission[]> => {
  // check that user is found, has an email, and that the calling user is the user in question
  if (!user || !user.email || !ownerId || !userId || ownerId !== userId) {
    return []
  }

  if (!emailIsWhitelisted(user.email)) {
    throw new createError.Forbidden()
  }

  // can list shared collections for current user
  return [UserPermission.ListCollections]
}

export const requirePermissionToUser = (permission: UserPermission) => async (
  request: APIGatewayRequest,
): Promise<APIGatewayRequest> => {
  const { ownerId, userId } = request

  // resolve permissions
  const permissions = await getPermissionsToUser(userId, ownerId)
  await setContext('userPermissions', () => permissions)(request)

  // determine access to permissions
  if (permissions.includes(permission)) {
    return request
  }
  throw new createError.NotFound('user not found')
}

export const requirePermissionToAgent = (permission: UserPermission) => async (
  request: APIGatewayRequest,
): Promise<APIGatewayRequest> => {
  const { ownerId, userId, user } = (request as unknown) as {
    user: User
    ownerId: string
    userId: string
  }

  // resolve permissions
  const permissions = await getPermissionsToAgent(userId, ownerId, user)
  await setContext('userPermissions', () => permissions)(request)

  // determine access to permissions
  if (permissions.includes(permission)) {
    return request
  }
  throw new createError.NotFound('user not found')
}
