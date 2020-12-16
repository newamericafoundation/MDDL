import { requireConfiguration } from '@/config'
import { toMockedFunction } from '@/utils/test'
import { sendEmail } from './emailSender'
import { writeSnapshotFile } from './renderer'

jest.mock('@/config')

describe('sendEmail', () => {
  beforeEach(() => {
    toMockedFunction(requireConfiguration).mockImplementationOnce(
      () => 'email-sender',
    )
    // set this to an actual domain to see images load
    toMockedFunction(requireConfiguration).mockImplementationOnce(
      () => 'mydatalocker.org',
    )
  })
  it('renders collectionSharedNotification template correctly', async () => {
    const results = await sendEmail({
      template: 'collectionSharedNotification',
      destination: {
        ToAddresses: ['testemail@example.com'],
      },
      subject: `You've been sent documents`,
      data: {
        link: 'https://mylink1234',
        name: 'Sam Smithers',
      },
    })
    expect(results.Request.Destination).toMatchInlineSnapshot(`
      Object {
        "ToAddresses": Array [
          "testemail@example.com",
        ],
      }
    `)
    expect(results.Request.Message.Body.Html?.Data).toMatchSnapshot()
    writeSnapshotFile(
      'collectionSharedNotification',
      results.Request.Message.Body.Html?.Data,
    )
  })
  it('renders delegateUserInvite template correctly', async () => {
    const results = await sendEmail({
      template: 'delegateUserInvite',
      destination: {
        ToAddresses: ['testemail@example.com'],
      },
      subject: `You've been granted access to an account`,
      data: {
        link: 'https://mylink1234',
        name: 'Sam Smithers',
      },
    })
    expect(results.Request.Destination).toMatchInlineSnapshot(`
      Object {
        "ToAddresses": Array [
          "testemail@example.com",
        ],
      }
    `)
    expect(results.Request.Message.Body.Html?.Data).toMatchSnapshot()
    writeSnapshotFile(
      'delegateUserInvite',
      results.Request.Message.Body.Html?.Data,
    )
  })
})
