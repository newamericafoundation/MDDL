import { S3Event } from 'aws-lambda'
import { markFileReceived } from '@/models/file'
import { connectDatabase } from '@/utils/database'
import { File } from '@/models/file'
import { wrapAsyncHandler } from '@/utils/sentry'

connectDatabase()

export interface FilesReceivedResponse {
  files: File[]
}

export const handler = wrapAsyncHandler(
  async (event: S3Event): Promise<FilesReceivedResponse> => {
    const files: File[] = []
    for (const record of event.Records) {
      const filePath = record.s3.object.key
      const file = await markFileReceived(filePath)
      if (file) {
        files.push(file)
      }
    }
    return { files }
  },
)

export default handler
