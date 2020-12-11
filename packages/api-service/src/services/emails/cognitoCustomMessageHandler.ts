import { EnvironmentVariable, requireConfiguration } from '@/config'
import { getParameterValue } from '@/utils/parameters'
import { wrapAsyncHandler } from '@/utils/sentry'
import { renderTemplate } from './renderer'

export enum TriggerSource {
  CustomMessage_SignUp = 'CustomMessage_SignUp',
  CustomMessage_AdminCreateUser = 'CustomMessage_AdminCreateUser',
  CustomMessage_ResendCode = 'CustomMessage_ResendCode',
  CustomMessage_ForgotPassword = 'CustomMessage_ForgotPassword',
  CustomMessage_UpdateUserAttribute = 'CustomMessage_UpdateUserAttribute',
  CustomMessage_VerifyUserAttribute = 'CustomMessage_VerifyUserAttribute',
  CustomMessage_Authentication = 'CustomMessage_Authentication',
}

const SourceMapping: {
  [index: string]: { template: string; subject: string }
} = {
  [TriggerSource.CustomMessage_ResendCode]: {
    subject: 'Data Locker: Welcome!',
    template: 'welcome',
  },
  [TriggerSource.CustomMessage_SignUp]: {
    subject: 'Data Locker: Welcome!',
    template: 'welcome',
  },
  [TriggerSource.CustomMessage_ForgotPassword]: {
    subject: 'Data Locker: Your verification code',
    template: 'passwordReset',
  },
}

export type CognitoCustomMessageEvent = {
  version: number
  triggerSource: TriggerSource
  region: string
  userPoolId: string
  userName: string
  callerContext: {
    [index: string]: string
    awsSdk: string
    clientId: string
  }
  request: {
    userAttributes: {
      [index: string]: string
    }
    codeParameter?: string
    linkParameter?: string
    usernameParameter?: string
    clientMetadata: {
      [index: string]: string
    }
  }
  response: {
    smsMessage?: string
    emailMessage?: string
    emailSubject?: string
  }
}

const clientWebApps: { [index: string]: string } = {}

const loadWebAppForClientId = async (clientId: string) => {
  if (!clientWebApps[clientId]) {
    const webAppDomain = await getParameterValue(
      requireConfiguration(EnvironmentVariable.CLIENT_WEB_APP_PARAMETER_PATH) +
        `/${clientId}`,
    )
    // if web app domain has not been set, we'll just set empty so the email will still send (but will not show logo)
    // this should only happen if the parameter for the city has not yet been deployed (it is part of the cloudformation stack)
    clientWebApps[clientId] = webAppDomain || ''
  }
  return clientWebApps[clientId]
}

export const handler = wrapAsyncHandler(
  async (
    event: CognitoCustomMessageEvent,
  ): Promise<CognitoCustomMessageEvent> => {
    if (SourceMapping[event.triggerSource]) {
      const { template, subject } = SourceMapping[event.triggerSource]
      event.response.emailSubject = subject
      event.response.emailMessage = renderTemplate(template, {
        webAppLogoSrc:
          (await loadWebAppForClientId(event.callerContext.clientId)) +
          '/images/city-logo.png',
        ...event.request,
      })
    }
    return Promise.resolve(event)
  },
  {
    rethrowAfterCapture: true,
  },
)
