import { Activity, ActivityList } from 'api-client'
import {
  getQueryStringParameter,
  requirePathParameter,
} from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import {
  requirePermissionToUser,
  UserPermission,
} from '@/services/users/authorization'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'
import { User } from '@/models/user'
import { getLogEvents, GetLogEventsResponse } from '@/utils/logstream'
import { EnvironmentVariable, requireConfiguration } from '@/config'
import { hasValue } from '@/utils/array'
import { parseAndValidate } from '@/utils/validation'
import { submitActivitySchema } from './validation'
import { logger } from '@/utils/logging'

connectDatabase()
type Request = APIGatewayRequest & {
  ownerId: string
  nextToken: string | undefined
  user: User
}
const logGroupName = requireConfiguration(
  EnvironmentVariable.ACTIVITY_CLOUDWATCH_LOG_GROUP,
)

type ActivityOutput = Activity & {
  requestContext?: { [index: string]: string | number }
}

const logEventToActivity = (message: string): Activity | null => {
  const { error, value } = parseAndValidate<ActivityOutput>(
    message,
    submitActivitySchema,
  )
  if (error) {
    return null
  }
  delete value.requestContext
  return value
}

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
  setContext('nextToken', (r) => getQueryStringParameter(r.event, 'nextToken')),
  requirePermissionToUser(UserPermission.ListActivity),
  async (request: APIGatewayRequest): Promise<ActivityList> => {
    const { ownerId, nextToken } = request as Request
    const logStream = {
      logGroupName,
      logStreamName: ownerId,
    }

    // set up default result if log stream does not exist yet
    let logEvents: GetLogEventsResponse = {
      events: [],
      nextBackwardToken: undefined,
      nextForwardToken: undefined,
    }
    try {
      logEvents = await getLogEvents(logStream, nextToken)
    } catch (err) {
      logger.error(err, logStream)
    }

    const events = logEvents.events
      ? logEvents.events.map((e) => e.message as string).filter(hasValue)
      : []
    const activity = events.map(logEventToActivity).filter(hasValue).reverse()
    return {
      activity,
      nextToken:
        logEvents.nextBackwardToken && logEvents.nextBackwardToken !== nextToken
          ? logEvents.nextBackwardToken
          : null,
    }
  },
)
