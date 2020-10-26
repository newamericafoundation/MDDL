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
  const endpoint = process.env.USERINFO_ENDPOINT
  if (!endpoint) {
    throw new Error('USERINFO_ENDPOINT not available!')
  }
  const result = await fetch(endpoint, {
    headers: {
      Authorization: token,
    },
  })
  return await result.json()
}
