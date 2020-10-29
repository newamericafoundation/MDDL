import { connectDatabase } from '@/utils/database'
import { ThumbnailsGeneratedResponse } from './createThumbnail'
import { setDocumentThumbnailPath } from '@/models/document'

connectDatabase()

export const handler = async (
  event: ThumbnailsGeneratedResponse,
): Promise<void> => {
  console.log('Received: ', JSON.stringify(event))
  const { documentLinks } = event
  for (const link of documentLinks) {
    await setDocumentThumbnailPath(link.documentId, link.thumbnailKey)
  }
}

export default handler
