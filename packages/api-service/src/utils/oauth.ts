import { EnvironmentVariable, requireConfiguration } from '@/config'
import fetch from 'node-fetch'

type UserInfo = {
  sub: string
  email_verified: 'true' | 'false'
  given_name: string
  family_name: string
  email: string
  username: string
}
export const getUserInfo = async (token: string): Promise<UserInfo> => {
  const endpoint = requireConfiguration(EnvironmentVariable.USERINFO_ENDPOINT)
  const result = await fetch(endpoint, {
    headers: {
      Authorization: token,
    },
  })
  return await result.json()
}
