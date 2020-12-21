import { formatApiGatewayResult, compose, requireValidBody } from './middleware'
import createError from 'http-errors'
import { string, object } from 'joi'
import { createMockEvent } from './test'

jest.mock('@/utils/logging')

class MockAwsError extends Error {
  statusCode: number
  isRetryable: boolean
  extendedRequestId: string
}

describe('formatApiGatewayResult', () => {
  it('formats HTTP error when given', async () => {
    expect(
      await formatApiGatewayResult<any>(() => {
        throw new createError.BadRequest('bad request')
      })({}),
    ).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"bad request\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 400,
      }
    `)
  })
  it('formats AWS error when given', async () => {
    expect(
      await formatApiGatewayResult<any>(() => {
        const error = new MockAwsError('An error occurred')
        error.statusCode = 400
        error.isRetryable = false
        error.extendedRequestId = '2134234'
        throw error
      })({}),
    ).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"An internal error occurred\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 500,
      }
    `)
  })
  it('formats other error when given', async () => {
    expect(
      await formatApiGatewayResult<any>(() => {
        throw new Error('bad request')
      })({}),
    ).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"message\\":\\"An internal error occurred\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 500,
      }
    `)
  })
  it('formats response when all is ok', async () => {
    expect(
      await formatApiGatewayResult<any>(() => {
        return {
          field1: 'value1',
        }
      })({}),
    ).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"field1\\":\\"value1\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('accepts a composed async function', async () => {
    expect(
      await formatApiGatewayResult<any>(
        compose(
          async () => await Promise.resolve('Value 1'),
          (text) => ({
            field1: text,
          }),
        ),
      )({}),
    ).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"field1\\":\\"Value 1\\"}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
})

export const testSchema = object({
  name: string().min(1).max(255).required(),
})

describe('requireValidBody', () => {
  it('throws error on invalid body', () => {
    const event = createMockEvent()
    const func = requireValidBody(testSchema)
    event.body = `<body>
    <data>Test</data>
    </body>`
    expect(() => func({ event })).toThrowErrorMatchingInlineSnapshot(
      `"validation error: the body could not be read"`,
    )
  })
  it('throws error on no body', () => {
    const event = createMockEvent()
    const func = requireValidBody(testSchema)
    expect(() => func({ event })).toThrowErrorMatchingInlineSnapshot(
      `"validation error: body was expected but empty"`,
    )
  })
  it('works with a valid body', () => {
    const event = createMockEvent()
    const func = requireValidBody(testSchema)
    event.body = JSON.stringify({
      name: 'test',
    })
    expect(func({ event }).body).toMatchInlineSnapshot(`
      Object {
        "name": "test",
      }
    `)
  })
})
