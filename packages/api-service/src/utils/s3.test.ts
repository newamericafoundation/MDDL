import { requireConfiguration } from '@/config'
import { deleteObject, getPresignedDownloadUrl } from './s3'
import { toMockedFunction } from './test'

jest.mock('@/config')

const realBucketName = 'mybucketname'

// this is an integration test so is skipped but checked in to validate behaviour if needed
describe.skip('s3', () => {
  beforeAll(() => {
    toMockedFunction(requireConfiguration).mockImplementationOnce(
      () => realBucketName,
    )
  })
  describe('getPresignedDownloadUrl', () => {
    it('creates valid url', async () => {
      expect(
        getPresignedDownloadUrl(
          'documents/my-test-document',
          'my-original-doc-name.pdf',
          'attachment',
        ),
      ).toBeTruthy()
    })
  })
  describe('deleteObject', () => {
    it('deletes the file', async () => {
      expect(await deleteObject('myfile.txt')).toMatchInlineSnapshot(
        `Object {}`,
      )
    })
  })
})
