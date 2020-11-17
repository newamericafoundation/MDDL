import { Collection, getCollectionById } from '@/models/collection'
import { User } from '@/models/user'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import createError from 'http-errors'
import { hasAccessToCollectionViaGrant } from '@/services/collections'
import {
  hasDelegatedAccessToUserAccount,
  requireUserData,
} from '@/services/users'

export enum CollectionPermission {
  ListDocuments = 'list:documents',
  ListGrants = 'list:grants',
  DownloadDocuments = 'download:documents',
}

const getPermissionsToCollection = async (
  collection: Collection,
  user: User,
): Promise<CollectionPermission[]> => {
  if (collection.ownerId === user.id) {
    // check if owner
    return Object.values(CollectionPermission)
  }

  if (
    user.email &&
    (await hasDelegatedAccessToUserAccount(user.email, collection.ownerId))
  ) {
    // check for delegated access
    return [CollectionPermission.ListDocuments, CollectionPermission.ListGrants]
  }

  if (
    user.email &&
    (await hasAccessToCollectionViaGrant(collection.id, user.email))
  ) {
    // check if this is a shared collection to this individual
    return [
      CollectionPermission.ListDocuments,
      CollectionPermission.DownloadDocuments,
    ]
  }

  // can't find any permissions
  return []
}

export const requirePermissionToCollection = (
  permission: CollectionPermission,
) => async (request: APIGatewayRequest): Promise<APIGatewayRequest> => {
  const {
    collectionId,
    collection: passedCollection,
    user: passedUser,
  } = request
  const user = passedUser || (await requireUserData(request))
  const collection = passedCollection || (await getCollectionById(collectionId))
  if (!collection) {
    throw new createError.NotFound('collection not found')
  }
  await setContext('user', () => user)(request)
  await setContext('collection', () => collection)(request)

  // resolve permissions
  const permissions = await getPermissionsToCollection(collection, user)
  await setContext('collectionPermissions', () => permissions)(request)

  // determine access to permissions
  if (permissions.includes(permission)) {
    return request
  }
  throw new createError.NotFound('collection not found')
}
