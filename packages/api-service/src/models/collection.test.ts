import {
  createCollection,
  Collection as CollectionModel,
  getCollectionsByOwnerId,
  getDocumentsByCollectionId,
  getCollectionsByGrantType,
} from './collection'
import { v4 as uuidv4 } from 'uuid'
import { connectDatabase } from '@/utils/database'
import { Document as DocumentModel } from './document'
import { CollectionGrantType } from 'api-client'
import { CollectionGrant } from './collectionGrant'

describe('CollectionModel', () => {
  beforeAll(async () => {
    await connectDatabase().migrate.latest()
  })
  describe('getCollectionsByOwnerId', () => {
    it('returns empty when no collections found', async () => {
      const id = uuidv4()
      expect(await getCollectionsByOwnerId(id)).toStrictEqual([])
    })
    it('returns a collection when there is one found', async () => {
      const userId = uuidv4()
      await CollectionModel.query().insert({
        name: userId,
        ownerId: userId,
        createdBy: userId,
        createdAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      const results = await getCollectionsByOwnerId(userId)
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual(
        expect.objectContaining({
          name: userId,
        }),
      )
    })
  })
  describe('getCollectionsByGrantType', () => {
    it('returns empty when there is no collection', async () => {
      const id = uuidv4()
      expect(await getCollectionsByGrantType('test', 'test')).toStrictEqual([])
    })
    it('returns collections when they are found', async () => {
      const userId = uuidv4()
      const collectionId1 = uuidv4()
      const collectionId2 = uuidv4()
      await createCollection({
        id: collectionId1,
        name: 'Collection 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId,
        createdBy: userId,
        updatedBy: userId,
        collectionDocuments: [],
        grants: [
          {
            requirementType: CollectionGrantType.INDIVIDUALEMAIL,
            requirementValue: userId,
            createdAt: new Date(),
            createdBy: userId,
          },
        ],
      })
      await createCollection({
        id: collectionId2,
        name: 'Collection 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId,
        createdBy: userId,
        updatedBy: userId,
        collectionDocuments: [],
        grants: [
          {
            requirementType: CollectionGrantType.INDIVIDUALEMAIL,
            requirementValue: userId,
            createdAt: new Date(),
            createdBy: userId,
          },
        ],
      })
      const results = await getCollectionsByGrantType(
        CollectionGrantType.INDIVIDUALEMAIL,
        userId,
      )
      expect(results).toHaveLength(2)
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: collectionId1 }),
          expect.objectContaining({ id: collectionId2 }),
        ]),
      )
    })
  })

  describe('getDocumentsByCollectionId', () => {
    it('returns empty when there is no collection', async () => {
      const id = uuidv4()
      expect(await getDocumentsByCollectionId(id)).toStrictEqual([])
    })
    it('returns documents when they are found', async () => {
      const userId = uuidv4()
      const collectionId = uuidv4()
      const document1 = await DocumentModel.query().insertAndFetch({
        name: 'My Test Document 1',
        ownerId: userId,
        createdBy: userId,
        createdAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      const document2 = await DocumentModel.query().insertAndFetch({
        name: 'My Test Document 2',
        ownerId: userId,
        createdBy: userId,
        createdAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      await createCollection({
        id: collectionId,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId,
        createdBy: userId,
        updatedBy: userId,
        collectionDocuments: [
          {
            documentId: document1.id,
            createdAt: new Date(),
            createdBy: userId,
          },
          {
            documentId: document2.id,
            createdAt: new Date(),
            createdBy: userId,
          },
        ],
        grants: [],
      })
      const results = await getDocumentsByCollectionId(collectionId)
      expect(results).toHaveLength(2)
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: document1.id }),
          expect.objectContaining({ id: document2.id }),
        ]),
      )
    })
  })

  describe('createCollection', () => {
    it('inserts values', async () => {
      const userId = uuidv4()
      const document = await DocumentModel.query().insertAndFetch({
        name: 'My Test Document',
        ownerId: userId,
        createdBy: userId,
        createdAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      const collectionId = uuidv4()
      const name = 'my test document'
      const path = `uploads/my-id/${userId}.png`
      expect(
        await createCollection({
          id: collectionId,
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: userId,
          createdBy: userId,
          updatedBy: userId,
          collectionDocuments: [
            {
              documentId: document.id,
              createdAt: new Date(),
              createdBy: userId,
            },
          ],
          grants: [
            {
              requirementType: CollectionGrantType.INDIVIDUALEMAIL,
              requirementValue: 'mytestemail@example.com',
              createdAt: new Date(),
              createdBy: userId,
            },
          ],
        }),
      ).toEqual(
        expect.objectContaining({
          name,
          ownerId: userId,
          createdBy: userId,
          collectionDocuments: expect.arrayContaining([
            expect.objectContaining({
              createdBy: userId,
              collectionId,
              documentId: document.id,
            }),
          ]),
          grants: expect.arrayContaining([
            expect.objectContaining({
              createdBy: userId,
              collectionId,
              requirementType: CollectionGrantType.INDIVIDUALEMAIL,
              requirementValue: 'mytestemail@example.com',
            }),
          ]),
        }),
      )
    })
  })
})
