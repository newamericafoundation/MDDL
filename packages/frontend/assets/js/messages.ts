// eslint-disable-next-line @typescript-eslint/no-var-requires
const en: any = require('vuetify/lib/locale/en')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const es: any = require('vuetify/lib/locale/es')
// import es from 'vuetify/lib/locale/es'

export default {
  en: {
    datalocker: 'Datalocker',
    name: 'name', // TODO: replace with filename

    // label appearing in tabular content (list of users, list of shared collections etc)
    // as well as side bar on document view
    dateAdded: 'Date Added',

    toast: {
      acceptedDelegateInvite: 'Delegate access accepted.',
      accountRemoved: 'account removed',
      downloadLoadingState: 'preparing download',
      sharingComplete: 'Sharing complete',
      switchAccount: 'switch clients',
      uploading: 'adding file...', // displayed while a file is uploading
      uploadComplete: 'file added',
      fileDeletedConfirmation: 'file deleted.',
    },

    login: {
      getStarted: 'Get started',
      welcomeTitle: 'welcome to Datalocker',
      welcomeMessage: {
        CLIENT:
          "We're here to help you share documents with case managers in a way that's easy, convenient, and secure.",
        CBO:
          "We're here to help coordinate the secure collection and controlled distribution of client documents and files.",
        AGENT:
          'This platform helps facilitate the collection and distribution of documents between clients, case managers, and agencies.',
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
      manageAccounts: 'Manage Clients',
      signIn: 'Sign in',
      signOut: 'Sign out',
      switchAccount: 'Switch Clients',
      termsOfUse: 'Terms of Use',
    },

    document: {
      // This is the title of the confirmation dialog for deleting a document
      deleteConfirmationTitle: 'Are you sure you want to delete this file?',
      // This is the body content of the confirmation dialog for deleting a document
      deleteConfirmationBody:
        'Anyone with shared access will no longer be able to view this file. This cannot be undone.',
      documentMenu: 'Document menu',
      downloadZip: 'download Zip',
      downloadPdf: 'download PDF',
      description: 'description', // displayed beneath the document and expands to show description (if any)
      editDetailsTitle: 'edit details', // page title on edit details screen
      enterNamePlaceholder: 'enter new file name',
      enterDescriptionPlaceholder: 'enter description',
      fileName: 'file name', // shown as a label on edit details screen

      noDocuments: 'there are no files saved to your account', // shown on dashboard when there are no documents
      previewOf: 'Preview of',
      uploadFirst: 'Add your first file', // label on the empty state upload button
      thumbnailOf: 'Thumbnail of',
    },

    controls: {
      accept: 'accept', // eg. accept terms of use
      add: 'add', // eg. add a delegate
      allFiles: 'all files', // shown as tab label on the dashboard
      cancel: 'cancel', // cancel button
      confirm: 'confirm',
      declineAndLogOut: 'decline & log out', // decline TOS button
      delete: 'delete', // delete document kebab item
      done: 'done',
      download: 'download', // edit document kebab item and button text
      editDetails: 'edit details', // edit document kebab item
      next: 'next',
      share: 'share', // share button
      shared: 'share', // label of shared tab on dashboard
      upload: 'add',
      view: 'view',
    },

    // account settings page
    account: {
      language: 'language', // open language selector
      pageTitle: 'account settings',
      deleteAccount: 'delete your account',
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
      shareSettingsDisclaimer:
        'you can change these settings any time in the collections information menu.',

      // on the confirmation step, could be "recipient" or "recipients" depending on number of items
      confirmRecipientsLabel: 'Recipient | Recipients',
      tooManyRecipients: 'You can share with up to {count} people', // error text when trying to add more than 10 recipients
    },

    tabTitles: {
      about: 'About',
      authorizing: 'authorizing', // not important - used while logging in
      dashboard: 'dashboard',
      document: 'document', // used for document preview while page is loading, then changes to document title
      faq: 'FAQ',
      shared: 'shared', // used in share flow
      sharedBy: 'shared by', // used in share flow
      termsOfUse: 'Terms of Use', // used while viewing TOU
      welcome: 'Welcome', // displayed on the initial landing page
    },

    delegateAccess: {
      pageTitle: 'Account Access', // title in account menu and page title of delegation flow
      menuTitle: 'Who Can Access Your Account', // title in account menu and page title of delegation flow
      emailPlaceholder: 'add people via email',
      addConfirmationTitle: 'are you sure you want to add this person?',
      addConfirmationBody:
        'They will be able to manage and share files on your behalf. You can always revoke access via the Account menu.',
      removeConfirmationTitle:
        'Are you sure you want to remove this person from your account?',
      removeConfirmationBody:
        'They will no longer be able to manage or share files on your behalf. You can always grant access again via the Account menu.',
      uninviteConfirmationTitle:
        'Are you sure you want to cancel this invitation?',
      uninviteConfirmationBody: 'You can resend any time using this screen.',
      tooManyDelegates: 'up to {count} people can access your account',
      invitePending: 'Invitation pending',
      inviteExpired: 'Invitation expired.',
      resendInvite: 'Resend?',
    },

    // Account Activity
    activity: {
      accessed: 'accessed',
      added: 'added',
      delegateInvited: 'to access your account',
      delegateAccepted: 'can now access your account',
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
      noCollections: "you haven't shared any documents yet.", // message
      shareFirstDocument: 'share your first document', // call to action

      // empty state for an individual shared folder
      emptyCollection: 'all files have been removed from Datalocker.', // message
      returnDashboard: 'return to dashboard', // call to action

      // empty state for list of clients who have shared collections with user
      noSharedDocuments: "You haven't received any shared files yet.",
    },

    cbo: {
      selectClient: 'Select a client to access their account',
      clickToRemove: 'Click {close} to remove a client',
      noClientsTitle: 'No clients added yet',
      noClientsBody:
        'A client can provide access by navigating to their Account menu.',
      removeConfirmationTitle:
        'Are you sure you want to remove this client from your Datalocker?',
      removeConfirmationBody:
        "You'll no longer have access to shared files. This cannot be undone.",
      errorAcceptingInvite:
        'Invite could not be accepted. Please ensure you are logged in with the email address that received the invite.',
    },

    agent: {
      clientNameLabel: 'name', // label of client name column in agent view
      sharedFolderNameLabel: 'name', // label of shared folder name column in agent view
      reorderFiles: 'reorder files', // shown in agent view when downloading as PDF
      downloadZip: 'Download Zip',
      dateShared: 'Date Shared', // label in side bar
      sharedBy: 'Shared By', // label in side bar
      selectClient: 'Select a client to view their files',
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
