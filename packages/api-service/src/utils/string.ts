import { createHash } from 'crypto'

export const hashString = (str: string) => {
  const shasum = createHash('sha256')
  shasum.update(str)
  return shasum.digest('hex')
}

export const toBase64String = (str: string) => {
  return Buffer.from(str, 'utf-8').toString('base64')
}

export const fromBase64String = (base64: string) => {
  return Buffer.from(base64, 'base64').toString('utf-8')
}
