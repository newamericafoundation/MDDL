import { putLogEvents } from '@/utils/logstream'
import { deleteMessages } from '@/utils/sqs'
import { toMockedFunction } from '@/utils/test'
import { SQSEvent } from 'aws-lambda'
import { handler } from './processActivity'

jest.mock('@/config')
jest.mock('@/utils/logstream')
jest.mock('@/utils/sqs')

const data: SQSEvent = {
  Records: [
    {
      attributes: {
        MessageGroupId: '8692AA86-81A8-4806-A1BA-F024B36BDB98',
        ApproximateReceiveCount: '1',
        SentTimestamp: '123456789',
        SenderId: 'DE7718E4-0B69-455E-9F9B-3C663653CF7B',
        ApproximateFirstReceiveTimestamp: '123456789',
      },
      messageId: '2903B5CC-A7C2-4185-9C6A-EA0636BC7AFD',
      body: JSON.stringify({
        field1: 'value1',
        field2: 'value2',
      }),
      awsRegion: 'us-east-1',
      eventSource: 'test',
      eventSourceARN: 'aws:::test::resource',
      md5OfBody: '1234567890',
      messageAttributes: {},
      receiptHandle: 'test',
    },
  ],
}

describe('processActivity', () => {
  it('handles data', async () => {
    expect(await handler(data)).toMatchInlineSnapshot(`1`)
    expect(toMockedFunction(putLogEvents)).toHaveBeenCalledTimes(1)
    expect(toMockedFunction(deleteMessages)).toHaveBeenCalledTimes(1)
  })
})
