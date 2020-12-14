import {
  countDocumentsByOwnerId,
  getDocumentById,
  getDocumentsByOwnerId,
  createDocument,
  Document as DocumentModel,
  getDocumentsByIdsAndOwnerId,
  updateDocument,
  getSingleDocumentById,
  documentIsInCollectionWithGrant,
  setDocumentThumbnailPath,
  deleteDocument,
  documentsInAnyCollectionWithGrantAndOwner,
} from './document'
import { v4 as uuidv4 } from 'uuid'
import { connectDatabase } from '@/utils/database'
import { CollectionGrantType } from 'api-client'
import { createCollection } from './collection'

describe('DocumentModel', () => {
  beforeAll(async () => {
    await connectDatabase().migrate.latest()
  })

  describe('getDocumentsByOwnerId', () => {
    it('returns null when no documents found', async () => {
      const id = uuidv4()
      expect(await getDocumentsByOwnerId(id)).toStrictEqual([])
    })
    it('returns a document when there is one found', async () => {
      const id = uuidv4()
      await DocumentModel.query().insert({
        createdBy: id,
        ownerId: id,
        name: id,
        updatedBy: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      const results = await getDocumentsByOwnerId(id)
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual(
        expect.objectContaining({
          name: id,
        }),
      )
    })
  })

  describe('getSingleDocumentById', () => {
    it('returns null when no document found', async () => {
      const id = uuidv4()
      expect(await getSingleDocumentById(id)).toBeNull()
    })
    it('returns a document when there is one found', async () => {
      const userId = uuidv4()
      const documentId = uuidv4()
      const name = 'my test document'
      const path = `uploads/my-id/${userId}.png`
      const doc = await createDocument({
        id: documentId,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId,
        createdBy: userId,
        updatedBy: userId,
        files: [
          {
            id: uuidv4(),
            contentType: 'image/png',
            createdAt: new Date(),
            createdBy: userId,
            name: 'document 1',
            path,
            sha256Checksum: 'ABC123',
            contentLength: 1000,
            received: false,
          },
        ],
      })
      const results = await getSingleDocumentById(doc.id)
      expect(results).toEqual(
        expect.objectContaining({
          name,
          files: expect.arrayContaining([
            expect.objectContaining({ createdBy: userId, path }),
          ]),
        }),
      )
    })
  })

  describe('getDocumentById', () => {
    it('returns null when no document found', async () => {
      const id = uuidv4()
      expect(await getDocumentById(id)).toBeNull()
    })
    it('returns a document when there is one found', async () => {
      const id = uuidv4()
      const doc = await DocumentModel.query().insert({
        createdBy: id,
        ownerId: id,
        name: id,
        updatedBy: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      const results = await getDocumentById(doc.id)
      expect(results).toEqual(
        expect.objectContaining({
          name: id,
        }),
      )
    })
  })

  describe('createDocument', () => {
    it('inserts values', async () => {
      const userId = uuidv4()
      const documentId = uuidv4()
      const name = 'my test document'
      const path = `uploads/my-id/${userId}.png`
      expect(
        await createDocument({
          id: documentId,
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
          ownerId: userId,
          createdBy: userId,
          updatedBy: userId,
          files: [
            {
              id: uuidv4(),
              contentType: 'image/png',
              createdAt: new Date(),
              createdBy: userId,
              name: 'document 1',
              path,
              sha256Checksum: 'ABC123',
              contentLength: 1000,
              received: false,
            },
          ],
        }),
      ).toEqual(
        expect.objectContaining({
          name,
          ownerId: userId,
          createdBy: userId,
          files: expect.arrayContaining([
            expect.objectContaining({ createdBy: userId, path }),
          ]),
        }),
      )
    })
  })

  describe('countDocumentsByOwnerId', () => {
    it('returns 0 when no documents found', async () => {
      const id = uuidv4()
      expect(await countDocumentsByOwnerId(id)).toEqual(0)
    })
    it('counts correct number of documents', async () => {
      const id = uuidv4()
      const count = 5
      for (let i = 0; i < count; i++) {
        await DocumentModel.query().insert({
          createdBy: id,
          ownerId: id,
          name: '' + i,
          updatedBy: id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
      expect(await countDocumentsByOwnerId(id)).toEqual(count)
    })
  })

  describe('getDocumentsByIdsAndOwnerId', () => {
    it('returns empty if document not found', async () => {
      const id = uuidv4()
      expect(await getDocumentsByIdsAndOwnerId([uuidv4()], id)).toStrictEqual(
        [],
      )
    })
    it('returns single element when only document is found', async () => {
      const userId = uuidv4()
      const id = uuidv4()
      await DocumentModel.query().insert({
        id,
        createdBy: userId,
        ownerId: userId,
        name: '' + id,
        updatedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(await getDocumentsByIdsAndOwnerId([id], userId)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id,
            name: '' + id,
          }),
        ]),
      )
    })
    it('returns one when single document is not found from list', async () => {
      const userId = uuidv4()
      const id = uuidv4()
      await DocumentModel.query().insert({
        id,
        createdBy: userId,
        ownerId: userId,
        name: '' + id,
        updatedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(await getDocumentsByIdsAndOwnerId([id, uuidv4()], userId)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id,
            name: '' + id,
          }),
        ]),
      )
    })
    it('returns true when all grants in list are found', async () => {
      const userId = uuidv4()
      const id1 = uuidv4()
      const id2 = uuidv4()
      await DocumentModel.query().insert({
        id: id1,
        createdBy: userId,
        ownerId: userId,
        name: '' + id1,
        updatedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await DocumentModel.query().insert({
        id: id2,
        createdBy: userId,
        ownerId: userId,
        name: '' + id2,
        updatedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(await getDocumentsByIdsAndOwnerId([id1, id2], userId)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: id2,
            name: '' + id2,
          }),
          expect.objectContaining({
            id: id1,
            name: '' + id1,
          }),
        ]),
      )
    })
  })

  describe('updateDocument', () => {
    it('returns 0 if document not updated', async () => {
      const id = uuidv4()
      expect(
        await updateDocument(id, {
          updatedAt: new Date(),
          updatedBy: id,
          name: 'test updated',
          description: 'test description',
        }),
      ).toStrictEqual(0)
    })
    it('returns 1 when document updated', async () => {
      const id = uuidv4()
      await DocumentModel.query().insert({
        id,
        createdBy: id,
        ownerId: id,
        name: '' + id,
        updatedBy: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(
        await updateDocument(id, {
          updatedAt: new Date(),
          updatedBy: id,
          name: 'test updated',
          description: 'test description',
        }),
      ).toStrictEqual(1)
    })
    it('can update description to null', async () => {
      const id = uuidv4()
      await DocumentModel.query().insert({
        id,
        createdBy: id,
        ownerId: id,
        name: '' + id,
        description: 'my description',
        updatedBy: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(
        await updateDocument(id, {
          updatedAt: new Date(),
          updatedBy: id,
          description: null,
        }),
      ).toStrictEqual(1)
      expect(await DocumentModel.query().findById(id)).toEqual(
        expect.objectContaining({
          description: null,
        }),
      )
    })
  })

  describe('setDocumentThumbnailPath', () => {
    it('returns 0 if document not updated', async () => {
      const id = uuidv4()
      expect(await setDocumentThumbnailPath(id, 'newPath')).toStrictEqual(0)
    })
    it('returns 1 when document updated', async () => {
      const id = uuidv4()
      await DocumentModel.query().insert({
        id,
        createdBy: id,
        ownerId: id,
        name: '' + id,
        updatedBy: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(await setDocumentThumbnailPath(id, 'newPath')).toStrictEqual(1)
    })
  })

  describe('documentIsInCollectionWithGrant', () => {
    const userId = uuidv4()
    const collectionId = uuidv4()
    const userEmail = 'testgrantemail'
    let document1: DocumentModel
    let document2: DocumentModel
    beforeAll(async () => {
      document1 = await DocumentModel.query().insertAndFetch({
        name: 'My Test Document 1',
        ownerId: userId,
        createdBy: userId,
        createdAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      document2 = await DocumentModel.query().insertAndFetch({
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
        grants: [
          {
            id: uuidv4(),
            requirementType: CollectionGrantType.INDIVIDUALEMAIL,
            requirementValue: userEmail,
            createdAt: new Date(),
            createdBy: userId,
            ownerId: userId,
          },
        ],
      })
    })
    it('returns false if document not found', async () => {
      const id = uuidv4()
      expect(
        await documentIsInCollectionWithGrant(
          id,
          CollectionGrantType.INDIVIDUALEMAIL,
          userEmail,
        ),
      ).toStrictEqual(false)
    })
    it('returns false if grant not found', async () => {
      expect(
        await documentIsInCollectionWithGrant(
          document1.id,
          CollectionGrantType.INDIVIDUALEMAIL,
          'test',
        ),
      ).toStrictEqual(false)
    })
    it('returns true if document and grant are found', async () => {
      expect(
        await documentIsInCollectionWithGrant(
          document1.id,
          CollectionGrantType.INDIVIDUALEMAIL,
          userEmail,
        ),
      ).toStrictEqual(true)
    })
  })

  describe('deleteDocument', () => {
    const userId = uuidv4()
    const documentId = uuidv4()
    const collectionId = uuidv4()
    const userEmail = 'testgrantemail'
    let document: DocumentModel
    beforeAll(async () => {
      document = await createDocument({
        id: documentId,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId,
        createdBy: userId,
        updatedBy: userId,
        files: [
          {
            id: uuidv4(),
            contentType: 'image/png',
            createdAt: new Date(),
            createdBy: userId,
            name: 'document 1',
            path: 'filePath',
            sha256Checksum: 'ABC123',
            contentLength: 1000,
            received: false,
          },
        ],
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
            documentId: document.id,
            createdAt: new Date(),
            createdBy: userId,
          },
        ],
        grants: [
          {
            id: uuidv4(),
            requirementType: CollectionGrantType.INDIVIDUALEMAIL,
            requirementValue: userEmail,
            createdAt: new Date(),
            createdBy: userId,
            ownerId: userId,
          },
        ],
      })
    })
    it('returns 0 if document not found', async () => {
      const id = uuidv4()
      expect(await deleteDocument(id)).toStrictEqual(0)
    })
    it('returns 1 if document found', async () => {
      expect(await deleteDocument(documentId)).toStrictEqual(1)
    })
  })

  describe('documentsInAnyCollectionWithGrantAndOwner', () => {
    const ownerId = uuidv4()
    const collectionId1 = uuidv4()
    const collectionId2 = uuidv4()
    const userEmail = 'testgrantemail'
    let document1: DocumentModel
    let document2: DocumentModel
    beforeAll(async () => {
      document1 = await DocumentModel.query().insertAndFetch({
        name: 'My Test Document 1',
        ownerId,
        createdBy: ownerId,
        createdAt: new Date('2015-01-12T13:14:15Z'),
        updatedBy: ownerId,
        updatedAt: new Date('2015-01-12T13:14:15Z'),
      })
      document2 = await DocumentModel.query().insertAndFetch({
        name: 'My Test Document 2',
        ownerId,
        createdBy: ownerId,
        createdAt: new Date('2015-01-12T13:24:15Z'),
        updatedBy: ownerId,
        updatedAt: new Date('2015-01-12T13:24:15Z'),
      })
      await createCollection({
        id: collectionId1,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId,
        createdBy: ownerId,
        updatedBy: ownerId,
        collectionDocuments: [
          {
            documentId: document1.id,
            createdAt: new Date('2015-01-15T13:14:15Z'),
            createdBy: ownerId,
          },
          {
            documentId: document2.id,
            createdAt: new Date('2015-01-16T13:14:15Z'),
            createdBy: ownerId,
          },
        ],
        grants: [
          {
            id: uuidv4(),
            requirementType: CollectionGrantType.INDIVIDUALEMAIL,
            requirementValue: userEmail,
            createdAt: new Date('2015-01-17T13:14:15Z'),
            createdBy: ownerId,
            ownerId,
          },
        ],
      })
      await createCollection({
        id: collectionId2,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId,
        createdBy: ownerId,
        updatedBy: ownerId,
        collectionDocuments: [
          {
            documentId: document1.id,
            createdAt: new Date('2015-01-18T13:14:15Z'),
            createdBy: ownerId,
          },
        ],
        grants: [
          {
            id: uuidv4(),
            requirementType: CollectionGrantType.INDIVIDUALEMAIL,
            requirementValue: userEmail,
            createdAt: new Date('2015-01-18T13:14:15Z'),
            createdBy: ownerId,
            ownerId,
          },
        ],
      })
    })
    it('returns empty if no documents found', async () => {
      const id = uuidv4()
      expect(
        await documentsInAnyCollectionWithGrantAndOwner(
          id,
          CollectionGrantType.INDIVIDUALEMAIL,
          userEmail,
        ),
      ).toStrictEqual([])
    })
    it('returns documents when found', async () => {
      const result = await documentsInAnyCollectionWithGrantAndOwner(
        ownerId,
        CollectionGrantType.INDIVIDUALEMAIL,
        userEmail,
      )
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            createdAt: new Date('2015-01-12T13:14:15.000Z'),
            name: 'My Test Document 1',
            thumbnailPath: null,
            updatedAt: new Date('2015-01-12T13:14:15.000Z'),
            grantCreatedAt: new Date('2015-01-18T13:14:15.000Z'),
            grantCreatedBy: ownerId,
            documentCollectionCreatedBy: ownerId,
            documentCollectionCreatedAt: new Date('2015-01-18T13:14:15.000Z'),
          }),
          expect.objectContaining({
            createdAt: new Date('2015-01-12T13:24:15.000Z'),
            name: 'My Test Document 2',
            thumbnailPath: null,
            updatedAt: new Date('2015-01-12T13:24:15.000Z'),
            grantCreatedAt: new Date('2015-01-17T13:14:15.000Z'),
            grantCreatedBy: ownerId,
            documentCollectionCreatedBy: ownerId,
            documentCollectionCreatedAt: new Date('2015-01-16T13:14:15.000Z'),
          }),
        ]),
      )
    })
  })
})
