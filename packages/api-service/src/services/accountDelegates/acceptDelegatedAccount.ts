import { UserDelegatedAccess, UserDelegatedAccessStatus } from 'api-client'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import createError from 'http-errors'
import {
  AccountDelegate,
  getAccountDelegateById,
  updateAccountDelegate,
} from '@/models/accountDelegate'
import { toUserDelegatedAccess } from '.'
import {
  AccountDelegatePermission,
  requirePermissionToAccountDelegate,
} from './authorization'
import { getUserById } from '@/models/user'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'

connectDatabase()

type Request = APIGatewayRequest & {
  userId: string
  accountDelegateId: string
  accountDelegate: AccountDelegate
}

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('accountDelegateId', (r) =>
    requirePathParameter(r.event, 'delegateId'),
  ),
  setContext('accountDelegate', (r) =>
    getAccountDelegateById(r.accountDelegateId),
  ),
  requirePermissionToAccountDelegate(
    AccountDelegatePermission.AcceptAccountDelegate,
  ),
  async (request: APIGatewayRequest): Promise<UserDelegatedAccess> => {
    const { accountDelegate, userId, user } = request as Request

    if (
      accountDelegate.status !== UserDelegatedAccessStatus.INVITATIONSENT ||
      accountDelegate.inviteValidUntil < new Date()
    ) {
      // expired invitation
      throw new createError.BadRequest(
        `validation error: account delegate invitation can not be accepted`,
      )
    }

    const updatedDelegate = await updateAccountDelegate(
      accountDelegate.id,
      userId,
      {
        status: UserDelegatedAccessStatus.ACTIVE,
      },
    )

    const delegatedUser = await getUserById(updatedDelegate.accountId)
    return toUserDelegatedAccess(
      updatedDelegate,
      userId,
      user.email,
      delegatedUser,
    )
  },
)
