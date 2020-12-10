import { EnvironmentVariable, requireConfiguration } from '@/config'
import { deleteMessages } from '@/utils/sqs'
import { parseAndValidate } from '@/utils/validation'
import { SQSEvent } from 'aws-lambda'
import { SendRequest, sendRequestSchema } from './validation'
import { sendEmail } from './emailSender'
import { wrapAsyncHandler } from '@/utils/sentry'

const getQueueUrl = () =>
  requireConfiguration(EnvironmentVariable.EMAIL_PROCESSOR_SQS_QUEUE_URL)

export const handler = wrapAsyncHandler(
  async (event: SQSEvent) => {
    for (const record of event.Records) {
      const { error, value: sendRequest } = parseAndValidate<SendRequest>(
        record.body,
        sendRequestSchema,
      )
      if (error) {
        console.error(
          'Error occurred validating record. Message will be removed from queue.',
          record,
        )
        await deleteMessages(getQueueUrl(), [record])
        continue
      }

      // read out message data
      const { toAddresses, template, data, subject } = sendRequest

      // send the emails individually to each recipient
      await Promise.all(
        toAddresses.map((to) =>
          sendEmail({
            template,
            destination: {
              ToAddresses: [to],
            },
            subject,
            data,
          }),
        ),
      )
      await deleteMessages(getQueueUrl(), [record])
    }
  },
  {
    rethrowAfterCapture: true,
  },
)
