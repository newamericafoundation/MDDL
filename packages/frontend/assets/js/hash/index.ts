import { Sha256, bytes_to_hex as bytesToHex } from 'asmcrypto.js'

export function hashFile(file: File): Promise<string> {
  const chunkSize = 1 * 1024 * 1024
  let offset = 0

  const hasher = new Sha256()
  const fileReader = new FileReader()

  return new Promise((resolve, reject) => {
    fileReader.onload = function(e: ProgressEvent<FileReader>) {
      if (!e.target) {
        reject(new Error('FileReader had no target'))
      } else if (e.target.error === null) {
        offset += (e.target.result as ArrayBuffer).byteLength
        const uint8Array = new Uint8Array(e.target.result as ArrayBuffer)
        hasher.process(uint8Array)
      } else {
        reject(e.target.error)
      }

      if (offset < file.size) {
        fileReader.readAsArrayBuffer(file.slice(offset, chunkSize + offset))
      } else {
        hasher.finish()

        resolve(bytesToHex(hasher.result!))
      }
    }

    fileReader.readAsArrayBuffer(file.slice(offset, chunkSize + offset))
  })
}
