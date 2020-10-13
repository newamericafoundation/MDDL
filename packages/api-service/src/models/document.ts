import BaseModel from './base-model'
import { v4 as uuidv4 } from 'uuid'
import { Model, QueryBuilder } from 'objection'
import { File } from './file'

export class Document extends BaseModel {
  // columns
  public id: string
  public name: string
  public ownerId: string
  public source?: string
  public format?: string
  public type?: string
  public expiryDate?: Date
  public createdBy: string
  public createdAt: Date
  public updatedAt: Date
  public updatedBy: string

  // navigation property
  public files?: File[]

  static get tableName() {
    return 'documents'
  }

  static get modifiers() {
    return {
      fieldsForList(query: QueryBuilder<Document>) {
        const fields = ['id', 'name', 'createdAt']
        return query.select(...fields.map((f) => Document.ref(f)))
      },
      fieldsForSingle(query: QueryBuilder<Document>) {
        const fields = ['id', 'name', 'createdAt']
        return query
          .select(...fields.map((f) => Document.ref(f)))
          .withGraphFetched('files')
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
        }).first
      },
    }
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['ownerId'],
      properties: {
        id: { type: 'string', minLength: 1, maxLength: 40 },
        name: { type: 'string', maxLength: 255 },
        ownerId: { type: 'string', minLength: 1, maxLength: 255 },
        source: { type: 'string', maxLength: 255 },
        format: { type: 'string', maxLength: 255 },
        type: { type: 'string', maxLength: 255 },
        expiryDate: { type: 'date-time' },
        updatedBy: { type: 'string', minLength: 1, maxLength: 255 },
        createdBy: { type: 'string', minLength: 1, maxLength: 255 },
      },
    }
  }

  static relationMappings = {
    files: {
      relation: Model.HasManyRelation,
      modelClass: File,
      join: {
        from: 'documents.id',
        to: 'files.documentId',
      },
    },
  }

  async $beforeInsert() {
    if (!this.id) this.$id(uuidv4())
  }
}

export const getDocumentById = async (id: string, accessingUserId: string) => {
  const results = await Document.query()
    .modify('fieldsForSingle')
    .modify('byId', id, accessingUserId)
  return results.length ? results[0] : null
}

export const documentExistsById = async (
  id: string,
  accessingUserId: string,
) => {
  const results = await Document.query().modify('byId', id, accessingUserId)
  return !!results.length
}

export const getDocumentsByOwnerId = async (ownerId: string) => {
  const results = await Document.query()
    .modify('fieldsForList')
    .modify('byOwnerId', ownerId)
    .orderBy('createdAt', 'DESC')
  return results
}

export const countDocumentsByOwnerId = async (ownerId: string) => {
  const results = await Document.query().modify('byOwnerId', ownerId).count()
  return results
}

export interface CreateDocumentInput {
  id: string
  name: string
  ownerId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  updatedBy: string
  files: CreateDocumentFileInput[]
}
export interface CreateDocumentFileInput {
  id: string
  name: string
  path: string
  contentType: string
  contentLength: number
  sha256Checksum: string
  createdAt: Date
  createdBy: string
  received: boolean
}

export const createDocument = async (document: CreateDocumentInput) => {
  return await Document.query().insertGraphAndFetch({
    ...document,
  })
}
