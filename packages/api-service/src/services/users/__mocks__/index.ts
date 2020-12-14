export const requireUserData = jest.fn()
export const hasDelegatedAccessToUserAccount = jest.fn(async () => false)

export const {
  userToApiOwner,
  userToApiUser,
  hasAcceptedTermsOfUse,
  userName,
  userToApiSharer,
} = jest.requireActual('@/services/users')
