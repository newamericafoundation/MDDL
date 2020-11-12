import { emailIsWhitelisted } from '@/utils/whitelist'
import { requireConfiguration } from '@/config'
import { toMockedFunction } from './test'

jest.mock('@/config')

describe('emailIsWhitelisted', () => {
  beforeEach(() => {
    toMockedFunction(requireConfiguration).mockImplementation(
      () => '@myspecificdomain.com,partialdomain.net',
    )
  })
  it('matches specific domain', () => {
    expect(emailIsWhitelisted('test@myspecificdomain.com')).toEqual(true)
  })
  it('matches partial domain', () => {
    expect(emailIsWhitelisted('test@myapp.partialdomain.net')).toEqual(true)
  })
  it('does not match specific domain partially', () => {
    expect(emailIsWhitelisted('test@myapp.myspecificdomain.com')).toEqual(false)
  })
  it('does not match another email', () => {
    expect(emailIsWhitelisted('myemail@gmail.com')).toEqual(false)
  })
  it('passes if there is no whitelist', () => {
    toMockedFunction(requireConfiguration).mockImplementation(() => '')
    expect(emailIsWhitelisted('myemail@gmail.com')).toEqual(true)
  })
})
