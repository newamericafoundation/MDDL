import S3 from 'aws-sdk/clients/s3'
const s3 = new S3({
  signatureVersion: 'v4',
  region: process.env.AWS_REGION || undefined,
})
const BUCKET = process.env.DOCUMENTS_BUCKET

export const createFilePath = (
  ownerId: string,
  documentId: string,
  fileId: string,
) => `documents/${ownerId}/${documentId}/${fileId}`

export const getPresignedUploadUrl = async (
  path: string,
  contentType: string,
  contentLength: number,
  sha256Checksum: string,
): Promise<{
  url: string
  fields: { [index: string]: string }
}> => {
  return new Promise((resolve, reject) =>
    s3.createPresignedPost(
      {
        Bucket: BUCKET,
        Fields: {
          key: path,
          'x-amz-content-sha256': sha256Checksum,
          'Content-Type': contentType,
          'Content-Length': contentLength.toString(),
        },
        Expires: 300,
      },
      (err, data) => {
        if (err) reject(err)
        else resolve(data)
      },
    ),
  )
}

export const getPresignedDownloadUrl = async (path: string) => {
  return await s3.getSignedUrlPromise('getObject', {
    Bucket: BUCKET,
    Key: path,
    Expires: 300,
  })
}
