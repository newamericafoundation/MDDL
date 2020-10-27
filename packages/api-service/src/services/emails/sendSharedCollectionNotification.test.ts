import { sendSharedCollectionNotification } from './sendSharedCollectionNotification'

describe('sendSharedCollectionNotification', () => {
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
