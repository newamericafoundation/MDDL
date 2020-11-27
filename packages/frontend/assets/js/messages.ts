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
    termsOfUse: {
      body:
        'Aenean lacinia bibendum nulla sed consectetur. Vestibulum id ligula porta felis euismod semper. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nullam quis risus eget urna mollis ornare vel eu leo. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Curabitur blandit tempus porttitor. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Aenean lacinia bibendum nulla sed consectetur. Maecenas faucibus mollis interdum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Duis mollis, est non commodo luctus, nisi erat porttitor ligula',
      title: 'Terms Of Use',
    },

    toast: {
      acceptedDelegateInvite: 'Delegate access accepted.',
      accountRemoved: 'account removed',
      downloadLoadingState: 'preparing download',
      collectionCreated: 'shared folder created.',
      sharingComplete: 'sharing complete.',
      switchAccount: 'switch account',
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
      account: 'account',
      activity: 'activity',
      loggingIn: 'logging in...',
      manageAccounts: 'Manage Clients',
      signIn: 'sign in',
      signOut: 'sign out',
      switchAccount: 'Switch Clients',
      termsOfUse: 'Terms of Use',
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
      previewOf: 'Preview of',
      uploadFirst: 'Add Your First File', // label on the empty state upload button
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
      sharedBy: 'shared by', // used in share flow
      dashboard: 'dashboard',
      document: 'document', // used for document preview while page is loading, then changes to document title
      authorizing: 'authorizing', // not important - used while logging in
      termsOfUse: 'Terms of Use', // used while viewing TOU
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
      noSharedDocuments: 'No documents have been shared with you yet.',
    },

    cbo: {
      selectClient: 'select client to access shared files.',
      clickToRemove: 'click {close} to remove client',
      noClients:
        "Once a client adds you to their datalocker account, you'll be able to manage and share files on their behalf from this screen. A client can provide access by navigating to the Account menu in the Datalocker app.",
      removeConfirmationTitle:
        'Are you sure you want to remove this client from your Datalocker?',
      removeConfirmationBody:
        "You'll no longer have access to shared files. This cannot be undone.",
      errorAcceptingInvite: 'Invite could not be accepted.',
    },

    agent: {
      clientNameLabel: 'name', // label of client name column in agent view
      sharedFolderNameLabel: 'name', // label of shared folder name column in agent view
      reorderFiles: 'reorder files', // shown in agent view when downloading as PDF
      downloadZip: 'Download Zip',
      dateShared: 'Date Shared', // label in side bar
      sharedBy: 'Shared By', // label in side bar
    },

    $vuetify: {
      ...en,
      dataTable: {
        sortBy: 'Sort by',
      },
    },
  },
}
