import { getObjectReadStream, uploadObjectStream } from './s3'
import { PassThrough } from 'stream'
import Archiver from 'archiver'

export type S3ObjectDetails = { key: string; filename: string }

type CreateS3ZipFromStreamsOptions = {
  key: string
  tags?: string
  objects: S3ObjectDetails[]
}
export const createS3ZipFromS3Objects = async (
  params: CreateS3ZipFromStreamsOptions,
) => {
  // read in params
  const { key, tags, objects } = params

  // create write stream
  const streamPassThrough = new PassThrough()
  const s3Upload = uploadObjectStream(streamPassThrough, key, {
    ContentType: 'application/zip',
    Tagging: tags,
  })

  // attach object streams from S3 to archive
  await new Promise((resolve, reject) => {
    const archive = Archiver('zip')
    archive.on('error', reject)
    streamPassThrough.on('close', resolve)
    streamPassThrough.on('end', resolve)
    streamPassThrough.on('error', reject)

    archive.pipe(streamPassThrough)
    objects.forEach((o) => {
      archive.append(getObjectReadStream(o.key), { name: o.filename })
    })

    archive.finalize()
  })

  // wait for the upload to complete
  return await s3Upload.promise()
}
