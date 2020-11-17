import { setContext } from '@/utils/middleware'

const authorization = jest.requireActual('@/services/collections/authorization')

export const CollectionPermission = authorization.CollectionPermission

export const requirePermissionToCollectionImpl = jest
  .fn()
  .mockImplementation(async (request) => {
    await setContext('collectionPermissions', () =>
      Object.values(CollectionPermission),
    )(request)
    return request
  })

export const requirePermissionToCollection = jest.fn(
  () => requirePermissionToCollectionImpl,
)
