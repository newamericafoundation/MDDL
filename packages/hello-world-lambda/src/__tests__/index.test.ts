import { handler } from '../index'

describe('handler', () => {
  it('returns string', () => {
    expect(handler({})).toBe('Hello world!')
  })
})
