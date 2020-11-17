import { setContext } from '@/utils/middleware'

const authorization = jest.requireActual(
  '@/services/accountDelegates/authorization',
)

export const AccountDelegatePermission = authorization.AccountDelegatePermission

export const requirePermissionToAccountDelegateImpl = jest
  .fn()
  .mockImplementation(async (request) => {
    await setContext('accountDelegatePermissions', () =>
      Object.values(AccountDelegatePermission),
    )(request)
    return request
  })

export const requirePermissionToAccountDelegate = jest.fn(
  () => requirePermissionToAccountDelegateImpl,
)

export const getPermissionsToAccountDelegate = jest.fn(() =>
  Object.values(AccountDelegatePermission),
)
