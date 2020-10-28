import {
  Document as DocumentContract,
  DocumentList as DocumentListContract,
  DocumentFile as DocumentFileContract,
  FileContentTypeEnum,
} from 'api-client'
import { Document } from '@/models/document'
import { File } from '@/models/file'
import { createJsonResponse } from '@/utils/api-gateway'
import { getPresignedUploadUrl } from '@/utils/s3'

export const createLinksForFile = async (file: File) => {
  const links: any[] = []
  if (file.received) {
    links.push({
      href: `/documents/${file.documentId}/files/${file.id}/download?disposition=attachment`,
      rel: 'download',
      type: 'GET',
    })
    links.push({
      href: `/documents/${file.documentId}/files/${file.id}/download?disposition=inline`,
      rel: 'preview',
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

export const createDocumentListItem = (document: Document) => {
  const { id, name, createdAt } = document

  return {
    name,
    createdDate: createdAt.toISOString(),
    id,
    links: [
      {
        href: `/documents/${id}`,
        rel: 'self',
        type: 'GET',
      },
    ],
  }
}

export const createDocumentListResult = (documents: Document[]) => {
  return createJsonResponse<DocumentListContract>({
    documents: documents.map(createDocumentListItem),
  })
}

export const singleDocumentResult = async (
  document: Document,
): Promise<DocumentContract> => {
  const { id, name, createdAt, files: baseFiles } = document

  const files = baseFiles ? baseFiles : []

  return {
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
          contentType: f.contentType as FileContentTypeEnum,
          contentLength: f.contentLength,
        }),
      ),
    ),
    links: [],
  }
}

export const createSingleDocumentResult = async (document: Document) => {
  return createJsonResponse<DocumentContract>(
    await singleDocumentResult(document),
  )
}
