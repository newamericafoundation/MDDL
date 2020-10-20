import {
  createCollection,
  Collection as CollectionModel,
  getCollectionsByOwnerId,
  getDocumentsByCollectionId,
} from './collection'
import { v4 as uuidv4 } from 'uuid'
import { connectDatabase } from '@/utils/database'
import { Document as DocumentModel } from './document'
import { CollectionGrantType } from 'api-client'

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
