import { string, array, object } from 'joi'
export type SendRequest = {
  toAddresses: string[]
  template: string
  subject: string
  data: Record<string, any>
}
export const sendRequestSchema = object({
  toAddresses: array()
    .items(string().email().min(1).max(255))
    .max(20)
    .unique()
    .required(),
  subject: string().max(255).required(),
  template: string().max(255).required(),
  data: object().unknown(),
})
