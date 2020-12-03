import {
  UserDelegatedAccessCreate,
  UserDelegatedAccess,
  UserDelegatedAccessStatus,
} from 'api-client'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { createAccountDelegateSchema } from './validation'
import { v4 as uuidv4 } from 'uuid'
import {
  AccountDelegateInvitationValidDays,
  MaxDelegatesPerAccount,
} from '@/constants'
import {
  APIGatewayRequestBody,
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
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'
import { User } from '@/models/user'
import { submitDelegatedUserInvitedEvent } from '../activity'
import { queueDelegateUserInvitation } from '../emails'
import { EnvironmentVariable, requireConfiguration } from '@/config'
import { userName } from '../users'

connectDatabase()
type Request = {
  ownerId: string
  userId: string
  user: User
  webAppDomain: string
} & APIGatewayRequestBody<UserDelegatedAccessCreate>

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
  setContext('webAppDomain', () =>
    requireConfiguration(EnvironmentVariable.WEB_APP_DOMAIN),
  ),
  requirePermissionToUser(UserPermission.WriteAccountDelegates),
  requireValidBody<UserDelegatedAccessCreate>(createAccountDelegateSchema),
  async (
    request: APIGatewayRequestBody<UserDelegatedAccessCreate>,
  ): Promise<UserDelegatedAccess> => {
    const {
      ownerId,
      userId,
      body,
      user,
      event,
      webAppDomain,
    } = request as Request

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

        // resend invite email
        await queueDelegateUserInvitation({
          acceptLink: `https://${webAppDomain}/delegates/${existingDelegate.id}/accept`,
          email,
          userName: userName(user),
        })

        return toUserDelegatedAccess(updated, userId, user.email)
      } else {
        // existing accepted delegate account
        throw new createError.BadRequest(
          `validation error: account delegate already exists with provided email`,
        )
      }
    }

    const delegateCount = await countAccountDelegates(ownerId)
    if (delegateCount >= MaxDelegatesPerAccount) {
      throw new createError.BadRequest(
        `validation error: maximum delegates count of ${MaxDelegatesPerAccount} reached`,
      )
    }

    const accountDelegateCreate: CreateAccountDelegateInput = {
      id: uuidv4(),
      accountId: ownerId,
      userId,
      delegateEmail: email,
      inviteValidUntil: addDaysFromNow(AccountDelegateInvitationValidDays),
      status: UserDelegatedAccessStatus.INVITATIONSENT,
    }

    // submit audit activity
    await submitDelegatedUserInvitedEvent({
      ownerId,
      user,
      event,
      accountDelegate: accountDelegateCreate,
    })

    const createdAccountDelegate = await createAccountDelegate(
      accountDelegateCreate,
    )
    if (!createdAccountDelegate) {
      throw new createError.InternalServerError(
        'account delegate could not be created',
      )
    }

    // send invite email
    await queueDelegateUserInvitation({
      acceptLink: `https://${webAppDomain}/delegates/${createdAccountDelegate.id}/accept`,
      email,
      userName: userName(user),
    })

    return toUserDelegatedAccess(createdAccountDelegate, userId, user.email)
  },
)
