import BaseModel from './baseModel'
import { v4 as uuidv4 } from 'uuid'
import { Model } from 'objection'
import { AgencyGrant } from './agencyGrant'

export class Agency extends BaseModel {
  // columns
  public id: string
  public name: string
  public createdBy: string
  public createdAt: Date

  // navigation property
  public grants?: AgencyGrant[]

  static get tableName() {
    return 'agencies'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'createdBy'],
      properties: {
        id: { type: 'string', minLength: 1, maxLength: 40 },
        name: { type: 'string', maxLength: 255 },
        createdBy: { type: 'string', minLength: 1, maxLength: 255 },
        createdAt: { type: 'date-time' },
      },
    }
  }

  static relationMappings = {
    grants: {
      relation: Model.HasManyRelation,
      modelClass: AgencyGrant,
      join: {
        from: `${Agency.tableName}.id`,
        to: `${AgencyGrant.tableName}.agencyId`,
      },
    },
  }

  async $beforeInsert() {
    if (!this.id) this.$id(uuidv4())
  }
}
