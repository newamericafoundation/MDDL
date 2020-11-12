import { sendSharedCollectionNotification } from './sendSharedCollectionNotification'
import { getConfiguration } from '@/config'
import { toMockedFunction } from '@/utils/test'

jest.mock('@/config')

describe('sendSharedCollectionNotification', () => {
  beforeEach(() => {
    toMockedFunction(getConfiguration).mockImplementationOnce(
      () => 'email-sender',
    )
  })
  it('renders template correctly', async () => {
    const results = await sendSharedCollectionNotification({
      emails: ['testemail@example.com'],
      collection: {
        link: 'https://mylink1234',
        name: 'Sam Smithers',
      },
    })
    expect(results.length).toEqual(1)
    expect(results[0].Request.Destination).toMatchInlineSnapshot(`
      Object {
        "ToAddresses": Array [
          "testemail@example.com",
        ],
      }
    `)
  })
})
