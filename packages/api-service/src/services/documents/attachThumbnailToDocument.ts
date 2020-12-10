import { connectDatabase } from '@/utils/database'
import { ThumbnailsGeneratedResponse } from './createThumbnail'
import { setDocumentThumbnailPath } from '@/models/document'
import { wrapAsyncHandler } from '@/utils/sentry'

connectDatabase()

export const handler = wrapAsyncHandler(
  async (event: ThumbnailsGeneratedResponse): Promise<void> => {
    const { documentLinks } = event
    for (const link of documentLinks) {
      await setDocumentThumbnailPath(link.documentId, link.thumbnailKey)
    }
  },
  {
    rethrowAfterCapture: true,
  },
)

export default handler
