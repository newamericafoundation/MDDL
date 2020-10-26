import { getUserInfo } from './oauth'
import { getObjectKeys } from './test'

// this is an integration test so is skipped but checked in to validate behaviour if needed
describe.skip('getUserInfo', () => {
  it('returns userInfo for valid token', async () => {
    process.env.USERINFO_ENDPOINT = 'my-oauth-userinfo-endpoint'
    const token = 'Bearer myToken'
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
