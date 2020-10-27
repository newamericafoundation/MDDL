import BaseModel from './baseModel'
import { v4 as uuidv4 } from 'uuid'
import { Model, QueryBuilder } from 'objection'
import { CollectionGrant } from './collectionGrant'
import { CollectionDocument } from './collectionDocument'
import { Document } from './document'

export class Collection extends BaseModel {
  // columns
  public id: string
  public name: string
  public ownerId: string
  public createdBy: string
  public createdAt: Date
  public updatedBy: string
  public updatedAt: Date

  // navigation property
  public grants?: CollectionGrant[]
  public documents?: Document[]

  static get tableName() {
    return 'collections'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'ownerId', 'createdBy', 'updatedBy'],
      properties: {
        id: { type: 'string', minLength: 1, maxLength: 40 },
        name: { type: 'string', maxLength: 255 },
        ownerId: { type: 'string', minLength: 1, maxLength: 255 },
        createdBy: { type: 'string', minLength: 1, maxLength: 255 },
        createdAt: { type: 'date-time' },
        updatedBy: { type: 'string', minLength: 1, maxLength: 255 },
        updatedAt: { type: 'date-time' },
      },
    }
  }

  static get modifiers() {
    return {
      fieldsForList(query: QueryBuilder<Collection>) {
        const fields = ['id', 'name', 'createdAt', 'ownerId']
        return query.select(...fields.map((f) => Collection.ref(f)))
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

  static relationMappings() {
    return {
      grants: {
        relation: Model.HasManyRelation,
        modelClass: CollectionGrant,
        join: {
          from: `${Collection.tableName}.id`,
          to: `${CollectionGrant.tableName}.collectionId`,
        },
      },
      collectionDocuments: {
        relation: Model.HasManyRelation,
        modelClass: CollectionDocument,
        join: {
          from: `${Collection.tableName}.id`,
          to: `${CollectionDocument.tableName}.collectionId`,
        },
      },
      documents: {
        relation: Model.ManyToManyRelation,
        modelClass: Document,
        join: {
          from: `${Collection.tableName}.id`,
          through: {
            from: `${CollectionDocument.tableName}.collectionId`,
            to: `${CollectionDocument.tableName}.documentId`,
          },
          to: `${Document.tableName}.id`,
        },
      },
    }
  }

  async $beforeInsert() {
    if (!this.id) this.$id(uuidv4())
  }
}

export interface CreateCollectionInput {
  id: string
  name: string
  ownerId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  updatedBy: string
  collectionDocuments: CreateCollectionDocumentInput[]
  grants: CreateCollectionGrantInput[]
}

export interface CreateCollectionDocumentInput {
  documentId: string
  createdBy: string
  createdAt: Date
}

export interface CreateCollectionGrantInput {
  requirementType: string
  requirementValue: string
  createdBy: string
  createdAt: Date
}

export const createCollection = async (collection: CreateCollectionInput) => {
  return await Collection.query().insertGraph({
    ...collection,
  })
}

export const getCollectionsByOwnerId = async (ownerId: string) => {
  return await Collection.query()
    .modify('fieldsForList')
    .modify('byOwnerId', ownerId)
    .orderBy('createdAt', 'DESC')
}

export const getCollectionsByGrantType = async (
  collectionGrantType: string,
  collectionGrantValue: string,
) => {
  return await Collection.query()
    .modify('fieldsForList')
    .whereIn(
      'id',
      CollectionGrant.query().select('collectionId').where({
        requirementType: collectionGrantType,
        requirementValue: collectionGrantValue,
      }),
    )
    .orderBy('createdAt', 'DESC')
}

export const getDocumentsByCollectionId = async (collectionId: string) => {
  return await Collection.relatedQuery('documents')
    .for(collectionId)
    .modify('fieldsForList')
}

export const getGrantsByCollectionId = async (collectionId: string) => {
  return await Collection.relatedQuery('grants').for(collectionId)
}

export const getCollectionById = async (
  id: string,
): Promise<Collection | null> => {
  return (await Collection.query().modify('byId', id).first()) || null
}

export const collectionExists = async (
  collectionId: string,
  ownerId: string,
) => {
  const results = await Collection.query()
    .count({ count: 'id' })
    .where({ id: collectionId, ownerId })
  return ((results[0] as unknown) as { count: number }).count == 1
}
