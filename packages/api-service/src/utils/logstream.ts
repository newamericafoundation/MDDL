import LogsClient, {
  InputLogEvent,
  OutputLogEvents,
} from 'aws-sdk/clients/cloudwatchlogs'
import { captureAWSClient } from 'aws-xray-sdk'

const logsClient = captureAWSClient(new LogsClient())

export type LogStream = {
  logGroupName: string
  logStreamName: string
}

export const createLogStream = async (
  logGroupName: string,
  logStreamName: string,
): Promise<LogStream> => {
  await logsClient
    .createLogStream(
      {
        logGroupName,
        logStreamName,
      },
      undefined,
    )
    .promise()
  return {
    logGroupName,
    logStreamName,
  }
}

export const getLogStreamNextSequenceToken = async (logStream: LogStream) => {
  const { logGroupName, logStreamName } = logStream
  const result = await logsClient
    .describeLogStreams(
      {
        logGroupName,
        logStreamNamePrefix: logStreamName,
        limit: 1,
      },
      undefined,
    )
    .promise()
  if (!result.logStreams || !result.logStreams.length) {
    await createLogStream(logGroupName, logStreamName)
    return undefined
  }
  return result.logStreams[0].uploadSequenceToken
}

export const putLogEvents = async (
  logStream: LogStream,
  logEvents: InputLogEvent[],
  sequenceToken: string | undefined,
) => {
  const { logGroupName, logStreamName } = logStream
  const result = await logsClient
    .putLogEvents(
      {
        logGroupName,
        logStreamName,
        sequenceToken,
        logEvents,
      },
      undefined,
    )
    .promise()
  return result.nextSequenceToken
}

export type GetLogEventsResponse = {
  events: OutputLogEvents | undefined
  nextBackwardToken: string | undefined
  nextForwardToken: string | undefined
}

export const getLogEvents = async (
  logStream: LogStream,
  nextToken: string | undefined,
  limit = 50,
): Promise<GetLogEventsResponse> => {
  const { logGroupName, logStreamName } = logStream
  const result = await logsClient
    .getLogEvents({ logGroupName, logStreamName, limit, nextToken }, undefined)
    .promise()
  const { events, nextBackwardToken, nextForwardToken } = result
  return {
    events,
    nextBackwardToken,
    nextForwardToken,
  }
}
