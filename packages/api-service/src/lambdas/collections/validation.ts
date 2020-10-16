import {
  MaxAgencyOfficersEmailAddressesPerCollection,
  MaxDocumentsPerUser,
} from '@/constants'
import Joi from 'joi'

export const createCollectionSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  documentIds: Joi.array()
    .items(Joi.string().min(1).max(40))
    .min(1)
    .max(MaxDocumentsPerUser)
    .unique()
    .required(),
  agencyOfficersEmailAddresses: Joi.array()
    .items(Joi.string().email().min(1).max(255))
    .max(MaxAgencyOfficersEmailAddressesPerCollection)
    .unique()
    .required(),
})
