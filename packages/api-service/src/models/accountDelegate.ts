import { PartialModelObject } from 'objection'
import BaseModel from './baseModel'

export class AccountDelegate extends BaseModel {
  public id: string
  public accountId: string
  public delegateEmail: string
  public status: string
  public inviteValidUntil: Date

  public createdBy: string
  public createdAt: Date

  public updatedBy: string
  public updatedAt: Date

  static get tableName() {
    return 'account_delegates'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'string', maxLength: 40 },
        accountId: { type: 'string', maxLength: 40 },
        delegateEmail: { type: 'string', maxLength: 255 },
        status: { type: 'string', maxLength: 255 },
        inviteValidUntil: { type: 'date-time' },
        createdBy: { type: 'string', minLength: 1, maxLength: 255 },
        createdAt: { type: 'date-time' },
        updatedBy: { type: 'string', minLength: 1, maxLength: 255 },
        updatedAt: { type: 'date-time' },
      },
    }
  }
}

export interface CreateAccountDelegateInput {
  id: string
  accountId: string
  delegateEmail: string
  status: string
  inviteValidUntil: Date
  userId: string
}

export const createAccountDelegate = async (
  input: CreateAccountDelegateInput,
) => {
  const {
    id,
    accountId,
    delegateEmail,
    status,
    inviteValidUntil,
    userId,
  } = input
  const createdDate = new Date()
  const payload = {
    id,
    accountId,
    delegateEmail,
    status,
    inviteValidUntil,
    createdBy: userId,
    createdAt: createdDate,
    updatedBy: userId,
    updatedAt: createdDate,
  }
  return await AccountDelegate.query().insertAndFetch(payload)
}

export const getAccountDelegatesForUser = async (
  accountId: string,
  delegateEmail?: string,
) => {
  const query = AccountDelegate.query().where({ accountId })
  if (delegateEmail) {
    query.orWhere({ delegateEmail })
  }
  return await query.orderBy('createdAt')
}

export const getAccountDelegateById = async (id: string) =>
  await AccountDelegate.query().where({ id }).first()

export const countAccountDelegates = async (accountId: string) => {
  const results = await AccountDelegate.query()
    .count({ count: 'id' })
    .where({ accountId })
  return ((results[0] as unknown) as { count: number }).count
}

export const deleteAccountDelegate = async (id: string) =>
  await AccountDelegate.query().deleteById(id)

export const findAccountDelegateForAccountByEmail = async (
  accountId: string,
  delegateEmail: string,
) => await AccountDelegate.query().where({ accountId, delegateEmail }).first()

export const updateAccountDelegate = async (
  id: string,
  userId: string,
  data: PartialModelObject<AccountDelegate>,
) =>
  await AccountDelegate.query().patchAndFetchById(id, {
    ...data,
    updatedBy: userId,
    updatedAt: new Date(),
  })
