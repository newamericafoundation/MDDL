/* eslint-disable @typescript-eslint/no-var-requires */
import SES from 'aws-sdk/clients/ses'
import { render } from 'mustache'
import header from './templates/header.mustache'
import footer from './templates/footer.mustache'

const ses = new SES()
const emailSender = process.env.EMAIL_SENDER as string

const partials = {
  header,
  footer,
}

type SendEmailOptions = {
  template: string
  subject: string
  data: any
  destination: SES.Destination
  forceSend?: boolean
}

export const sendEmail = async (opts: SendEmailOptions) => {
  const { template, subject, data, destination, forceSend = false } = opts
  const body = render(template, data, partials)
  return new Promise<SES.SendEmailResponse & { Request: SES.SendEmailRequest }>(
    (resolve, reject) => {
      const request = {
        Destination: destination,
        Message: {
          Subject: {
            Data: subject,
            Charset: 'utf8',
          },
          Body: {
            Html: {
              Data: body,
              Charset: 'utf8',
            },
          },
        },
        Source: emailSender,
      }
      if (!forceSend && process.env.NODE_ENV !== 'production') {
        resolve({
          Request: request,
          MessageId: 'MOCKMESSAGEID',
        })
        return
      }
      ses.sendEmail(request, (err, data) => {
        if (err) reject(err)
        else
          resolve({
            Request: request,
            ...data,
          })
      })
    },
  )
}
