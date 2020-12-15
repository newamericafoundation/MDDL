export enum EnvironmentVariable {
  NODE_ENV = 'NODE_ENV',
  DOCUMENTS_BUCKET = 'DOCUMENTS_BUCKET',
  USERINFO_ENDPOINT = 'USERINFO_ENDPOINT',
  WEB_APP_DOMAIN = 'WEB_APP_DOMAIN',
  EMAIL_SENDER = 'EMAIL_SENDER',
  AGENCY_EMAIL_DOMAINS_WHITELIST = 'AGENCY_EMAIL_DOMAINS_WHITELIST',
  CREATE_COLLECTION_ZIP_FUNCTION_NAME = 'CREATE_COLLECTION_ZIP_FUNCTION_NAME',
  ACTIVITY_RECORD_SQS_QUEUE_URL = 'ACTIVITY_RECORD_SQS_QUEUE_URL',
  ACTIVITY_CLOUDWATCH_LOG_GROUP = 'ACTIVITY_CLOUDWATCH_LOG_GROUP',
  EMAIL_PROCESSOR_SQS_QUEUE_URL = 'EMAIL_PROCESSOR_SQS_QUEUE_URL',
  SENTRY_DSN = 'SENTRY_DSN',
  ENVIRONMENT_NAME = 'ENVIRONMENT_NAME',
  AUTH_SIGNING_KEY = 'AUTH_SIGNING_KEY',
  AUTH_INTEGRATION_TYPE = 'AUTH_INTEGRATION_TYPE',
  AUTH_EMAIL_UNVERIFIED_REDIRECT = 'AUTH_EMAIL_UNVERIFIED_REDIRECT',
  CLIENT_WEB_APP_PARAMETER_PATH = 'CLIENT_WEB_APP_PARAMETER_PATH',
}

export const getConfiguration = (
  key: EnvironmentVariable,
): string | undefined => {
  return process.env[key]
}

export const isProduction = () =>
  getConfiguration(EnvironmentVariable.NODE_ENV) === 'production'

export const requireConfiguration = (key: EnvironmentVariable) => {
  const configuration = getConfiguration(key)
  if (configuration === undefined) {
    throw new Error(`Configuration key ${key} not found!`)
  }
  return configuration
}
