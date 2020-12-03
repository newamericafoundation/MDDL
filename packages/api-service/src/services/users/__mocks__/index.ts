export const requireUserData = jest.fn()

export const {
  userToApiOwner,
  userToApiUser,
  hasAcceptedTermsOfUse,
  userName,
} = jest.requireActual('@/services/users')
