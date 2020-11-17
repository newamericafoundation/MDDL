import { requirePathParameter, requireUserId } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import {
  APIGatewayRequest,
  createApiGatewayHandler,
  setContext,
} from '@/utils/middleware'
import createError from 'http-errors'
import {
  AccountDelegate,
  deleteAccountDelegate,
  getAccountDelegateById,
} from '@/models/accountDelegate'
import {
  AccountDelegatePermission,
  requirePermissionToAccountDelegate,
} from './authorization'
import { requireUserData } from '@/services/users'

connectDatabase()

type Request = APIGatewayRequest & {
  userId: string
  accountDelegateId: string
  accountDelegate: AccountDelegate
}

export const handler = createApiGatewayHandler(
  setContext('accountDelegateId', (r) =>
    requirePathParameter(r.event, 'delegateId'),
  ),
  setContext('userId', (r) => requireUserId(r.event)),
  setContext('user', (r) => requireUserData(r)),
  setContext('accountDelegate', (r) =>
    getAccountDelegateById(r.accountDelegateId),
  ),
  requirePermissionToAccountDelegate(
    AccountDelegatePermission.DeleteAccountDelegate,
  ),
  async (request: APIGatewayRequest): Promise<any> => {
    const { accountDelegate, userId, user } = request as Request
    const deleted = await deleteAccountDelegate(accountDelegate.id)
    if (!deleted) {
      throw new createError.InternalServerError(
        'account delegate could not be deleted',
      )
    }
  },
)
