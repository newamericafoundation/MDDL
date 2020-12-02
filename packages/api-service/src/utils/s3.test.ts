import { EnvironmentVariable, requireConfiguration } from '@/config'
import {
  deleteObject,
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
} from './s3'
import { toMockedFunction } from './test'

jest.mock('@/config')

const realBucketName = 'mybucketname'

// this is an integration test so is skipped but checked in to validate behaviour if needed
describe.skip('s3', () => {
  beforeAll(() => {
    toMockedFunction(requireConfiguration)
      .mockReset()
      .mockImplementation((key: EnvironmentVariable) => {
        switch (key) {
          case EnvironmentVariable.DOCUMENTS_BUCKET:
            return realBucketName
          default:
            return key
        }
      })
  })
  describe('getPresignedUploadUrl', () => {
    it('creates valid url', async () => {
      expect(
        getPresignedUploadUrl(
          'documents/my-test-document',
          'image/png',
          100000,
          '74da71d02bbf571304bdeb5530621cf8e9ff0d2e3f87ad43fb7ef057808deca4',
        ),
      ).toMatchInlineSnapshot(`Object {}`)
    })
  })
  describe('getPresignedDownloadUrl', () => {
    it('creates valid url', async () => {
      expect(
        getPresignedDownloadUrl(
          'documents/my-test-document',
          'my-original-doc-name.pdf',
          'attachment',
        ),
      ).toMatchInlineSnapshot(`Object {}`)
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
