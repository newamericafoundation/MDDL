import { createDocument } from './document'
import {
  File as FileModel,
  getFileByIdAndDocumentId,
  getFilesByDocumentId,
  getFilesByDocumentIds,
  markFileReceived,
} from './file'
import { v4 as uuidv4 } from 'uuid'
import { connectDatabase } from '@/utils/database'

describe('FileModel', () => {
  beforeAll(async () => {
    await connectDatabase().migrate.latest()
  })

  describe('markFileReceived', () => {
    it('fails correctly', async () => {
      expect(await markFileReceived('mycustompath')).toBeFalsy()
    })
    it('updates file', async () => {
      const userId = uuidv4()
      const documentId = uuidv4()
      const fileId = uuidv4()
      const path = `uploads/my-id/${userId}.png`
      const data = await createDocument({
        id: documentId,
        name: 'my test document',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId,
        createdBy: userId,
        updatedBy: userId,
        files: [
          {
            id: fileId,
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
      const files = data.files as FileModel[]
      const file = files[0]
      expect(file.received).toBeFalsy()
      expect(file.id).toBe(fileId)
      expect(await markFileReceived(path)).toEqual(
        expect.objectContaining({
          path,
          id: file.id,
          received: 1,
        }),
      )
    })
  })

  describe('getFileByIdAndDocumentId', () => {
    it('fails correctly', async () => {
      expect(await getFileByIdAndDocumentId('abc', '123')).toBeFalsy()
    })
    it('finds file', async () => {
      const userId = uuidv4()
      const documentId = uuidv4()
      const fileId = uuidv4()
      const path = `uploads/my-id/${userId}.png`
      const data = await createDocument({
        id: documentId,
        name: 'my test document',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId,
        createdBy: userId,
        updatedBy: userId,
        files: [
          {
            id: fileId,
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
      const files = data.files as FileModel[]
      const file = files[0]
      expect(file.id).toBe(fileId)
      expect(await getFileByIdAndDocumentId(fileId, documentId)).toEqual(
        expect.objectContaining({
          path,
          id: file.id,
        }),
      )
    })
  })

  describe('getFilesByDocumentId', () => {
    it('returns empty when no files', async () => {
      expect(await getFilesByDocumentId('123')).toStrictEqual([])
    })
    it('finds files', async () => {
      const userId = uuidv4()
      const documentId = uuidv4()
      const fileId1 = uuidv4()
      const fileId2 = uuidv4()
      const path1 = `uploads/my-id/${fileId1}.png`
      const path2 = `uploads/my-id/${fileId2}.png`
      await createDocument({
        id: documentId,
        name: 'my test document',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId,
        createdBy: userId,
        updatedBy: userId,
        files: [
          {
            id: fileId1,
            contentType: 'image/png',
            createdAt: new Date(),
            createdBy: userId,
            name: 'document 1',
            path: path1,
            sha256Checksum: 'ABC123',
            contentLength: 1000,
            received: false,
          },
          {
            id: fileId2,
            contentType: 'image/png',
            createdAt: new Date(),
            createdBy: userId,
            name: 'document 2',
            path: path2,
            sha256Checksum: 'ABC123',
            contentLength: 1000,
            received: false,
          },
        ],
      })
      expect(await getFilesByDocumentId(documentId)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: path1,
            id: fileId1,
          }),
          expect.objectContaining({
            path: path2,
            id: fileId2,
          }),
        ]),
      )
    })
  })

  describe('getFilesByDocumentIds', () => {
    it('returns empty when no files', async () => {
      expect(await getFilesByDocumentIds(['123'])).toStrictEqual([])
    })
    it('finds files', async () => {
      const userId = uuidv4()
      const documentId1 = uuidv4()
      const documentId2 = uuidv4()
      const fileId1 = uuidv4()
      const fileId2 = uuidv4()
      const path1 = `uploads/my-id/${fileId1}.png`
      const path2 = `uploads/my-id/${fileId2}.png`
      await createDocument({
        id: documentId1,
        name: documentId1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId,
        createdBy: userId,
        updatedBy: userId,
        files: [
          {
            id: fileId1,
            contentType: 'image/png',
            createdAt: new Date(),
            createdBy: userId,
            name: 'document 1',
            path: path1,
            sha256Checksum: 'ABC123',
            contentLength: 1000,
            received: false,
          },
        ],
      })
      await createDocument({
        id: documentId2,
        name: documentId2,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: userId,
        createdBy: userId,
        updatedBy: userId,
        files: [
          {
            id: fileId2,
            contentType: 'image/png',
            createdAt: new Date(),
            createdBy: userId,
            name: 'document 2',
            path: path2,
            sha256Checksum: 'ABC123',
            contentLength: 1000,
            received: false,
          },
        ],
      })
      expect(await getFilesByDocumentIds([documentId1, documentId2])).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: path1,
            id: fileId1,
          }),
          expect.objectContaining({
            path: path2,
            id: fileId2,
          }),
        ]),
      )
    })
  })
})
