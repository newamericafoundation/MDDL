import { SQSRecord } from 'aws-lambda'
import SqsCLient from 'aws-sdk/clients/sqs'
import { chunk } from 'lodash'

const sqsCLient = new SqsCLient()
type FifoAttributes = {
  MessageDeduplicationId: string
  MessageGroupId: string
}

type Message<T> = {
  Id: string
  Data: T
} & FifoAttributes

export const putMessages = async <T = any>(
  messages: Message<T>[],
  queueUrl: string,
) => {
  const groups = chunk(messages, 10)
  for (const group of groups) {
    const entries = group.map(
      ({ Id, Data, MessageDeduplicationId, MessageGroupId }) => ({
        Id,
        MessageBody: JSON.stringify(Data),
        MessageDeduplicationId,
        MessageGroupId,
      }),
    )
    const result = await sqsCLient
      .sendMessageBatch(
        {
          QueueUrl: queueUrl,
          Entries: entries,
        },
        undefined,
      )
      .promise()
    if (result.Failed.length) {
      throw new Error(
        'An error occurred while putting audit log message batch ' +
          result.Failed.map(
            (f) => `${f.Code} - ${f.Message || ''} (${f.Id})`,
          ).join(' '),
      )
    }
  }
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
