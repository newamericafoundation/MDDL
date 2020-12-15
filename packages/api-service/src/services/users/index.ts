import { EnforceUserTermsOfUseAcceptance } from '@/constants'
import { findAccountDelegateForAccountByEmail } from '@/models/accountDelegate'
import { getUserById, insertUser, updateUser } from '@/models/user'
import {
  requireToken,
  requireTokenTimestamp,
  requireUserId,
} from '@/utils/api-gateway'
import { logger } from '@/utils/logging'
import { APIGatewayRequest } from '@/utils/middleware'
import { getUserInfo } from '@/utils/oauth'
import {
  Owner,
  User as ApiUser,
  UserDelegatedAccessStatus,
  Sharer,
} from 'api-client'
import createError from 'http-errors'

export const requireUserData = async (
  request: APIGatewayRequest,
  requireTermsOfUseAcceptance = true,
) => {
  requireTermsOfUseAcceptance =
    requireTermsOfUseAcceptance && EnforceUserTermsOfUseAcceptance
  const userId = request.userId || requireUserId(request.event)
  const userData = await getUserData(
    userId,
    requireToken(request.event),
    requireTokenTimestamp(request.event),
  )
  if (requireTermsOfUseAcceptance && !hasAcceptedTermsOfUse(userData)) {
    throw new createError.Forbidden(
      'terms of use must be accepted before using this API',
    )
  }
  return userData
}

const isOverLength = (input: string | undefined, length: number) => {
  return input && input.length > length
}

export const getUserData = async (
  id: string,
  token: string,
  timestamp: string,
) => {
  // try to fetch the user from DB
  const user = await getUserById(id)
  if (
    user &&
    user.syncTimestamp &&
    parseInt(timestamp) <= parseInt(user.syncTimestamp)
  ) {
    // user in DB has been synced at least since this token was used
    // so its ok to use it
    return user
  }

  // load in user info from oauth
  let {
    given_name: givenName,
    family_name: familyName,
    email,
  } = await getUserInfo(token)

  if (
    isOverLength(givenName, 255) ||
    isOverLength(familyName, 255) ||
    isOverLength(email, 255)
  ) {
    // log this so we know about it
    logger.error(
      new Error(
        `givenName, familyName or email for user id ${id} is over 255 character maximum`,
      ),
    )
  }

  givenName = givenName?.substring(0, 254)
  familyName = familyName?.substring(0, 254)
  email = email?.substring(0, 254)

  // insert user if it did not already exist
  if (!user) {
    return await insertUser({
      id,
      givenName,
      familyName,
      email,
      syncTimestamp: timestamp,
    })
  }

  user.givenName = givenName
  user.familyName = familyName
  user.email = email
  user.syncTimestamp = timestamp

  // update user
  return await updateUser(id, {
    givenName,
    familyName,
    email,
    syncTimestamp: timestamp,
  })
}

export const hasDelegatedAccessToUserAccount = async (
  currentUsersEmail: string,
  possibleDelegatedAccountId: string,
) => {
  // check if user is delegated access to this account
  const delegatedAccount = await findAccountDelegateForAccountByEmail(
    possibleDelegatedAccountId,
    currentUsersEmail,
  )
  return (
    delegatedAccount !== undefined &&
    delegatedAccount.status === UserDelegatedAccessStatus.ACTIVE
  )
}

export const userToApiOwner = (user: {
  id: string
  givenName?: string
  familyName?: string
  email?: string
}): Owner => ({
  id: user.id,
  givenName: user.givenName || null,
  familyName: user.familyName || null,
  name: userName(user),
})

export const userToApiSharer = (user: {
  id: string
  givenName?: string
  familyName?: string
  email?: string
}): Sharer => ({
  id: user.id,
  name: userName(user),
  email: user.email || null,
})

export const hasAcceptedTermsOfUse = (user: { attributes?: any }) => {
  return user.attributes && user.attributes.termsOfUseAccepted
    ? user.attributes.termsOfUseAccepted
    : false
}

export const userToApiUser = (user: {
  id: string
  givenName?: string
  familyName?: string
  email?: string
  attributes?: any
}): ApiUser => ({
  id: user.id,
  givenName: user.givenName || null,
  familyName: user.familyName || null,
  email: user.email || null,
  name: userName(user),
  termsOfUseAccepted: hasAcceptedTermsOfUse(user),
  links: [],
})

export const userName = (user: {
  id: string
  givenName?: string
  familyName?: string
  email?: string
}): string =>
  user.givenName && user.familyName
    ? `${user.givenName} ${user.familyName}`
    : user.email || user.id
