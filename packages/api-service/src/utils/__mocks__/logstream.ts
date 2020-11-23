export const createLogStream = jest.fn(
  async (logGroupName: string, logStreamName: string) => ({
    logGroupName,
    logStreamName,
  }),
)

export const getLogStreamNextSequenceToken = jest.fn(
  async () => 'uploadSequenceToken',
)

export const putLogEvents = jest.fn(
  async (logStream, logEvents, sequenceToken: string | undefined) =>
    sequenceToken + '+1',
)

export const getLogEvents = jest.fn(
  async (logStream, nextToken: string | undefined, limit = 50) => ({
    events: [],
    nextBackwardToken: (nextToken ?? 'token') + '+1',
  }),
)
