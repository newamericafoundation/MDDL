import { EnvironmentVariable, requireConfiguration } from '@/config'
import { IntegrationType } from './oauthIntegration'
import { getNycIdSignature, signRequest } from './requestSigner'
import { toMockedFunction } from './test'

jest.mock('@/config')
jest.mock('date-fns-tz', () => {
  const actual = jest.requireActual('date-fns-tz')
  return {
    ...actual,
    format: () => {
      return '11/02/2020 16:17'
    },
  }
})

const mockConfiguration = (
  integrationType: IntegrationType = IntegrationType.OAUTH,
) => (key: string) => {
  if (key === EnvironmentVariable.AUTH_INTEGRATION_TYPE) {
    return integrationType
  }
  if (key === EnvironmentVariable.AUTH_SIGNING_KEY) {
    // don't freak out, this is the test key given on
    // https://www1.nyc.gov/assets/nyc4d/html/services-nycid/web-services.shtml#sample
    return "#ktccn/[i(a=j)Pdo&4{S):9=]>6Ewm.s/}}.XX-=<kK'$F][M16TR?AJ3z*g|i^"
  }
  return key
}

describe('requestSigner.getNycIdSignature', () => {
  it('returns expected example 1', () => {
    toMockedFunction(requireConfiguration).mockImplementationOnce(
      mockConfiguration(),
    )
    expect(
      getNycIdSignature({
        method: 'GET',
        path: '/account/api/isEmailValidated.htm',
        queryArgs: {
          guid: 'ABCD1234',
          userName: 'xxx',
        },
        authorizationHeader: undefined,
      }),
    ).toMatchInlineSnapshot(
      `"9b249ba5013256b8f46dc9a1b678699d862a1efc2a1a8bcc3c97ad4c3edac3a2"`,
    )
  })

  it('returns expected example 1 regardless of parameter order', () => {
    toMockedFunction(requireConfiguration).mockImplementationOnce(
      mockConfiguration(),
    )
    expect(
      getNycIdSignature({
        method: 'GET',
        path: '/account/api/isEmailValidated.htm',
        queryArgs: {
          userName: 'xxx',
          guid: 'ABCD1234',
        },
        authorizationHeader: undefined,
      }),
    ).toMatchInlineSnapshot(
      `"9b249ba5013256b8f46dc9a1b678699d862a1efc2a1a8bcc3c97ad4c3edac3a2"`,
    )
  })

  it('returns expected example 2', () => {
    toMockedFunction(requireConfiguration).mockImplementationOnce(
      mockConfiguration(),
    )
    expect(
      getNycIdSignature({
        method: 'GET',
        path: '/account/api/getUsers.htm',
        queryArgs: {
          guids: 'ABCD1234',
          userName: 'xxx',
        },
        authorizationHeader: undefined,
      }),
    ).toMatchInlineSnapshot(
      `"d11be34aee0ad4eb900a7ef5f566531125f42ec53f1bec5131bc484811790df1"`,
    )
  })
})

describe('requestSigner.signRequest', () => {
  beforeEach(() => {
    toMockedFunction(requireConfiguration).mockReset()
  })
  afterEach(() => {
    toMockedFunction(requireConfiguration).mockRestore()
  })
  it('returns same url for none signature method', () => {
    toMockedFunction(requireConfiguration).mockImplementation(
      mockConfiguration(IntegrationType.OAUTH),
    )
    expect(
      signRequest('GET', 'https://my-test-domain.org/userinfo', {}),
    ).toMatchInlineSnapshot(`"https://my-test-domain.org/userinfo"`)
  })
  it('returns signed url for NYC signature method example one', () => {
    toMockedFunction(requireConfiguration)
      .mockReset()
      .mockImplementation(mockConfiguration(IntegrationType.NYCID_OAUTH))
    expect(
      signRequest('GET', 'https://my-test-domain.org/userinfo', {}),
    ).toMatchInlineSnapshot(
      `"https://my-test-domain.org/userinfo?dateTime=11%2F02%2F2020%2016%3A17&signature=d00aef825bfa7c8cd2311bb3e6bda47466bbaf7902834d84a1d7f881a5a16b0c"`,
    )
  })
  it('returns signed url for NYC signature method example two', () => {
    toMockedFunction(requireConfiguration).mockImplementation(
      mockConfiguration(IntegrationType.NYCID_OAUTH),
    )
    expect(
      signRequest(
        'GET',
        'https://www1.nyc.gov/account/api/isEmailValidated.htm?guid=ABCD1234&userName=xxx',
        {},
      ),
    ).toMatchInlineSnapshot(
      `"https://www1.nyc.gov/account/api/isEmailValidated.htm?guid=ABCD1234&userName=xxx&dateTime=11%2F02%2F2020%2016%3A17&signature=0fb2108ea90c4cc541e8845847c01a05821a96a48eadce722bfb852fdd4e2e02"`,
    )
  })
  it('returns signed url for NYC signature method example three', () => {
    toMockedFunction(requireConfiguration).mockImplementation(
      mockConfiguration(IntegrationType.NYCID_OAUTH),
    )
    expect(
      signRequest(
        'GET',
        'https://www1.nyc.gov/account/api/getUsers.htm?guids=ABCD1234&userName=xxx',
        {},
      ),
    ).toMatchInlineSnapshot(
      `"https://www1.nyc.gov/account/api/getUsers.htm?guids=ABCD1234&userName=xxx&dateTime=11%2F02%2F2020%2016%3A17&signature=6ecd5881733edad95a84de4eef9c894e9d523f15b9ff8e59b8064e61ab54db3a"`,
    )
  })
})
