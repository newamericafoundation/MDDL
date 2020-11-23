import { string, array, object, date } from 'joi'
import {
  ActivityActionTypeEnum,
  ActivityResourceTypeEnum,
  Activity,
} from 'api-client'

export type ActivityInput = Activity & {
  requestContext: { [index: string]: string | number }
}

const activityPrincipalSchema = object({
  name: string().max(255).required(),
  id: string().max(255).required(),
})

const activityChangesSchema = object({
  field: string().max(255).required(),
  oldValue: string().max(1000).allow(null, ''),
  newValue: string().max(1000).allow(null, ''),
})

const activityResourceSchema = object({
  name: string().max(255).required(),
  id: string().max(255).required(),
  type: string()
    .allow(...Object.values(ActivityResourceTypeEnum))
    .only()
    .required(),
  changes: array().items(activityChangesSchema).max(100).optional(),
})

export const submitActivitySchema = object({
  principal: activityPrincipalSchema.required(),
  type: string()
    .allow(...Object.values(ActivityActionTypeEnum))
    .only()
    .required(),
  requestId: string().max(255).required(),
  date: date().iso().required(),
  resource: activityResourceSchema.required(),
  relatedResources: array().items(activityResourceSchema).max(100).optional(),
  requestContext: object().unknown().optional(),
})
