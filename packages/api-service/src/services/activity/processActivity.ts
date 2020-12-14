import { EnvironmentVariable, requireConfiguration } from '@/config'
import { logger } from '@/utils/logging'
import { getLogStreamNextSequenceToken, putLogEvents } from '@/utils/logstream'
import { wrapAsyncHandler } from '@/utils/sentry'
import { deleteMessages } from '@/utils/sqs'
import { SQSEvent } from 'aws-lambda'
import groupBy from 'lodash/groupBy'

const queueUrl = requireConfiguration(
  EnvironmentVariable.ACTIVITY_RECORD_SQS_QUEUE_URL,
)
const logGroupName = requireConfiguration(
  EnvironmentVariable.ACTIVITY_CLOUDWATCH_LOG_GROUP,
)
const sequenceTokens: { [index: string]: string | undefined } = {}

const getSequenceToken = async (logStreamName: string) => {
  if (!sequenceTokens[logStreamName]) {
    sequenceTokens[logStreamName] = await getLogStreamNextSequenceToken({
      logGroupName,
      logStreamName,
    })
  }
  return sequenceTokens[logStreamName]
}

const setSequenceToken = async (
  logStreamName: string,
  sequenceToken: string | undefined,
) => {
  sequenceTokens[logStreamName] = sequenceToken
}

const deleteSequenceToken = (logStreamName: string) => {
  if (sequenceTokens[logStreamName]) {
    delete sequenceTokens[logStreamName]
  }
}

export const handler = wrapAsyncHandler(
  async (event: SQSEvent) => {
    // group by message group ID which is going to be our log stream name (should be the users ID)
    const groupedRecords = groupBy(
      event.Records,
      (r) => r.attributes.MessageGroupId,
    )

    // then process each group of messages
    for (const logStreamName in groupedRecords) {
      // get the records in the group
      const records = groupedRecords[logStreamName]
      const sequenceToken = await getSequenceToken(logStreamName)

      try {
        // try to put the events into the log stream, using the latest sequence token we know about
        const nextSequenceToken = await putLogEvents(
          {
            logGroupName,
            logStreamName,
          },
          records.map((r) => ({
            // these are both unix timestamps in milliseconds, but the SQS message is given as a string ¯\_(ツ)_/¯
            timestamp: parseInt('' + r.attributes.SentTimestamp),
            message: r.body,
          })),
          sequenceToken,
        )
        setSequenceToken(logStreamName, nextSequenceToken)
      } catch (ex) {
        logger.error(ex, 'An error occurred putting log events')
        // clean up sequence token as we may have cached the wrong value
        deleteSequenceToken(logStreamName)
        // we need to throw so that unprocessed messages are put back on the queue
        throw ex
      }
      // clean up messages in this group
      await deleteMessages(queueUrl, records)
    }
    return event.Records.length
  },
  {
    rethrowAfterCapture: true,
  },
)
