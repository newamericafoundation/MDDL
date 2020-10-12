import { createDocument } from './document'
import { File as FileModel, markFileReceived } from './file'
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
})
