import {
  MaxIndividualEmailAddressesPerCollection,
  MaxDocumentsPerUser,
} from '@/constants'
import { string, array, object } from 'joi'

export const createCollectionSchema = object({
  name: string().min(1).max(255).required(),
  documentIds: array()
    .items(string().min(1).max(40))
    .min(1)
    .max(MaxDocumentsPerUser)
    .unique()
    .required(),
  individualEmailAddresses: array()
    .items(string().email().min(1).max(255))
    .max(MaxIndividualEmailAddressesPerCollection)
    .unique()
    .required(),
})
