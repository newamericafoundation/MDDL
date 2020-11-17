import { setContext } from '@/utils/middleware'

const authorization = jest.requireActual('@/services/users/authorization')

export const UserPermission = authorization.UserPermission

export const requirePermissionToUserImpl = jest.fn(async (request) => {
  await setContext('userPermissions', () => Object.values(UserPermission))(
    request,
  )
  return request
})

export const requirePermissionToUser = jest.fn(
  () => requirePermissionToUserImpl,
)

export const requirePermissionToAgentImpl = jest.fn(async (request) => {
  await setContext('userPermissions', () => [UserPermission.ListCollections])(
    request,
  )
  return request
})

export const requirePermissionToAgent = jest.fn(
  () => requirePermissionToAgentImpl,
)
