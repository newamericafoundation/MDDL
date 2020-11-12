import { hashString, toBase64String, fromBase64String } from './string'

describe('string', () => {
  describe('hashString', () => {
    it('returns expected hash', () => {
      expect(hashString('my-test-string:withdata')).toMatchInlineSnapshot(
        `"80fe66becbc199ccc66777744c26592887869d1133d19f5d8e5acf91035848ec"`,
      )
    })
  })
  describe('toBase64String', () => {
    it('returns expected string', () => {
      expect(toBase64String('my-test-string:withdata')).toMatchInlineSnapshot(
        `"bXktdGVzdC1zdHJpbmc6d2l0aGRhdGE="`,
      )
    })
  })
  describe('fromBase64String', () => {
    it('returns expected string', () => {
      expect(
        fromBase64String('bXktdGVzdC1zdHJpbmc6d2l0aGRhdGE='),
      ).toMatchInlineSnapshot(`"my-test-string:withdata"`)
    })
  })
})
