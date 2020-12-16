const s3 = jest.requireActual('@/utils/s3')

export const createFilePath = s3.createFilePath

export const getPresignedDownloadUrl = (
  path: string,
  filename: string,
  disposition: 'attachment' | 'inline',
) =>
  `https://presigned-url.for/${path}?filename=${filename}&disposition=${disposition}`

export const getPresignedUploadUrl = (
  path: string,
  contentType: string,
  contentLength: number,
  sha256Checksum: string,
) => ({
  url: `https://presigned-url.for/${path}+${sha256Checksum}`,
  fields: {
    'Content-Type': contentType,
    'Content-Length': contentLength,
  },
})

export const downloadObject = jest.fn()

export const uploadObject = jest.fn()

export const deleteObject = jest.fn()

export const getObjectReadStream = jest.fn()

export const uploadObjectStream = jest.fn()

export const objectExists = jest.fn()
