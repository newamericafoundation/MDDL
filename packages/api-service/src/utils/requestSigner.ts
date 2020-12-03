import { EnvironmentVariable, requireConfiguration } from '@/config'
import { createHmac } from 'crypto'
import { parse as urlParse } from 'url'
import { parse as qsParse, ParsedUrlQuery } from 'querystring'
import {
  zonedTimeToUtc,
  utcToZonedTime,
  format as dateFormat,
} from 'date-fns-tz'
import { getIntegrationType, IntegrationType } from './oauthIntegration'

const getSigningKey = () =>
  requireConfiguration(EnvironmentVariable.AUTH_SIGNING_KEY)

const hmacSha256 = (data: string, secret: string) => {
  return createHmac('sha256', secret).update(data).digest('hex')
}

type GetNycIdSignatureProps = {
  method: string
  path: string
  queryArgs: ParsedUrlQuery
  authorizationHeader: string | undefined
}

const getSortedQueryArgs = (queryArgs: ParsedUrlQuery) => {
  const sortedKeys = Object.keys(queryArgs).sort()
  return sortedKeys
    .map((k) => {
      if (Array.isArray(queryArgs[k])) {
        return (queryArgs[k] as string[]).sort().join('')
      }
      return queryArgs[k]
    })
    .join('')
}

export const getNycIdSignature = (props: GetNycIdSignatureProps): string => {
  const { method, path, queryArgs, authorizationHeader = '' } = props
  const signingKey = getSigningKey()
  const stringToSign = `${method}${path}${getSortedQueryArgs(
    queryArgs,
  )}${authorizationHeader}`
  return hmacSha256(stringToSign, signingKey)
}

const getDateTimeArg = () => {
  return dateFormat(
    utcToZonedTime(
      zonedTimeToUtc(
        new Date(),
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      ),
      'America/New_York',
    ),
    'MM/dd/yyyy HH:mm',
  )
}

export const signRequest = (
  method: 'GET' | 'POST',
  urlToSign: string,
  headers: Record<string, string>,
): string => {
  const integrationType = getIntegrationType()

  switch (integrationType) {
    case IntegrationType.NYCID_OAUTH:
      // parse the url
      const parsedUrl = urlParse(urlToSign)
      // get query args
      const queryArgs = qsParse(parsedUrl.query ?? '')

      // add/handle dateTime arg
      if (!queryArgs['dateTime']) {
        const dateTimeArg = getDateTimeArg()
        queryArgs['dateTime'] = dateTimeArg
        const joinStr = Object.keys(queryArgs).length > 1 ? '&' : '?'
        urlToSign += `${joinStr}dateTime=${encodeURIComponent(dateTimeArg)}`
      }

      // generate the signature
      const signature = getNycIdSignature({
        method,
        path: parsedUrl.pathname || '',
        queryArgs,
        authorizationHeader: headers['Authorization'] || undefined,
      })
      return `${urlToSign}&signature=${signature}`
    default:
      return urlToSign
  }
}
