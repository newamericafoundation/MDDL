import { UserDelegatedAccessList } from 'api-client'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import {
  requirePermissionToUser,
  UserPermission,
} from '@/services/users/authorization'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'
import { getUsersById, User } from '@/models/user'
import { getAccountDelegatesForUser } from '@/models/accountDelegate'
import { toUserDelegatedAccess } from '@/services/accountDelegates'

connectDatabase()
type Request = APIGatewayRequest & { ownerId: string; user: User }

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
  requirePermissionToUser(UserPermission.ListAccountDelegates),
  async (request: APIGatewayRequest): Promise<UserDelegatedAccessList> => {
    const { userId, user } = request as Request
    const results = await getAccountDelegatesForUser(userId, user.email)
    const userIds = results
      .filter((r) => r.accountId != userId)
      .map((r) => r.accountId)
    const users = await getUsersById(userIds)
    return {
      delegatedAccess: results.map((r) =>
        toUserDelegatedAccess(
          r,
          userId,
          user.email,
          users.find((u) => u.id == r.accountId),
        ),
      ),
    }
  },
)
