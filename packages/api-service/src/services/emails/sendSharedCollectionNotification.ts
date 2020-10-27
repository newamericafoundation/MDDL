/* eslint-disable @typescript-eslint/no-var-requires */
import { sendEmail } from '@/services/emails/emailSender'
import template from './templates/collectionSharedNotification.mustache'

interface Options {
  emails: string[]
  collection: {
    name: string
    link: string
  }
}

export const sendSharedCollectionNotification = async (opts: Options) => {
  const { emails, collection } = opts
  return await Promise.all(
    emails.map((to) =>
      sendEmail({
        template,
        destination: {
          ToAddresses: [to],
        },
        subject: `Data Locker: You've been sent documents`,
        data: collection,
      }),
    ),
  )
}
