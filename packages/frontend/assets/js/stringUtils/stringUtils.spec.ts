import { capitalize } from '.'

describe('capitalize', () => {
  const cases: { input: string; expected: string }[] = [
    {
      input: 'hello',
      expected: 'Hello',
    },
    {
      input: 'hello multi word',
      expected: 'Hello multi word',
    },
    {
      input: 'multiple sentences not supported. see?',
      expected: 'Multiple sentences not supported. see?',
    },
    {
      input: '',
      expected: '',
    },
  ]

  it('capitalize', () => {
    for (let i = 0; i < cases.length; ++i) {
      expect(capitalize(cases[i].input)).toBe(cases[i].expected)
    }
  })
})
