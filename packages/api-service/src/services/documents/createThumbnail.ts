import gm from 'gm'
import { FileContentTypeEnum } from 'api-client'
import { downloadObject, uploadObject } from '@/utils/s3'
import { unlinkSync } from 'fs'
import { FilesReceivedResponse } from './markFileReceived'
import { wrapAsyncHandler } from '@/utils/sentry'

export interface ThumbnailsGeneratedResponse {
  documentLinks: DocumentThumbnailLink[]
}

export interface DocumentThumbnailLink {
  documentId: string
  thumbnailKey: string
}

export const handler = wrapAsyncHandler(
  async (
    event: FilesReceivedResponse,
  ): Promise<ThumbnailsGeneratedResponse> => {
    const { files: rawFiles } = event
    const files = rawFiles.filter((f) => f.order === 0)
    const documentLinks: DocumentThumbnailLink[] = []
    for (const file of files) {
      const { id, path, documentId, contentType } = file
      const downloadLocation = `/tmp/${id}`
      const thumbnailLocation = `/tmp/thumbnail-${id}.png`
      const thumbnailKey = `${path}-thumbnail`
      await downloadObject(path, downloadLocation)
      await createThumbnail(
        contentType as FileContentTypeEnum,
        downloadLocation,
        thumbnailLocation,
      )
      await uploadObject(thumbnailLocation, thumbnailKey, {
        ContentType: FileContentTypeEnum.ImagePng,
      })
      documentLinks.push({
        documentId,
        thumbnailKey,
      })
      unlinkSync(downloadLocation)
      unlinkSync(thumbnailLocation)
    }
    return { documentLinks }
  },
  {
    rethrowAfterCapture: true,
  },
)

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
