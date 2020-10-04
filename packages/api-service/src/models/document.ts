import BaseModel from './base-model'
import { v4 as uuidv4 } from 'uuid'
import { QueryBuilder } from 'objection'

export class Document extends BaseModel {
  public id: string
  public name?: string
  public ownerId: string
  public source?: string
  public format?: string
  public type?: string
  public filePath: string
  public fileContentType: string
  public fileChecksum: string
  public fileReceived: boolean
  public expiryDate?: Date
  public createdAt: Date
  public updatedAt: Date

  static get tableName() {
    return 'documents'
  }

  static get modifiers() {
    return {
      fieldsForList(query: QueryBuilder<Document>) {
        const fields = ['id', 'name', 'format', 'type', 'filePath', 'createdAt']
        return query.select(...fields.map((f) => Document.ref(f)))
      },
      fieldsForSingle(query: QueryBuilder<Document>) {
        const fields = [
          'id',
          'name',
          'format',
          'source',
          'type',
          'expiryDate',
          'filePath',
          'createdAt',
        ]
        return query.select(...fields.map((f) => Document.ref(f)))
      },
      byOwnerId(query: QueryBuilder<Document>, userId: string) {
        return query.where({
          ownerId: userId,
        })
      },
      byId(query: QueryBuilder<Document>, id: string, userId: string) {
        return query.where({
          id: id,
          ownerId: userId,
        })
      },
    }
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['ownerId', 'filePath', 'fileContentType', 'fileChecksum'],
      properties: {
        id: { type: 'string', minLength: 1, maxLength: 40 },
        name: { type: 'string', maxLength: 255 },
        ownerId: { type: 'string', minLength: 1, maxLength: 255 },
        source: { type: 'string', maxLength: 255 },
        format: { type: 'string', maxLength: 255 },
        type: { type: 'string', maxLength: 255 },
        filePath: { type: 'string', minLength: 1, maxLength: 255 },
        fileContentType: { type: 'string', minLength: 1, maxLength: 255 },
        fileChecksum: { type: 'string', minLength: 1, maxLength: 255 },
        expiryDate: { type: 'date-time' },
      },
    }
  }

  async $beforeInsert() {
    this.$id(uuidv4())
  }
}

export const getDocumentById = async (id: string, accessingUserId: string) => {
  const results = await Document.query()
    .modify('fieldsForSingle')
    .modify('byId', id, accessingUserId)
  return results.length ? results[0] : null
}

export const getDocumentsByOwnerId = async (
  ownerId: string,
  accessingUserId: string,
) => {
  const results = await Document.query()
    .modify('fieldsForList')
    .modify('byOwnerId', ownerId, accessingUserId)
    .orderBy('createdAt', 'DESC')
  return results
}
