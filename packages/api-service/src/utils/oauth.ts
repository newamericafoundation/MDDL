import { EnvironmentVariable, requireConfiguration } from '@/config'
import fetch from 'node-fetch'
import { logger } from './logging'
import { getIntegrationType, IntegrationType } from './oauthIntegration'
import { signRequest } from './requestSigner'
import createError from 'http-errors'

type UserInfo = {
  sub: string
  email_verified: 'true' | 'false'
  given_name: string | undefined
  family_name: string | undefined
  email: string
  username: string
}
export const getUserInfo = async (token: string): Promise<UserInfo> => {
  const endpoint = requireConfiguration(EnvironmentVariable.USERINFO_ENDPOINT)
  const headers = {
    Authorization: token,
  }
  const signedUrl = signRequest('GET', endpoint, headers)
  const result = await fetch(signedUrl, {
    headers,
  })
  if (!result.ok) {
    // generally this error is from a bad token, but if we're not sure we'll log it
    const text = await result.text()
    if (!text.includes('cpui.oauth.unknownOauthAccessToken')) {
      // doesn't look like a bad token error
      logger.error(
        new Error(`User info could not be fetched: ${result.status} ${text}`),
      )
    }
    throw new createError.Unauthorized()
  }
  return mapResultToUserData(await result.json())
}

const mapResultToUserData = (data: any): UserInfo => {
  const integrationType = getIntegrationType()
  switch (integrationType) {
    case IntegrationType.NYCID_OAUTH:
      const {
        email,
        id: username,
        validated: email_verified,
        firstName: given_name,
        lastName: family_name,
      } = data
      return {
        email,
        email_verified,
        sub: username,
        username,
        family_name,
        given_name,
      }
    default:
      return data as UserInfo
  }
}
