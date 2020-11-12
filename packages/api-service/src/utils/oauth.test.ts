import { requireConfiguration } from '@/config'
import { getUserInfo } from './oauth'
import { getObjectKeys, toMockedFunction } from './test'

jest.mock('@/config')

// this is an integration test so is skipped but checked in to validate behaviour if needed
describe.skip('getUserInfo', () => {
  beforeAll(() => {
    toMockedFunction(requireConfiguration).mockImplementationOnce(
      () => 'my-oauth-userinfo-endpoint',
    )
  })
  it('returns userInfo for valid token', async () => {
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
