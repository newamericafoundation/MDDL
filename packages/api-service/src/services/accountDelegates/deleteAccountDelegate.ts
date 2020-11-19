import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
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
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'

connectDatabase()

type Request = APIGatewayRequest & {
  userId: string
  accountDelegateId: string
  accountDelegate: AccountDelegate
}

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('accountDelegateId', (r) =>
    requirePathParameter(r.event, 'delegateId'),
  ),
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
