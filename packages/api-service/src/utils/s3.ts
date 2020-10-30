import S3 from 'aws-sdk/clients/s3'
import { readFileSync, writeFileSync } from 'fs'
const s3 = new S3({
  signatureVersion: 'v4',
  region: process.env.AWS_REGION || undefined,
})
const BUCKET = process.env.DOCUMENTS_BUCKET as string

export const createFilePath = (
  ownerId: string,
  documentId: string,
  fileId: string,
) => `documents/${ownerId}/${documentId}/${fileId}`

export const getPresignedUploadUrl = (
  path: string,
  contentType: string,
  contentLength: number,
  sha256Checksum: string,
): {
  url: string
  fields: { [index: string]: string }
} => {
  return s3.createPresignedPost({
    Bucket: BUCKET,
    Fields: {
      key: path,
      'x-amz-content-sha256': sha256Checksum,
      'Content-Type': contentType,
      'Content-Length': contentLength.toString(),
    },
    Expires: 300,
  })
}

export const getPresignedDownloadUrl = (
  path: string,
  filename: string,
  disposition: string,
  expires = 300,
) => {
  return s3.getSignedUrl('getObject', {
    Bucket: BUCKET,
    Key: path,
    Expires: expires,
    ResponseContentDisposition: `${disposition}; filename=${filename}`,
  })
}

export const downloadObject = async (key: string, outputPath: string) => {
  const result = await s3
    .getObject(
      {
        Bucket: BUCKET,
        Key: key,
      },
      undefined,
    )
    .promise()
  writeFileSync(outputPath, result.Body)
}

export const uploadObject = async (
  filePath: string,
  key: string,
  otherParams: Partial<S3.PutObjectRequest> = {},
) => {
  const data = readFileSync(filePath)
  const params = {
    ...otherParams,
    Bucket: BUCKET,
    Key: key,
    Body: data,
  }
  await s3.upload(params).promise()
}

export const deleteObject = async (key: string) => {
  return await s3
    .deleteObject(
      {
        Bucket: BUCKET,
        Key: key,
      },
      undefined,
    )
    .promise()
}
