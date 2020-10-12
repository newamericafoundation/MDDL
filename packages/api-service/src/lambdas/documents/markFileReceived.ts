import { S3Event, S3Handler } from 'aws-lambda'
import { markFileReceived } from '@/models/file'
import { connectDatabase } from '@/utils/database'

connectDatabase()

export const handler: S3Handler = async (event: S3Event): Promise<void> => {
  console.log('Received: ', event)
  for (const record of event.Records) {
    const filePath = record.s3.object.key
    await markFileReceived(filePath)
  }
}

export default handler
