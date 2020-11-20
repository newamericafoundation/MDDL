import { Owner, UserDelegatedAccess } from 'api-client'

export type Delegate = Omit<UserDelegatedAccess, 'allowsAccessToUser'>

export interface DelegatedClient extends UserDelegatedAccess {
  allowsAccessToUser: Owner
}
