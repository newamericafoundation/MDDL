import { handler as createCollectionZip } from './createCollectionZip'
import { getDocumentsByCollectionId } from '@/models/collection'
import { Document as DocumentModel } from '@/models/document'
import { File as FileModel, getFilesByDocumentId } from '@/models/file'
import { createS3ZipFromS3Objects } from '@/utils/zip'
import { toMockedFunction } from '@/utils/test'

jest.mock('@/models/collection')
jest.mock('@/models/document')
jest.mock('@/models/file')
jest.mock('@/utils/zip')
jest.mock('@/utils/database')
jest.mock('@/config')

describe('createCollectionZip', () => {
  const userId = 'myUserId'
  const collectionId = 'myCollectionId'
  const event = {
    userId,
    collectionId,
  }
  beforeEach(() => {
    toMockedFunction(createS3ZipFromS3Objects).mockImplementationOnce(
      async () => ({
        Location: 'Location',
        ETag: 'ETag',
        Bucket: 'Bucket',
        Key: 'Key',
      }),
    )
    toMockedFunction(getFilesByDocumentId).mockImplementation(async () => [])
    toMockedFunction(
      getDocumentsByCollectionId,
    ).mockImplementation(async () => [])
  })
  it('returns successful on valid responses', async () => {
    toMockedFunction(getDocumentsByCollectionId).mockImplementation(
      async () => [
        DocumentModel.fromJson({
          id: 'myDocumentId1',
          ownerId: userId,
          name: 'My First File',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          createdBy: userId,
          updatedAt: new Date('2015-01-27T13:14:15Z'),
          updatedBy: userId,
        }),
        DocumentModel.fromJson({
          id: 'myDocumentId2',
          ownerId: userId,
          name: 'My Second File',
          createdAt: new Date('2015-01-27T13:14:15Z'),
          createdBy: userId,
          updatedBy: userId,
          updatedAt: new Date('2015-01-27T13:14:15Z'),
          thumbnailPath: 'my-thumbnail-path',
        }),
      ],
    )
    toMockedFunction(getFilesByDocumentId).mockImplementationOnce(
      async (documentId) => [
        FileModel.fromJson({
          id: 'file1' + documentId,
          documentId,
          path: 'myFile/file1',
          received: true,
          createdBy: userId,
          createdAt: new Date('2015-01-12T13:14:15Z'),
          name: 'myFile1.jpg',
          sha256Checksum: 'checksum',
          contentType: 'image/jpeg',
          contentLength: 10000,
        }),
        FileModel.fromJson({
          id: 'file2' + documentId,
          documentId,
          path: 'myFile/file2',
          received: true,
          createdBy: userId,
          createdAt: new Date('2015-01-12T13:14:15Z'),
          name: 'myFile2',
          sha256Checksum: 'checksum',
          contentType: 'image/jpeg',
          contentLength: 10000,
        }),
      ],
    )
    toMockedFunction(getFilesByDocumentId).mockImplementationOnce(
      async (documentId) => [
        FileModel.fromJson({
          id: 'file1' + documentId,
          documentId,
          path: 'myFile/file1',
          received: true,
          createdBy: userId,
          createdAt: new Date('2015-01-12T13:14:15Z'),
          name: 'myFile1.jpg',
          sha256Checksum: 'checksum',
          contentType: 'image/jpeg',
          contentLength: 10000,
        }),
      ],
    )
    expect(await createCollectionZip(event)).toMatchInlineSnapshot(`
      Object {
        "Bucket": "Bucket",
        "ETag": "ETag",
        "Key": "Key",
        "Location": "Location",
      }
    `)
    expect(toMockedFunction(createS3ZipFromS3Objects).mock.calls[0][0])
      .toMatchInlineSnapshot(`
      Object {
        "key": "collections/myCollectionId/21ada2387bdfd35ad360d2ee7836674484a5bf14e288ddc44fa92df587e618f7",
        "objects": Array [
          Object {
            "filename": "My First File - myFile1.jpg",
            "key": "myFile/file1",
          },
          Object {
            "filename": "My First File - myFile2",
            "key": "myFile/file2",
          },
          Object {
            "filename": "My Second File.jpg",
            "key": "myFile/file1",
          },
        ],
        "tags": "CreatedBy=myUserId",
      }
    `)
  })
})
