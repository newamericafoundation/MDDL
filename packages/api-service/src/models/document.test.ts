import {
  getDocumentById,
  getDocumentsByOwnerId,
  createDocument,
  Document as DocumentModel,
} from './document'
import { v4 as uuidv4 } from 'uuid'
import { connectDatabase } from '@/utils/database'

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

  describe('getDocumentById', () => {
    it('returns null when no document found', async () => {
      const id = uuidv4()
      expect(await getDocumentById(id, id)).toBeNull()
    })
    it('returns a document when there is one found', async () => {
      const id = uuidv4()
      const doc = await DocumentModel.query().insert({
        createdBy: id,
        ownerId: id,
        name: id,
        updatedBy: id,
      })
      const results = await getDocumentById(doc.id, id)
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
})
