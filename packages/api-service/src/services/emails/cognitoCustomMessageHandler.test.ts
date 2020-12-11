import { requireConfiguration } from '@/config'
import { getParameterValue } from '@/utils/parameters'
import { toMockedFunction } from '@/utils/test'
import {
  CognitoCustomMessageEvent,
  handler,
  TriggerSource,
} from './cognitoCustomMessageHandler'
import { writeSnapshotFile } from './renderer'

jest.mock('@/config')
jest.mock('@/utils/parameters')

const createEventData = (
  triggerSource: TriggerSource,
): CognitoCustomMessageEvent => ({
  version: 1,
  region: 'us-east-1',
  userPoolId: 'us-east-1_userpool',
  userName: '829084D7-F359-49CF-8D36-F6A7310B542E',
  triggerSource,
  callerContext: {
    awsSdk: 'v1',
    clientId: '829084D7',
  },
  request: {
    userAttributes: {
      sub: '829084D7-F359-49CF-8D36-F6A7310B542E',
      given_name: 'Sam',
      family_name: 'Taylor',
      email: 'staylor@example.com',
    },
    clientMetadata: {},
    codeParameter: 'CODE',
    linkParameter: 'LINK',
  },
  response: {},
})

describe('cognitoCustomMessageHandler', () => {
  beforeEach(() => {
    // set this to an actual domain to see images load
    toMockedFunction(getParameterValue).mockImplementationOnce(
      async () => 'https://mydatalocker.org',
    )
  })
  it('renders welcome template', async () => {
    const result = await handler(
      createEventData(TriggerSource.CustomMessage_SignUp),
    )
    expect(result).toMatchSnapshot()
    writeSnapshotFile('welcome', result?.response.emailMessage)
  })
  it('renders resend code template', async () => {
    const result = await handler(
      createEventData(TriggerSource.CustomMessage_ResendCode),
    )
    expect(result).toMatchSnapshot()
    writeSnapshotFile('resendCode', result?.response.emailMessage)
  })
  it('renders password reset template', async () => {
    const result = await handler(
      createEventData(TriggerSource.CustomMessage_ForgotPassword),
    )
    expect(result).toMatchSnapshot()
    writeSnapshotFile('passwordReset', result?.response.emailMessage)
  })
})
