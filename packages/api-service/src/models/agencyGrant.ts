import BaseModel from './baseModel'
import { v4 as uuidv4 } from 'uuid'

export class AgencyGrant extends BaseModel {
  public id: string
  public agencyId: string
  public requirementType: string
  public requirementValue: string
  public createdBy: string
  public createdAt: Date

  static get tableName() {
    return 'agencies_grants'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'agencyId',
        'requirementType',
        'requirementValue',
        'createdBy',
      ],
      properties: {
        id: { type: 'string', minLength: 1, maxLength: 40 },
        agencyId: { type: 'string', minLength: 1, maxLength: 40 },
        requirementType: { type: 'string', maxLength: 255 },
        requirementValue: { type: 'string', maxLength: 255 },
        createdAt: { type: 'date-time' },
        createdBy: { type: 'string', maxLength: 255 },
      },
    }
  }

  async $beforeInsert() {
    if (!this.id) this.$id(uuidv4())
  }
}

export enum AgencyGrantTypes {
  DOMAIN = 'DOMAIN',
}

export const allAgencyGrantsExists = async (
  grants: {
    requirementType: string
    requirementValue: string
  }[],
) => {
  let query = AgencyGrant.query().count({ count: 'id' })
  grants.forEach((element, i) => {
    const { requirementType, requirementValue } = element
    if (i == 0) {
      query = query.where({ requirementType, requirementValue })
    } else {
      query = query.orWhere({ requirementType, requirementValue })
    }
  })
  const results = await query
  return ((results[0] as unknown) as { count: number }).count == grants.length
}
