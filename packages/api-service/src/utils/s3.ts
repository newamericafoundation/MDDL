import { EnvironmentVariable, requireConfiguration } from '@/config'
import { DocumentsPrefix } from '@/constants'
import S3 from 'aws-sdk/clients/s3'
import { readFileSync, writeFileSync } from 'fs'
import { captureAWSClient } from 'aws-xray-sdk'
import { logger } from './logging'

const s3 = captureAWSClient(
  new S3({
    signatureVersion: 'v4',
    region: process.env.AWS_REGION || undefined,
  }),
)
const getDocumentsBucket = () =>
  requireConfiguration(EnvironmentVariable.DOCUMENTS_BUCKET)

export const createFilePath = (
  ownerId: string,
  documentId: string,
  fileId: string,
) => `${DocumentsPrefix}/${ownerId}/${documentId}/${fileId}`

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
    Bucket: getDocumentsBucket(),
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
  disposition: 'attachment' | 'inline',
  expires = 300,
) => {
  return s3.getSignedUrl('getObject', {
    Bucket: getDocumentsBucket(),
    Key: path,
    Expires: expires,
    ResponseContentDisposition: `${disposition}; filename="${filename}"`,
  })
}

export const downloadObject = async (key: string, outputPath: string) => {
  const result = await s3
    .getObject(
      {
        Bucket: getDocumentsBucket(),
        Key: key,
      },
      undefined,
    )
    .promise()
  writeFileSync(outputPath, result.Body)
}

export const getObjectReadStream = (key: string) => {
  return s3
    .getObject({ Bucket: getDocumentsBucket(), Key: key })
    .createReadStream()
}

export const uploadObject = async (
  filePath: string,
  key: string,
  otherParams: Partial<S3.PutObjectRequest> = {},
) => {
  const data = readFileSync(filePath)
  const params: S3.PutObjectRequest = {
    ...otherParams,
    Bucket: getDocumentsBucket(),
    Key: key,
    Body: data,
  }
  await s3.upload(params).promise()
}

export const uploadObjectStream = (
  stream: S3.Body,
  key: string,
  otherParams: Partial<S3.PutObjectRequest> = {},
) => {
  const Bucket = getDocumentsBucket()
  return s3.upload(
    {
      ...otherParams,
      Bucket,
      Key: key,
      Body: stream,
    },
    (err) => {
      if (err) {
        logger.error(err)
        throw new Error(
          `Error streaming object to s3 for ${Bucket}, ${key}: ${err}`,
        )
      }
    },
  )
}

export const deleteObject = async (key: string) => {
  return await s3
    .deleteObject(
      {
        Bucket: getDocumentsBucket(),
        Key: key,
      },
      undefined,
    )
    .promise()
}

export const objectExists = async (key: string): Promise<boolean> => {
  try {
    await s3
      .headObject(
        {
          Bucket: getDocumentsBucket(),
          Key: key,
        },
        undefined,
      )
      .promise()
    return true
  } catch (err) {
    return false
  }
}
