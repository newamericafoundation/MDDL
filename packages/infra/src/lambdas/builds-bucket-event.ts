import S3 from 'aws-sdk/clients/s3'

const s3 = new S3()
export const handler = async (event: any) => {
  console.log('Received:\n', event)

  await s3
    .copyObject({
      Bucket: event.Records[0].s3.bucket.name,
      Key: 'source.zip',
      CopySource:
        event.Records[0].s3.bucket.name + '/' + event.Records[0].s3.object.key,
    })
    .promise()
}
