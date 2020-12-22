import { requireConfiguration } from '@/config'
import { toMockedFunction } from './test'
import { createS3ZipFromS3Objects } from './zip'

const realKeys = [
  // enter real object keys here
  'documents/mysamplekey',
]

const realBucketName = 'mybucketname'

jest.mock('@/config')

// this is an integration test so is skipped but checked in to validate behaviour if needed
describe.skip('zip', () => {
  beforeAll(() => {
    toMockedFunction(requireConfiguration).mockImplementation(
      () => realBucketName,
    )
  })
  describe('createS3ZipFromS3Objects', () => {
    it('creates valid zip', async () => {
      jest.setTimeout(180000)
      expect(
        await createS3ZipFromS3Objects({
          key: 'collections/abc123.zip',
          objects: realKeys.map((f, i) => ({
            filename: `file${i}`,
            key: f,
          })),
        }),
      ).toBeTruthy()
    })
    it('creates empty zip if no files', async () => {
      jest.setTimeout(180000)
      expect(
        await createS3ZipFromS3Objects({
          key: 'collections/abc321.zip',
          objects: [],
        }),
      ).toBeTruthy()
    })
  })
})
