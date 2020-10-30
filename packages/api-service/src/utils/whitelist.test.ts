import { emailIsWhitelisted } from '@/utils/whitelist'

describe('emailIsWhitelisted', () => {
  beforeAll(() => {
    process.env = {
      ...process.env,
      AGENCY_EMAIL_DOMAINS_WHITELIST: '@myspecificdomain.com,partialdomain.net',
    }
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
    process.env = {
      ...process.env,
      AGENCY_EMAIL_DOMAINS_WHITELIST: undefined,
    }
    expect(emailIsWhitelisted('myemail@gmail.com')).toEqual(true)
  })
})
