import {
  Document as DocumentContract,
  DocumentFile as DocumentFileContract,
  FileContentTypeEnum,
} from 'api-client'
import { Document } from '@/models/document'
import { File } from '@/models/file'
import { createJsonResponse } from '@/utils/api-gateway'
import { FILE_CONTENT_TYPE } from '@/lambdas/constants'
import { getPresignedUploadUrl } from '@/utils/s3'

export const createLinksForFile = async (file: File) => {
  const links: any[] = []
  if (file.received) {
    links.push({
      href: `/documents/${file.documentId}/files/${file.id}/download`,
      rel: 'download',
      type: 'GET',
    })
  } else {
    const uploadData = await getPresignedUploadUrl(
      file.path,
      file.contentType,
      file.contentLength,
      file.sha256Checksum,
    )
    links.push({
      href: uploadData.url,
      rel: 'upload',
      type: 'POST',
      includeFormData: uploadData.fields,
    })
  }
  return links
}

export const createSingleDocumentResult = async (document: Document) => {
  const { id, name, createdAt, files: baseFiles } = document

  const files = baseFiles ? baseFiles : []

  return createJsonResponse<DocumentContract>({
    createdDate: createdAt.toISOString(),
    name,
    id,
    files: await Promise.all(
      files.map(
        async (f): Promise<DocumentFileContract> => ({
          id: f.id,
          createdDate: f.createdAt.toISOString(),
          links: await createLinksForFile(f),
          name: f.name,
          sha256Checksum: f.sha256Checksum,
          contentType: FILE_CONTENT_TYPE.get(
            f.contentType,
          ) as FileContentTypeEnum,
          contentLength: f.contentLength,
        }),
      ),
    ),
    links: [],
  })
}
