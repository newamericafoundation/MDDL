/* eslint-disable @typescript-eslint/no-var-requires */
import SES from 'aws-sdk/clients/ses'
import { render } from 'mustache'
import {
  EnvironmentVariable,
  isProduction,
  requireConfiguration,
} from '@/config'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const ses = new SES()

const templatePath = 'templates'

const loadedTemplates: { [index: string]: string } = {}

const loadTemplate = (templateName: string) => {
  if (!loadedTemplates[templateName]) {
    const templateResolvedPath = join(
      __dirname,
      templatePath,
      `${templateName}.mustache`,
    )
    if (!existsSync(templateResolvedPath)) {
      throw new Error(`${templateName} not found`)
    }
    loadedTemplates[templateName] = readFileSync(templateResolvedPath, 'utf8')
  }
  return loadedTemplates[templateName]
}

const partials = {
  header: loadTemplate('header'),
  footer: loadTemplate('footer'),
  horizontalRule: loadTemplate('horizontalRule'),
}

type SendEmailOptions = {
  template: string
  subject: string
  data: any
  destination: SES.Destination
  forceSend?: boolean
}

const renderTemplate = (template: string, data: any) => {
  return render(loadTemplate(template), data, partials)
}

export const sendEmail = async (opts: SendEmailOptions) => {
  const { template, subject, data, destination, forceSend = false } = opts
  const emailSender = requireConfiguration(EnvironmentVariable.EMAIL_SENDER)
  const webAppDomain =
    'https://' + requireConfiguration(EnvironmentVariable.WEB_APP_DOMAIN)
  const body = renderTemplate(template, {
    ...data,
    webAppDomain,
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
