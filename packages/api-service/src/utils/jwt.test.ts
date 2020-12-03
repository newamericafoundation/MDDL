import { EnvironmentVariable, requireConfiguration } from '@/config'
import { toMockedFunction } from './test'
import { encode } from 'json-web-token'
import { decodeToken } from './jwt'

jest.mock('@/config')

const signingKey = 'mySigningKey'

const createToken = async (key: string, payload: any) => {
  return new Promise<string>((resolve, reject) => {
    encode(key, payload, 'HS256', (err, token) => {
      if (err) {
        reject(err)
      } else {
        resolve(token)
      }
    })
  })
}

// this is an integration test so is skipped but checked in to validate behaviour if needed
describe('decodeToken', () => {
  const payload = {
    iss: 'my_issuer',
    aud: 'World',
    iat: 1400062400223,
  }
  beforeAll(() => {
    toMockedFunction(requireConfiguration)
      .mockReset()
      .mockImplementation((key) => {
        switch (key) {
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

  it('can decode token correctly', async () => {
    const token = await createToken(signingKey, payload)
    expect(await decodeToken(token)).toMatchInlineSnapshot(`
      Object {
        "aud": "World",
        "iat": 1400062400223,
        "iss": "my_issuer",
      }
    `)
  })

  it('fails to decode token signed by other key', async () => {
    const token = await createToken('myOtherSigningKey', payload)
    await expect(decodeToken(token)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Invalid key!"`,
    )
  })
})
