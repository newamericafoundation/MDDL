import { string_to_bytes as stringToBytes } from 'asmcrypto.js'
import hashFile from '.'

describe('SHA256 hash', () => {
  const sha256Vectors: { hash: string; file: File }[] = [
    {
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      file: new File([], 'empty'),
    },
    {
      hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      file: new File([stringToBytes('abc')], 'abc'),
    },
    {
      hash: 'f08a78cbbaee082b052ae0708f32fa1e50c5c421aa772ba5dbb406a2ea6be342',
      file: new File(
        [
          stringToBytes(
            'For this sample, this 63-byte string will be used as input data',
          ),
        ],
        '63',
      ),
    },
    {
      hash: 'ab64eff7e88e2e46165e29f2bce41826bd4c7b3552f6b382a9e7d3af47c245f8',
      file: new File(
        [
          stringToBytes(
            'This is exactly 64 bytes long, not counting the terminating byte',
          ),
        ],
        '64',
      ),
    },
  ]

  it('hashFile', async () => {
    for (let i = 0; i < sha256Vectors.length; ++i) {
      expect(await hashFile(sha256Vectors[i].file)).toBe(sha256Vectors[i].hash)
    }
  })
})
