import { APIGatewayRequest, setContext } from '@/utils/middleware'
import createError from 'http-errors'
import { requireUserData } from '@/services/users'
import {
  AccountDelegate,
  getAccountDelegateById,
} from '@/models/accountDelegate'

export enum AccountDelegatePermission {
  DeleteAccountDelegate = 'delete:accountDelegate',
  AcceptAccountDelegate = 'accept:accountDelegate',
}

export const getPermissionsToAccountDelegate = (
  accountDelegate: AccountDelegate,
  userId: string,
  userEmail: string | undefined,
): AccountDelegatePermission[] => {
  const { accountId, delegateEmail } = accountDelegate
  const permissions: AccountDelegatePermission[] = []
  const emailMatches = userEmail && delegateEmail === userEmail
  if (userId === accountId || emailMatches) {
    permissions.push(AccountDelegatePermission.DeleteAccountDelegate)
  }
  if (emailMatches) {
    permissions.push(AccountDelegatePermission.AcceptAccountDelegate)
  }
  return permissions
}

export const requirePermissionToAccountDelegate = (
  permission: AccountDelegatePermission,
) => async (request: APIGatewayRequest): Promise<APIGatewayRequest> => {
  const {
    accountDelegateId,
    accountDelegate: passedAccountDelegate,
    user: passedUser,
  } = request
  const user = passedUser || (await requireUserData(request))
  const accountDelegate =
    passedAccountDelegate || (await getAccountDelegateById(accountDelegateId))
  if (!accountDelegate) {
    throw new createError.NotFound('accountDelegate not found')
  }
  await setContext('user', () => user)(request)
  await setContext('accountDelegate', () => accountDelegate)(request)

  // resolve permissions
  const permissions = getPermissionsToAccountDelegate(
    accountDelegate,
    user.id,
    user.email,
  )
  await setContext('accountDelegatePermissions', () => permissions)(request)

  // determine access to permissions
  if (permissions.includes(permission)) {
    return request
  }
  throw new createError.Forbidden('action denied')
}
