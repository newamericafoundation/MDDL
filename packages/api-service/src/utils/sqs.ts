import { SQSRecord } from 'aws-lambda'
import SqsCLient from 'aws-sdk/clients/sqs'

const sqsCLient = new SqsCLient()
type FifoAttributes = {
  MessageDeduplicationId: string
  MessageGroupId: string
}

export const putMessage = async <T = any>(
  data: T,
  queueUrl: string,
  fifoAttributes?: FifoAttributes,
) => {
  const { MessageDeduplicationId, MessageGroupId } = fifoAttributes || {}
  await sqsCLient
    .sendMessage(
      {
        MessageBody: JSON.stringify(data),
        QueueUrl: queueUrl,
        MessageDeduplicationId,
        MessageGroupId,
      },
      undefined,
    )
    .promise()
}

export const deleteMessages = async (
  queueUrl: string,
  messages: SQSRecord[],
) => {
  await sqsCLient
    .deleteMessageBatch(
      {
        QueueUrl: queueUrl,
        Entries: messages.map((m) => ({
          Id: m.messageId,
          ReceiptHandle: m.receiptHandle,
        })),
      },
      undefined,
    )
    .promise()
}
