export const requireUserData = jest.fn()

export const {
  userToApiOwner,
  userToApiUser,
  hasAcceptedTermsOfUse,
  userName,
  userToApiSharer,
} = jest.requireActual('@/services/users')
