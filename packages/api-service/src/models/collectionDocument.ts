import BaseModel from './baseModel'

export class CollectionDocument extends BaseModel {
  public collectionId: string
  public documentId: string
  public createdBy: string
  public createdAt: Date

  static get tableName() {
    return 'collections_documents'
  }

  static get idColumn() {
    return ['collectionId', 'documentId']
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['collectionId', 'documentId', 'createdBy'],
      properties: {
        collectionId: { type: 'string', minLength: 1, maxLength: 40 },
        documentId: { type: 'string', minLength: 1, maxLength: 40 },
        createdAt: { type: 'date-time' },
        createdBy: { type: 'string', maxLength: 255 },
      },
    }
  }
}
