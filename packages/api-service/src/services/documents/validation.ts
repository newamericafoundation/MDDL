import { string, array, object, number } from 'joi'
import { MaxFileSize, MaxFilesPerDocument } from '@/constants'

export const createFileSchema = object({
  name: string().min(1).max(255).required(),
  contentLength: number().min(1).max(MaxFileSize).required(),
  contentType: string()
    .allow('application/pdf', 'image/jpeg', 'image/png', 'image/tiff')
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
  description: string().max(500),
}).or('name', 'description')
