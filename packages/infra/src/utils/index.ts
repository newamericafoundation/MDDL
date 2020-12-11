import { readFileSync } from 'fs'
import { join } from 'path'

export const getCognitoHostedLoginCss = (logoUrl?: string) => {
  const bannerBackgroundUrl = logoUrl
    ? logoUrl
    : 'data:image/svg+xml;base64,' +
      readFileSync(join(__dirname, '..', 'assets', 'banner.svg')).toString(
        'base64',
      )

  const css = readFileSync(
    join(__dirname, '..', 'assets', 'hostedLogin.css'),
    'utf8',
  )

  return css.replace('__BANNER_BACKGROUND_URL__', bannerBackgroundUrl)
}

export const pathToApiServiceLambda = (name: string) =>
  join(__dirname, '..', '..', '..', 'api-service', 'build', `${name}.zip`)
