// eslint-disable-next-line @typescript-eslint/no-var-requires
const en: any = require('vuetify/lib/locale/en')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const es: any = require('vuetify/lib/locale/es')
// import es from 'vuetify/lib/locale/es'

export default {
  en: {
    name: 'name', // TODO: replace with filename

    // label appearing in tabular content (list of users, list of shared collections etc)
    dateAdded: 'date added',

    toast: {
      accountRemoved: 'account removed',
      downloadLoadingState: 'preparing download',
      collectionCreated: 'shared folder created.',
      sharingComplete: 'sharing complete.',
      uploading: 'adding file...', // displayed while a file is uploading
      uploadComplete: 'file added',
      fileDeletedConfirmation: 'file deleted.',
    },

    login: {
      getStarted: 'Get started',
      loggingIn: 'Loggin in...',
      welcomeTitle: 'welcome to Datalocker',
      welcomeMessage:
        "we're here to help you share documents with case managers in a way that's easy, convenient, and secure.",
    },

    navigation: {
      account: 'account', // navigate to account settings in nav menu
      activity: 'activity',
      loggingIn: 'logging in...',
      manageAccounts: 'Manage Clients',
      dashboard: 'dashboard',
      switchAccount: 'Switch Clients',
      signIn: 'sign in',
      signOut: 'sign out',
    },

    document: {
      // This is the title of the confirmation dialog for deleting a document
      deleteConfirmationTitle: 'Are you sure you want to delete this file?',
      // This is the body content of the confirmation dialog for deleting a document
      deleteConfirmationBody:
        'Anyone with shared access will no longer be able to view this file. This cannot be undone.',
      downloadZip: 'download Zip',
      downloadPdf: 'download PDF',
      description: 'description', // displayed beneath the document and expands to show description (if any)
      editDetailsTitle: 'edit details', // page title on edit details screen
      enterNamePlaceholder: 'enter new file name',
      enterDescriptionPlaceholder: 'enter description',
      fileName: 'file name', // shown as a label on edit details screen

      noDocuments: 'there are no files saved to your account', // shown on dashboard when there are no documents
      uploadFirst: 'Add Your First File', // label on the empty state upload button
    },

    controls: {
      cancel: 'cancel', // cancel button
      share: 'share', // share button
      allFiles: 'all files', // shown as tab label on the dashboard
      shared: 'share', // label of shared tab on dashboard
      confirm: 'confirm',
      done: 'done',
      delete: 'delete', // delete document kebab item
      editDetails: 'edit details', // edit document kebab item
      download: 'download', // edit document kebab item and button text
      next: 'next',
      upload: 'add',
      add: 'add', // add a delegate
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
      confirmSharedFiles: 'file to be shared | files to be shared',
      plusNMore: '+ {count} more',
      recipients: 'recipients',

      // placeholder text for the add recipient email field
      addRecipientPlaceholder: 'enter email address',

      // step titles in the share flow
      confirmTitle: 'Confirm Sharing',
      addRecipientsTitle: 'Share With',
      selectFilesTitle: 'Select Files',

      disclaimer: 'disclaimer',
      shareDocumentDisclaimer:
        'never send your documents to anyone who is not a government official.',
      shareSettingsDisclaimer:
        'you can change these settings any time in the collections information menu.',

      // on the confirmation step, could be "recipient" or "recipients" depending on number of items
      confirmRecipientsLabel: 'recipient | recipients',
      tooManyRecipients: 'you can share with up to {count} people', // error text when trying to add more than 10 recipients
    },

    tabTitles: {
      shared: 'shared', // used in share flow
      dashboard: 'dashboard',
      document: 'document', // used for document preview while page is loading, then changes to document title
      authorizing: 'authorizing', // not important - used while logging in
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
      tooManyDelegates: 'up to {count} people can access your account',
    },

    activity: {
      pageTitle: 'Account Activity',
      accessedNItems: 'accessed {count} item | accessed {count} items',
      sharedNItems: 'shared {count} item | shared {count} items',
      uploadNItems: 'uploaded {count} document | uploaded {count} documents',
      deleteNDocuments: 'deleted {count} document | deleted {count} documents',
      gaveAccess: 'gave access to:', // will be followed by list of emails
      acceptedAccess: 'accepted access to your account', // when invited delegate accepts access
      declinedAccess: 'declined access to your account', // when invited delegate declines access
      removeDelegate: 'was removed from your account', // when invited delegate declines access
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
      noSharedDocuments: 'No documents have been shared with you yet.',
    },

    agent: {
      clientNameLabel: 'name', // label of client name column in agent view
      sharedFolderNameLabel: 'name', // label of shared folder name column in agent view
      selectClient: 'select client to access files.',
      reorderFiles: 'reorder files', // shown in agent view when downloading as PDF
      downloadZip: 'Download Zip',
      dateShared: 'Date Shared', // label in side bar
      sharedBy: 'Shared By', // label in side bar
    },

    $vuetify: en,
  },

  // Special test language iso code
  // see http://chaoticshiny.com/langreplace.php (sibilant 1)
  test: {
    $vuetify: es, // idk, just use spanish for the test language vuetify translations lol
  },
}
