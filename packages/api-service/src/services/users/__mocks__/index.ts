export const requireUserData = jest.fn()

export const {
  userToApiOwner,
  userToApiUser,
  hasAcceptedTermsOfUse,
} = jest.requireActual('@/services/users')
