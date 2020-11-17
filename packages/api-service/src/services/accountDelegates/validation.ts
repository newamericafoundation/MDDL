import { string, object } from 'joi'

export const createAccountDelegateSchema = object({
  email: string().email().min(1).max(255),
})
