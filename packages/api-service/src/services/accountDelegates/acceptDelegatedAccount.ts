import {
  UserDelegatedAccessCreate,
  UserDelegatedAccess,
  UserDelegatedAccessStatus,
} from 'api-client'
import { requirePathParameter, requireUserId } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { createAccountDelegateSchema } from './validation'
import { v4 as uuidv4 } from 'uuid'
import {
  AccountDelegateInvitationValidDays,
  MaxDelegatesPerAccount,
} from '@/constants'
import {
  APIGatewayRequest,
  APIGatewayRequestBody,
  createApiGatewayHandler,
  requireValidBody,
  setContext,
} from '@/utils/middleware'
import {
  requirePermissionToUser,
  UserPermission,
} from '@/services/users/authorization'
import createError from 'http-errors'
import {
  AccountDelegate,
  countAccountDelegates,
  createAccountDelegate,
  CreateAccountDelegateInput,
  findAccountDelegateForAccountByEmail,
  getAccountDelegateById,
  updateAccountDelegate,
} from '@/models/accountDelegate'
import { addDaysFromNow } from '@/utils/date'
import { toUserDelegatedAccess } from '.'
import {
  AccountDelegatePermission,
  requirePermissionToAccountDelegate,
} from './authorization'
import { getUserById } from '@/models/user'
import { requireUserData } from '@/services/users'

connectDatabase()

type Request = APIGatewayRequest & {
  userId: string
  accountDelegateId: string
  accountDelegate: AccountDelegate
}

export const handler = createApiGatewayHandler(
  setContext('accountDelegateId', (r) =>
    requirePathParameter(r.event, 'delegateId'),
  ),
  setContext('userId', (r) => requireUserId(r.event)),
  setContext('user', (r) => requireUserData(r)),
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
