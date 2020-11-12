import { EnvironmentVariable, requireConfiguration } from '@/config'

export const emailIsWhitelisted = (email: string) => {
  // read in whitelist
  const agencyEmailDomainsWhitelist = requireConfiguration(
    EnvironmentVariable.AGENCY_EMAIL_DOMAINS_WHITELIST,
  ).split(',')

  // check if its set
  if (!agencyEmailDomainsWhitelist.length) {
    return true
  }

  // determine if email is whitelisted or not
  return !!agencyEmailDomainsWhitelist.filter((w) => email.endsWith(w)).length
}
