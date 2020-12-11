// eslint-disable-next-line @typescript-eslint/no-var-requires
const en: any = require('vuetify/lib/locale/en')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const es: any = require('vuetify/lib/locale/es')
// import es from 'vuetify/lib/locale/es'

export default {
  en: {
    datalocker: 'Datalocker',
    name: 'Name', // TODO: replace with filename

    // label appearing in tabular content (list of users, list of shared collections etc)
    // as well as side bar on document view
    dateAdded: 'Date Added',

    toast: {
      acceptedDelegateInvite: 'Delegate Access Accepted.',
      delegateRemoved: 'Client Removed',
      downloadLoadingState: 'Preparing download',
      sharingComplete: 'Sharing Complete',
      uploading: 'Adding File...', // displayed while a file is uploading
      uploadComplete: 'Upload Complete',
      fileDeletedConfirmation: 'File Deleted',
    },

    login: {
      getStarted: 'Get Started',
      welcomeTitle: 'Welcome to Datalocker',
      welcomeMessage: {
        CLIENT:
          'Datalocker is designed to help families who are seeking permanent supportive housing. Datalocker facilitates the storage and sharing of personal documents with case managers and relevant City agencies in a way that is both easy and secure.',
        CBO:
          'Datalocker is designed to help families who are seeking permanent supportive housing. Datalocker facilitates the storage and sharing of personal documents with case managers and relevant City agencies in a way that is both easy and secure.',
        AGENT:
          'Datalocker is designed to help families who are seeking permanent supportive housing. Datalocker facilitates the storage and sharing of personal documents with case managers and relevant City agencies in a way that is both easy and secure.',
      },
    },

    navigation: {
      about: 'About',
      account: 'Account',
      activity: 'Activity',
      back: 'Back',
      clients: 'Clients', // navigate back to agent view desktop
      close: 'Close',
      dashboard: 'Dashboard',
      faq: 'FAQ',
      loading: 'Loading',
      loggingIn: 'Logging in...',
      manageAccounts: 'Manage Accounts',
      signIn: 'Sign in',
      signOut: 'Sign out',
      switchAccount: 'Switch Clients',
      termsOfUse: 'Terms of Use',
    },

    document: {
      // This is the title of the confirmation dialog for deleting a document
      deleteConfirmationTitle: 'Delete this file?',
      // This is the body content of the confirmation dialog for deleting a document
      deleteConfirmationBody:
        'Anyone with shared access will no longer be able to view this file. This cannot be undone.',
      documentMenu: 'Document menu',
      downloadZip: 'Download Zip',
      downloadPdf: 'Download PDF',
      description: 'Description', // displayed beneath the document and expands to show description (if any)
      editDetailsTitle: 'Edit Details', // page title on edit details screen
      enterNamePlaceholder: 'Enter a new file name',
      enterDescriptionPlaceholder: 'Enter description',
      fileName: 'File Name', // shown as a label on edit details screen

      noDocuments: 'There are no files saved to your account yet.', // shown on dashboard when there are no documents
      previewOf: 'Preview of',
      uploadFirst: 'Add your first file', // label on the empty state upload button
      thumbnailOf: 'Thumbnail of',
    },

    controls: {
      accept: 'Accept', // eg. accept terms of use
      add: 'Add', // eg. add a delegate
      allFiles: 'All Files', // shown as tab label on the dashboard
      cancel: 'Cancel', // cancel button
      confirm: 'Confirm',
      confirmDelete: 'Yes, Delete',
      declineAndLogOut: 'Decline & Log Out', // decline TOS button
      delete: 'Delete', // delete document kebab item
      done: 'Done',
      download: 'Download', // edit document kebab item and button text
      editDetails: 'Edit Details', // edit document kebab item
      next: 'Next',
      share: 'Share', // share button
      shared: 'Shared', // label of shared tab on dashboard
      upload: 'Add',
      view: 'View',
    },

    // account settings page
    account: {
      language: 'Language', // open language selector
    },

    // All copy related to the create shared folder flow
    sharing: {
      defaultName: 'Shared Docs {date}',

      confirmSharedFiles: 'File to be shared | Files to be shared',
      plusNMore: '+ {count} more',
      recipients: 'Recipients',

      // placeholder text for the add recipient email field
      addRecipientPlaceholder: 'Enter email address',

      // step titles in the share flow
      confirmTitle: 'Confirm Sharing',
      addRecipientsTitle: 'Share With',
      selectFilesTitle: 'Select Files',

      disclaimerTitle: 'Reminder',
      shareDocumentDisclaimer:
        'Datalocker facilitates document sharing with {emails} email accounts',

      // on the confirmation step, could be "recipient" or "recipients" depending on number of items
      confirmRecipientsLabel: 'Recipient | Recipients',
      tooManyRecipients: 'You can share with up to {count} people', // error text when trying to add more than 10 recipients
    },

    tabTitles: {
      about: 'About',
      authorizing: 'Authorizing', // not important - used while logging in
      dashboard: 'Dashboard',
      document: 'Document', // used for document preview while page is loading, then changes to document title
      faq: 'FAQ',
      shared: 'Shared', // used in share flow
      sharedBy: 'Shared by', // used in share flow
      termsOfUse: 'Terms of Use', // used while viewing TOU
      welcome: 'Welcome', // displayed on the initial landing page
    },

    delegateAccess: {
      pageTitle: 'Account Access', // title in account menu and page title of delegation flow
      menuTitle: 'Who Can Access Your Account', // title in account menu and page title of delegation flow
      emailPlaceholder: 'Add people via email',
      addConfirmationTitle: 'Give this person access to your account?',
      addConfirmationBody:
        'They will be able to manage and share files for you. You can always manage or take away access to your documents in the Account menu settings.',
      addConfirmationAction: 'Yes, Give Access',
      removeConfirmationTitle: 'Remove this person from your account?',
      removeConfirmationBody:
        'They will no longer be able to manage or share files for you. You can always give them access to your documents again in the Account menu settings.',
      removeConfirmationAction: 'Yes, Remove',
      uninviteConfirmationTitle: 'Cancel this invitation?',
      uninviteConfirmationBody:
        'You can resend at any time in the Account menu settings.',
      uninviteConfirmationAction: 'Yes, Cancel',
      tooManyDelegates: 'Up to {count} people can access your account',
      invitePending: 'Invitation pending',
      inviteExpired: 'Invitation expired.',
      resendInvite: 'Resend?',
    },

    // Account Activity
    activity: {
      accessed: 'accessed',
      added: 'added',
      delegateInvited: 'to manage and share files on your behalf',
      delegateAccepted: 'can now manage and share files on your behalf',
      delegateDeleted: 'has been removed from your account',
      deleted: 'deleted',
      edited: 'edited details of',
      file: 'file',
      files: 'files',
      invited: 'invited',
      manage: 'can now manage and share files on your behalf',
      pageTitle: 'Account Activity',
      shared: 'shared',
      today: 'TODAY',
      you: 'You',
    },

    // Copy where you are viewing shared folders
    sharedFolder: {
      // empty state for list of shared folders
      noCollections: "You haven't shared any documents yet.", // message
      shareFirstDocument: 'Share your first document', // call to action

      // empty state for an individual shared folder
      emptyCollection: 'All files have been removed from Datalocker.', // message
      returnDashboard: 'Return to dashboard', // call to action

      // empty state for list of clients who have shared collections with user
      noSharedDocuments: "You haven't received any shared files yet.",
    },

    cbo: {
      selectClient: 'Select a client to access their account',
      clickToRemove: 'Click {close} to remove a client',
      noClientsTitle:
        'You have not been added to any client Datalocker accounts',
      noClientsBody:
        "Once a client adds you to their Datalocker account, you'll be able to manage and share files on their behalf from this screen.\n\nA client can provide access to their documents  in the Account menu settings in Datalocker.",
      noClientActionLabel: 'Not a case worker?',
      noClientActionText: 'Click here for client login',
      removeConfirmationTitle: 'Remove this client from your Datalocker?',
      removeConfirmationBody:
        "You'll no longer have access to shared files. This cannot be undone.",
      removeConfirmationAction: 'Yes, Remove',
      errorAcceptingInvite:
        'Invite could not be accepted. Please ensure you are logged in with the email address that received the invite.',
    },

    agent: {
      clientNameLabel: 'Name', // label of client name column in agent view
      sharedFolderNameLabel: 'Name', // label of shared folder name column in agent view
      reorderFiles: 'Reorder Files', // shown in agent view when downloading as PDF
      downloadZip: 'Download Zip',
      dateShared: 'Date Shared', // label in side bar
      sharedBy: 'Shared By', // label in side bar
      selectClient: 'Select client to access shared files',
    },

    $vuetify: {
      ...en,
      dataTable: {
        sortBy: 'Sort by',
        ariaLabel: {
          sortNone: 'Do not sort',
          activateAscending: 'Sort ascending',
        },
      },
      noDataText: 'No data',
    },
  },
}
