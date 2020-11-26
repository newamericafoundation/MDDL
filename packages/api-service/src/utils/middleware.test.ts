import { formatApiGatewayResult, compose } from './middleware'
import createError from 'http-errors'

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
