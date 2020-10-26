import BaseModel from './baseModel'
import { v4 as uuidv4 } from 'uuid'

export class CollectionGrant extends BaseModel {
  public id: string
  public collectionId: string
  public requirementType: string
  public requirementValue: string
  public createdBy: string
  public createdAt: Date

  static get tableName() {
    return 'collections_grants'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'collectionId',
        'requirementType',
        'requirementValue',
        'createdBy',
      ],
      properties: {
        id: { type: 'string', minLength: 1, maxLength: 40 },
        collectionId: { type: 'string', minLength: 1, maxLength: 40 },
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

export const collectionGrantExists = async (
  collectionId: string,
  requirementType: string,
  requirementValue: string,
) => {
  return !!(await CollectionGrant.query()
    .where({ collectionId, requirementType, requirementValue })
    .select(`id`)
    .first())
}
