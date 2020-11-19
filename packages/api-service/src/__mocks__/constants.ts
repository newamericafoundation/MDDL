export const {
  MaxFilesPerDocument,
  MaxDocumentsPerUser,
  MaxDelegatesPerAccount,
  AccountDelegateInvitationValidDays,
  MaxFileSize,
  MaxIndividualEmailAddressesPerCollection,
  DocumentsPrefix,
  CollectionsPrefix,
} = jest.requireActual('@/constants')

// hardcoded to true to make testing the positive case easier
export const EnforceUserTermsOfUseAcceptance = true
