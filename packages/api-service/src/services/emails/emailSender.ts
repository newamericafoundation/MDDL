/* eslint-disable @typescript-eslint/no-var-requires */
import SES from 'aws-sdk/clients/ses'
import {
  EnvironmentVariable,
  isProduction,
  requireConfiguration,
} from '@/config'
import { captureAWSClient } from 'aws-xray-sdk'
import { renderTemplate } from './renderer'

const ses = captureAWSClient(new SES())

type SendEmailOptions = {
  template: string
  subject: string
  data: any
  destination: SES.Destination
  forceSend?: boolean
}

export const sendEmail = async (opts: SendEmailOptions) => {
  const { template, subject, data, destination, forceSend = false } = opts
  const emailSender = requireConfiguration(EnvironmentVariable.EMAIL_SENDER)
  const webAppLogoSrc =
    'https://' +
    requireConfiguration(EnvironmentVariable.WEB_APP_DOMAIN) +
    '/images/city-logo.png'
  const body = renderTemplate(template, {
    ...data,
    webAppLogoSrc,
  })
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
      if (!forceSend && !isProduction()) {
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
