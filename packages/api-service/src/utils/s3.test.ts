import { getPresignedDownloadUrl } from './s3'

// this is an integration test so is skipped but checked in to validate behaviour if needed
describe.skip('s3', () => {
  describe('getPresignedDownloadUrl', () => {
    it('creates valid url', async () => {
      expect(
        await getPresignedDownloadUrl(
          'documents/my-test-document',
          'my-original-doc-name.pdf',
          'attachment',
        ),
      ).toBeTruthy()
    })
  })
})
