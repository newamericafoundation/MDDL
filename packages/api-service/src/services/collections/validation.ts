import {
  MaxIndividualEmailAddressesPerCollection,
  MaxDocumentsPerUser,
} from '@/constants'
import { emailIsWhitelisted } from '@/utils/whitelist'
import { DocumentsDownloadFormatEnum } from 'api-client'
import { string, array, object } from 'joi'

const validateEmailIsWhitelisted = (value: string) => {
  if (!emailIsWhitelisted(value)) {
    throw new Error(`${value} is not a whitelisted email address`)
  }
  return value
}

export const createCollectionSchema = object({
  name: string().min(1).max(255).required(),
  documentIds: array()
    .items(string().min(1).max(40))
    .min(1)
    .max(MaxDocumentsPerUser)
    .unique()
    .required(),
  individualEmailAddresses: array()
    .items(string().email().min(1).max(255).custom(validateEmailIsWhitelisted))
    .max(MaxIndividualEmailAddressesPerCollection)
    .unique()
    .required(),
})

export const downloadCollectionDocumentsSchema = object({
  format: string()
    .allow(...Object.values(DocumentsDownloadFormatEnum))
    .only()
    .required(),
})
