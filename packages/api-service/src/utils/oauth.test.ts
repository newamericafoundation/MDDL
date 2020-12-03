import { EnvironmentVariable, requireConfiguration } from '@/config'
import { getUserInfo } from './oauth'
import { IntegrationType } from './oauthIntegration'
import { getObjectKeys, toMockedFunction } from './test'

jest.mock('@/config')

const userInfoEndpoint = 'my-oauth-userinfo-endpoint'
const token = 'Bearer myToken'
const signingKey = 'mySigningKey'
const integrationType = IntegrationType.OAUTH

// this is an integration test so is skipped but checked in to validate behaviour if needed
describe.skip('getUserInfo', () => {
  beforeAll(() => {
    toMockedFunction(requireConfiguration)
      .mockReset()
      .mockImplementation((key) => {
        switch (key) {
          case EnvironmentVariable.USERINFO_ENDPOINT:
            return userInfoEndpoint
          case EnvironmentVariable.AUTH_INTEGRATION_TYPE:
            return integrationType
          case EnvironmentVariable.AUTH_SIGNING_KEY:
            return signingKey
          default:
            console.log('RETURNING DEFAULT ', key)
            return key
        }
      })
  })
  afterAll(() => {
    toMockedFunction(requireConfiguration).mockRestore()
  })
  it('returns userInfo for valid token', async () => {
    expect(getObjectKeys(await getUserInfo(token))).toMatchInlineSnapshot(`
      Array [
        "sub",
        "email_verified",
        "given_name",
        "family_name",
        "email",
        "username",
      ]
    `)
  })
})
