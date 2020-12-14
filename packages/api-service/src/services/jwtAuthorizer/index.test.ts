import { handler } from '@/services/jwtAuthorizer'
import { decodeToken } from '@/utils/jwt'
import { toMockedFunction } from '@/utils/test'

jest.mock('@/utils/jwt')
jest.mock('@/utils/logging')

describe('jwtAuthorizer', () => {
  it('rejects bad event', async () => {
    expect(await handler({ headers: {} })).toMatchInlineSnapshot(`
      Object {
        "isAuthorized": false,
      }
    `)
  })
  it('rejects when token not parsed', async () => {
    toMockedFunction(decodeToken).mockImplementationOnce(async () =>
      Promise.reject('invalid token!'),
    )
    expect(
      await handler({
        headers: {
          authorization: 'Bearer myToken',
        },
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "isAuthorized": false,
      }
    `)
  })
  it('succeeds when token parsed', async () => {
    expect(
      await handler({
        headers: {
          authorization: 'Bearer myToken',
        },
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "context": Object {
          "aud": "World",
          "iat": 1400062400223,
          "iss": "my_issuer",
        },
        "isAuthorized": true,
      }
    `)
  })
})
