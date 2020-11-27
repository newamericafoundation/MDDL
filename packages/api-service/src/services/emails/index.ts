import { EnvironmentVariable, requireConfiguration } from '@/config'
import { putMessage } from '@/utils/sqs'
import { SendRequest } from './validation'

const getQueueUrl = () =>
  requireConfiguration(EnvironmentVariable.EMAIL_PROCESSOR_SQS_QUEUE_URL)

const sendEmailRequest = async (sendRequest: SendRequest) => {
  await putMessage(sendRequest, getQueueUrl(), {
    MessageGroupId: sendRequest.template,
  })
}

type SendSharedCollectionOptions = {
  emails: string[]
  collection: {
    name: string
    link: string
  }
}

export const queueSharedCollectionNotification = async (
  opts: SendSharedCollectionOptions,
) => {
  const { emails, collection } = opts
  await sendEmailRequest({
    template: 'collectionSharedNotification',
    toAddresses: emails,
    subject: `Data Locker: You've been sent documents`,
    data: collection,
  })
}

type SendDelegateUserInvitationOptions = {
  email: string
  userName: string
  acceptLink: string
}

export const queueDelegateUserInvitation = async (
  opts: SendDelegateUserInvitationOptions,
) => {
  const { email, userName, acceptLink } = opts
  await sendEmailRequest({
    template: 'delegateUserInvite',
    toAddresses: [email],
    subject: `Data Locker: You've been granted access to an account`,
    data: {
      name: userName,
      link: acceptLink,
    },
  })
}
