import { captureException } from './sentry'

type Logger = {
  log(message: any, ...optionalParams: any[]): void
  warn(message: any, ...optionalParams: any[]): void
  error(error: Error, ...optionalParams: any[]): void
}

export const logger: Logger = {
  log: (message: any, ...optionalParams: any[]) => {
    console.log(message, ...optionalParams)
  },
  warn: (message: any, ...optionalParams: any[]) => {
    console.warn(message, ...optionalParams)
  },
  error: (error: Error, ...optionalParams: any[]) => {
    console.error(error, ...optionalParams)
    captureException(error)
  },
}
