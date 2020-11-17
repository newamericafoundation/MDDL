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
  countAccountDelegates,
  createAccountDelegate,
  CreateAccountDelegateInput,
  findAccountDelegateForAccountByEmail,
  updateAccountDelegate,
} from '@/models/accountDelegate'
import { addDaysFromNow } from '@/utils/date'
import { toUserDelegatedAccess } from '.'
import { requireUserData } from '@/services/users'

connectDatabase()

export const handler = createApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
  setContext('userId', (r) => requireUserId(r.event)),
  setContext('user', (r) => requireUserData(r)),
  requirePermissionToUser(UserPermission.WriteAccountDelegates),
  requireValidBody<UserDelegatedAccessCreate>(createAccountDelegateSchema),
  async (
    request: APIGatewayRequestBody<UserDelegatedAccessCreate>,
  ): Promise<UserDelegatedAccess> => {
    const { ownerId, userId, body, user } = request

    const delegateCount = await countAccountDelegates(ownerId)
    if (delegateCount >= MaxDelegatesPerAccount) {
      throw new createError.BadRequest(
        `validation error: maximum delegates count of ${MaxDelegatesPerAccount} reached`,
      )
    }

    const { email } = body
    const existingDelegate = await findAccountDelegateForAccountByEmail(
      ownerId,
      email,
    )
    if (existingDelegate) {
      if (
        existingDelegate.status === UserDelegatedAccessStatus.INVITATIONSENT
      ) {
        // there is an existing account delegate so lets extend the invite validity time
        const updated = await updateAccountDelegate(
          existingDelegate.id,
          userId,
          {
            inviteValidUntil: addDaysFromNow(
              AccountDelegateInvitationValidDays,
            ),
          },
        )
        return toUserDelegatedAccess(updated, userId, user.email)
      } else {
        // existing accepted delegate account
        throw new createError.BadRequest(
          `validation error: account delegate already exists with provided email`,
        )
      }
    }

    const accountDelegateCreate: CreateAccountDelegateInput = {
      id: uuidv4(),
      accountId: ownerId,
      userId,
      delegateEmail: email,
      inviteValidUntil: addDaysFromNow(AccountDelegateInvitationValidDays),
      status: UserDelegatedAccessStatus.INVITATIONSENT,
    }

    const createdAccountDelegate = await createAccountDelegate(
      accountDelegateCreate,
    )
    if (!createdAccountDelegate) {
      throw new createError.InternalServerError(
        'account delegate could not be created',
      )
    }

    return toUserDelegatedAccess(createdAccountDelegate, userId, user.email)
  },
)
