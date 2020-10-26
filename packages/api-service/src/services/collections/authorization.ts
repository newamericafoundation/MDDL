import { Collection, getCollectionById } from '@/models/collection'
import { collectionGrantExists } from '@/models/collectionGrant'
import { User } from '@/models/user'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import { CollectionGrantType } from 'api-client'
import createError from 'http-errors'
import { requireUserData } from '../user'

export enum CollectionPermission {
  ListDocuments = 'list:documents',
}

const getPermissionsToCollection = async (
  collection: Collection,
  user: User,
): Promise<CollectionPermission[]> => {
  // check if owner
  if (collection.ownerId === user.id) {
    return Object.values(CollectionPermission)
  }
  // check if this is a shared collection to this individual
  if (
    user.email &&
    (await collectionGrantExists(
      collection.id,
      CollectionGrantType.INDIVIDUALEMAIL,
      user.email,
    ))
  ) {
    return [CollectionPermission.ListDocuments]
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
