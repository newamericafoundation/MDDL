import { EnforceUserTermsOfUseAcceptance } from '@/constants'
import { findAccountDelegateForAccountByEmail } from '@/models/accountDelegate'
import { getUserById, insertUser, updateUser, User } from '@/models/user'
import {
  requireToken,
  requireTokenIssuedAt,
  requireUserId,
} from '@/utils/api-gateway'
import { APIGatewayRequest } from '@/utils/middleware'
import { getUserInfo } from '@/utils/oauth'
import { Owner, User as ApiUser, UserDelegatedAccessStatus } from 'api-client'
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
    requireTokenIssuedAt(request.event),
  )
  if (requireTermsOfUseAcceptance && !hasAcceptedTermsOfUse(userData)) {
    throw new createError.Forbidden(
      'terms of use must be accepted before using this API',
    )
  }
  return userData
}

export const getUserData = async (
  id: string,
  token: string,
  issuedAt: string,
) => {
  // try to fetch the user from DB
  const user = await getUserById(id)
  if (
    user &&
    user.syncTimestamp &&
    parseInt(issuedAt) <= parseInt(user.syncTimestamp)
  ) {
    // user in DB has been at least since this token was used
    // so its ok to use it
    return user
  }

  // load in user info from oauth
  const {
    given_name: givenName,
    family_name: familyName,
    email,
  } = await getUserInfo(token)

  // insert user if it did not already exist
  if (!user) {
    return await insertUser({
      id,
      givenName,
      familyName,
      email,
      syncTimestamp: issuedAt,
    })
  }

  user.givenName = givenName
  user.familyName = familyName
  user.email = email
  user.syncTimestamp = issuedAt
  // update user
  return await updateUser(id, {
    givenName,
    familyName,
    email,
    syncTimestamp: issuedAt,
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
}): Owner => ({
  id: user.id,
  givenName: user.givenName ?? 'Unknown',
  familyName: user.familyName ?? 'Unknown',
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
  attributes?: any
}): ApiUser => ({
  id: user.id,
  givenName: user.givenName ?? 'Unknown',
  familyName: user.familyName ?? 'Unknown',
  termsOfUseAccepted: hasAcceptedTermsOfUse(user),
  links: [],
})
