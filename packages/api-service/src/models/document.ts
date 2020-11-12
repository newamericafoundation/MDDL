import BaseModel from './baseModel'
import { v4 as uuidv4 } from 'uuid'
import { Model, QueryBuilder } from 'objection'
import { File } from './file'
import { CollectionDocument } from './collectionDocument'
import { CollectionGrant } from './collectionGrant'

export class Document extends BaseModel {
  // columns
  public id: string
  public name: string
  public description?: string
  public ownerId: string
  public source?: string
  public format?: string
  public type?: string
  public expiryDate?: Date
  public createdBy: string
  public createdAt: Date
  public updatedAt: Date
  public updatedBy: string
  public thumbnailPath?: string

  // navigation property
  public files?: File[]

  static get tableName() {
    return 'documents'
  }

  static get modifiers() {
    return {
      fieldsForList(query: QueryBuilder<Document>) {
        const fields = ['id', 'name', 'createdAt', 'thumbnailPath', 'updatedAt']
        return query.select(...fields.map((f) => Document.ref(f)))
      },
      fieldsForSingle(query: QueryBuilder<Document>) {
        const fields = ['id', 'name', 'description', 'createdAt', 'ownerId']
        return query
          .select(...fields.map((f) => Document.ref(f)))
          .withGraphFetched('files')
      },
      byOwnerId(query: QueryBuilder<Document>, userId: string) {
        return query.where({
          ownerId: userId,
        })
      },
      byId(query: QueryBuilder<Document>, id: string) {
        return query.where({
          id: id,
        }).first
      },
    }
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'ownerId', 'createdBy', 'updatedBy'],
      properties: {
        id: { type: 'string', minLength: 1, maxLength: 40 },
        name: { type: 'string', maxLength: 255 },
        description: { type: 'string', maxLength: 500 },
        ownerId: { type: 'string', minLength: 1, maxLength: 255 },
        source: { type: 'string', maxLength: 255 },
        format: { type: 'string', maxLength: 255 },
        type: { type: 'string', maxLength: 255 },
        expiryDate: { type: 'date-time' },
        updatedBy: { type: 'string', minLength: 1, maxLength: 255 },
        createdBy: { type: 'string', minLength: 1, maxLength: 255 },
        thumbnailPath: { type: 'string', maxLength: 500 },
      },
    }
  }

  static relationMappings() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Collection = require('./collection').Collection
    return {
      files: {
        relation: Model.HasManyRelation,
        modelClass: File,
        join: {
          from: `${Document.tableName}.id`,
          to: `${File.tableName}.documentId`,
        },
      },
      collections: {
        relation: Model.ManyToManyRelation,
        modelClass: Collection,
        join: {
          from: `${Document.tableName}.id`,
          through: {
            from: `${CollectionDocument.tableName}.documentId`,
            to: `${CollectionDocument.tableName}.collectionId`,
          },
          to: `${Collection.tableName}.id`,
        },
      },
    }
  }

  async $beforeInsert() {
    if (!this.id) this.$id(uuidv4())
  }
}

export const getDocumentById = async (id: string): Promise<Document | null> => {
  return (await Document.query().modify('byId', id).first()) || null
}

export const getSingleDocumentById = async (
  id: string,
): Promise<Document | null> => {
  return (
    (await Document.query()
      .modify('fieldsForSingle')
      .modify('byId', id)
      .first()) || null
  )
}

export const allDocumentsExistById = async (ids: string[], ownerId: string) => {
  const results = await Document.query()
    .count({ count: 'id' })
    .whereIn('id', ids)
    .andWhere('ownerId', ownerId)
  return ((results[0] as unknown) as { count: number }).count == ids.length
}

export const getDocumentsByOwnerId = async (ownerId: string) => {
  const results = await Document.query()
    .modify('fieldsForList')
    .modify('byOwnerId', ownerId)
    .orderBy('createdAt', 'DESC')
  return results
}

export const countDocumentsByOwnerId = async (ownerId: string) => {
  const results = await Document.query()
    .count({ count: 'id' })
    .modify('byOwnerId', ownerId)
  return ((results[0] as unknown) as { count: number }).count
}

export const documentIsInCollectionWithGrant = async (
  documentId: string,
  requirementType: string,
  requirementValue: string,
): Promise<boolean> => {
  return !!(await CollectionGrant.query()
    .where({ requirementType, requirementValue })
    .whereIn(
      'collectionId',
      CollectionDocument.query().select('collectionId').where({ documentId }),
    )
    .first())
}

export const setDocumentThumbnailPath = async (id: string, path: string) => {
  return await Document.query().patch({ thumbnailPath: path }).where({ id })
}

export interface CreateDocumentInput {
  id: string
  name: string
  description?: string
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

export interface UpdateDocumentInput {
  name?: string
  description?: string
  updatedAt: Date
  updatedBy: string
}

export const updateDocument = async (
  id: string,
  documentDetails: UpdateDocumentInput,
) => {
  return await Document.query().patch(documentDetails).where({ id })
}

export const deleteDocument = async (id: string) => {
  await File.query().delete().where({ documentId: id })
  await CollectionDocument.query().delete().where({ documentId: id })
  return await Document.query().delete().where({ id })
}
