const s3 = jest.requireActual('@/utils/s3')

export const createFilePath = s3.createFilePath

export const getPresignedDownloadUrl = async (path: string) =>
  `https://presigned-url.for/${path}`

export const getPresignedUploadUrl = async (
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
