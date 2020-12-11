import { CspEnum } from '../../types/environment'
/**
 * Content Security Policy helpers
 */

const connectSrc: Array<string | undefined> = ["'self'", process.env.API_URL]
const scriptSrc: Array<string | undefined> = ["'self'"]
const imgSrc: Array<string | undefined> = ["'self'"]
const frameSrc: Array<string | undefined> = ["'self'"]

export function getSrc(srcType: CspEnum, envVar: any) {
  let arr: Array<string | undefined>
  let source: Array<string | undefined> = []

  switch (srcType) {
    case CspEnum.CONNECT:
      source = connectSrc
      break
    case CspEnum.IMAGE:
      source = imgSrc
      break
    case CspEnum.FRAME:
      source = frameSrc
      break
    case CspEnum.SCRIPT:
      source = scriptSrc
      break
  }

  if (envVar) {
    const arr2 = envVar.split(',')
    arr = [...source, ...arr2]
  } else {
    arr = source
  }
  return arr
}
