import { EnvironmentVariable, requireConfiguration } from '@/config'
import { decode } from 'json-web-token'

const getSigningKey = () =>
  requireConfiguration(EnvironmentVariable.AUTH_SIGNING_KEY)

export const decodeToken = async (token: string) => {
  return new Promise<any>((resolve, reject) => {
    decode(getSigningKey(), token, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data as any)
      }
    })
  })
}
