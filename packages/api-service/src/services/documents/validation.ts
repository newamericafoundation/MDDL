import { string, array, object, number } from 'joi'
import { MaxFileSize, MaxFilesPerDocument } from '@/constants'
import { APIGatewayRequest } from '@/utils/middleware'
import {
  FileContentTypeEnum,
  FileDownloadDispositionTypeEnum,
} from 'api-client'
import createError from 'http-errors'

export const createFileSchema = object({
  name: string().min(1).max(255).required(),
  contentLength: number().min(1).max(MaxFileSize).required(),
  contentType: string()
    .allow(...Object.values(FileContentTypeEnum))
    .only()
    .required(),
  sha256Checksum: string().min(1).max(255).required(),
})

export const createDocumentSchema = object({
  name: string().min(1).max(255).required(),
  files: array()
    .items(createFileSchema)
    .min(1)
    .max(MaxFilesPerDocument)
    .required(),
})

export const putDocumentSchema = object({
  name: string().max(255),
  description: string().max(500).allow(null),
}).or('name', 'description')

export const validateDisposition = () => (
  request: APIGatewayRequest,
): APIGatewayRequest => {
  const { disposition } = request
  if (
    !Object.values<string>(FileDownloadDispositionTypeEnum).includes(
      disposition,
    )
  ) {
    throw new createError.BadRequest('disposition type not found')
  }
  return request
}
