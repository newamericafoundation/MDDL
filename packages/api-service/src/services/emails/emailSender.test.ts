import { requireConfiguration } from '@/config'
import { toMockedFunction } from '@/utils/test'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { sendEmail } from './emailSender'

jest.mock('@/config')

// set this to true to save the html files locally so they can be inspected
const WRITE_FILES = false

const writeFile = (name: string, content: string | undefined) => {
  if (WRITE_FILES) {
    writeFileSync(join(__dirname, '__snapshots__', name + '.html'), content)
  }
}

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
      subject: `Data Locker: You've been sent documents`,
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
    writeFile(
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
      subject: `Data Locker: You've been granted access to an account`,
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
    writeFile('delegateUserInvite', results.Request.Message.Body.Html?.Data)
  })
})
