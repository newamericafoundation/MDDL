import gm from 'gm'
import { FileContentTypeEnum } from 'api-client'
import { downloadFile, uploadFile } from '@/utils/s3'
import { unlinkSync } from 'fs'
import { FilesReceivedResponse } from './markFileReceived'

export interface ThumbnailsGeneratedResponse {
  documentLinks: DocumentThumbnailLink[]
}

export interface DocumentThumbnailLink {
  documentId: string
  thumbnailKey: string
}

export const handler = async (
  event: FilesReceivedResponse,
): Promise<ThumbnailsGeneratedResponse> => {
  console.log('Received: ', JSON.stringify(event))
  const { files: rawFiles } = event
  const files = rawFiles.filter((f) => f.order === 0)
  const documentLinks: DocumentThumbnailLink[] = []
  for (const file of files) {
    const downloadLocation = `/tmp/${file.id}`
    const thumbnailLocation = `/tmp/thumbnail-${file.id}`
    const thumbnailKey = `${file.path}-thumbnail`
    await downloadFile(file.path, downloadLocation)
    await createThumbnail(
      file.contentType as FileContentTypeEnum,
      downloadLocation,
      thumbnailLocation,
    )
    await uploadFile(thumbnailLocation, thumbnailKey, {
      ContentType: FileContentTypeEnum.ImagePng,
    })
    documentLinks.push({
      documentId: file.documentId,
      thumbnailKey,
    })
    unlinkSync(downloadLocation)
    unlinkSync(thumbnailLocation)
  }
  return { documentLinks }
}

export const createThumbnail = (
  contentType: FileContentTypeEnum,
  inputPath: string,
  outputPath: string,
) => {
  if (contentType == FileContentTypeEnum.ApplicationPdf) {
    inputPath += '[0]'
  }
  return new Promise<string>((resolve, reject) => {
    gm(inputPath).thumb(100, 100, outputPath, 80, function (error) {
      if (!error) {
        resolve(outputPath)
      } else {
        reject(error)
      }
    })
  })
}

export default handler
