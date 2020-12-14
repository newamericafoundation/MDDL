import { User } from '@/models/user'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import { emailIsWhitelisted } from '@/utils/whitelist'
import createError from 'http-errors'
import {
  hasDelegatedAccessToUserAccount,
  requireUserData,
} from '@/services/users'
import { hasAnyGrantToUsersCollections } from '../documents'

export enum UserPermission {
  WriteUser = 'write:user',
  GetUser = 'get:user',

  WriteCollection = 'write:collection',
  ListCollections = 'list:collections',

  WriteDocument = 'write:document',
  ListDocuments = 'list:documents',
  ListSharedDocuments = 'list:sharedDocuments',

  ListActivity = 'list:activity',

  WriteAccountDelegates = 'write:accountDelegates',
  ListAccountDelegates = 'list:accountDelegates',
}

const getPermissionsToUser = async (
  userId: string,
  ownerId: string,
  userEmail: string,
): Promise<UserPermission[]> => {
  // check if owner
  if (userId === ownerId) {
    return Object.values(UserPermission)
  }

  // check if user is delegated access to this account
  if (await hasDelegatedAccessToUserAccount(userEmail, ownerId)) {
    return [
      UserPermission.WriteCollection,
      UserPermission.WriteCollection,
      UserPermission.ListCollections,
      UserPermission.WriteDocument,
      UserPermission.ListDocuments,
    ]
  }

  if (await hasAnyGrantToUsersCollections(ownerId, userEmail)) {
    return [UserPermission.ListSharedDocuments]
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
  const { ownerId, userId, user: passedUser } = request
  const user = passedUser || (await requireUserData(request))

  // resolve permissions
  const permissions = await getPermissionsToUser(userId, ownerId, user.email)
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
