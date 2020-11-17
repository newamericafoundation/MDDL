import { AccountDelegate } from '@/models/accountDelegate'
import {
  Link,
  UserDelegatedAccess,
  UserDelegatedAccessStatus,
} from 'api-client'
import {
  AccountDelegatePermission,
  getPermissionsToAccountDelegate,
} from '@/services/accountDelegates/authorization'
import { User } from '@/models/user'
import { userToOwner } from '../users'

const determineDelegateUserStatus = (
  status: string,
  invitationExpiryDate: Date,
): UserDelegatedAccessStatus => {
  if (
    status === UserDelegatedAccessStatus.INVITATIONSENT &&
    invitationExpiryDate < new Date()
  ) {
    return UserDelegatedAccessStatus.INVITATIONEXPIRED
  }
  return status as UserDelegatedAccessStatus
}

const getLinks = (
  accountDelegateId: string,
  permissions: AccountDelegatePermission[],
) => {
  const links: Link[] = []
  if (permissions.includes(AccountDelegatePermission.DeleteAccountDelegate)) {
    links.push({
      href: `/delegates/${accountDelegateId}`,
      rel: 'delete',
      type: 'DELETE',
    })
  }
  if (permissions.includes(AccountDelegatePermission.AcceptAccountDelegate)) {
    links.push({
      href: `/delegates/${accountDelegateId}/accept`,
      rel: 'accept',
      type: 'POST',
    })
  }
  return links
}

export const toUserDelegatedAccess = (
  input: AccountDelegate,
  userId: string,
  userEmail: string | undefined,
  delegatedUser?: User | null,
): UserDelegatedAccess => ({
  createdDate: input.createdAt.toISOString(),
  email: input.delegateEmail,
  id: input.id,
  links: getLinks(
    input.id,
    getPermissionsToAccountDelegate(input, userId, userEmail),
  ),
  status: determineDelegateUserStatus(input.status, input.inviteValidUntil),
  allowsAccessToUser: delegatedUser ? userToOwner(delegatedUser) : undefined,
})
