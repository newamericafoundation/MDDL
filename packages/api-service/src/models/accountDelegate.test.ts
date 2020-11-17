import {
  createAccountDelegate,
  getAccountDelegatesForUser,
  deleteAccountDelegate,
  findAccountDelegateForAccountByEmail,
  updateAccountDelegate,
  countAccountDelegates,
  getAccountDelegateById,
} from './accountDelegate'
import { v4 as uuidv4 } from 'uuid'
import { connectDatabase } from '@/utils/database'
import { UserDelegatedAccessStatus } from 'api-client'
import { addDaysFromNow } from '@/utils/date'

describe('AccountDelegateModel', () => {
  beforeAll(async () => {
    await connectDatabase().migrate.latest()
  })

  describe('createAccountDelegate', () => {
    const accountId = uuidv4()
    const delegateEmail = uuidv4()
    it('creates a delegate', async () => {
      const id = uuidv4()
      expect(
        await createAccountDelegate({
          id,
          accountId,
          delegateEmail,
          inviteValidUntil: addDaysFromNow(14),
          status: UserDelegatedAccessStatus.INVITATIONSENT,
          userId: accountId,
        }),
      ).toEqual(
        expect.objectContaining({
          id,
          accountId,
          delegateEmail,
          status: UserDelegatedAccessStatus.INVITATIONSENT,
          createdBy: accountId,
          updatedBy: accountId,
        }),
      )
    })
  })

  describe('getAccountDelegatesForUser', () => {
    const accountId = uuidv4()
    const delegateEmail = uuidv4()
    it('returns empty on none found', async () => {
      expect(
        await getAccountDelegatesForUser(accountId, delegateEmail),
      ).toStrictEqual([])
    })
    it('finds a matching record by accountId', async () => {
      const id = uuidv4()
      await createAccountDelegate({
        id,
        accountId,
        delegateEmail: uuidv4(),
        inviteValidUntil: addDaysFromNow(14),
        status: UserDelegatedAccessStatus.INVITATIONSENT,
        userId: accountId,
      }),
        expect(
          await getAccountDelegatesForUser(accountId, delegateEmail),
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id,
            }),
          ]),
        )
    })
    it('finds a matching record by accountId with no email', async () => {
      const id = uuidv4()
      await createAccountDelegate({
        id,
        accountId: id,
        delegateEmail: uuidv4(),
        inviteValidUntil: addDaysFromNow(14),
        status: UserDelegatedAccessStatus.INVITATIONSENT,
        userId: accountId,
      }),
        expect(await getAccountDelegatesForUser(id)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id,
            }),
          ]),
        )
    })
    it('finds a matching record by delegateEmail', async () => {
      const id = uuidv4()
      await createAccountDelegate({
        id,
        accountId: uuidv4(),
        delegateEmail,
        inviteValidUntil: addDaysFromNow(14),
        status: UserDelegatedAccessStatus.INVITATIONSENT,
        userId: accountId,
      }),
        expect(
          await getAccountDelegatesForUser(accountId, delegateEmail),
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id,
            }),
          ]),
        )
    })
  })

  describe('deleteAccountDelegate', () => {
    const accountId = uuidv4()
    it('returns 0 on none found', async () => {
      const id = uuidv4()
      expect(await deleteAccountDelegate(id)).toStrictEqual(0)
    })
    it('returns 1 when record deleted', async () => {
      const id = uuidv4()
      await createAccountDelegate({
        id,
        accountId: uuidv4(),
        delegateEmail: uuidv4(),
        inviteValidUntil: addDaysFromNow(14),
        status: UserDelegatedAccessStatus.INVITATIONSENT,
        userId: accountId,
      })
      expect(await deleteAccountDelegate(id)).toStrictEqual(1)
    })
  })

  describe('findAccountDelegateForAccountByEmail', () => {
    const accountId = uuidv4()
    const delegateEmail = uuidv4()
    it('returns undefined on none found', async () => {
      expect(
        await findAccountDelegateForAccountByEmail(accountId, delegateEmail),
      ).toStrictEqual(undefined)
    })
    it('finds a matching record', async () => {
      const id = uuidv4()
      await createAccountDelegate({
        id,
        accountId,
        delegateEmail,
        inviteValidUntil: addDaysFromNow(14),
        status: UserDelegatedAccessStatus.INVITATIONSENT,
        userId: accountId,
      }),
        expect(
          await findAccountDelegateForAccountByEmail(accountId, delegateEmail),
        ).toEqual(
          expect.objectContaining({
            id,
          }),
        )
    })
  })

  describe('getAccountDelegateById', () => {
    it('returns undefined on none found', async () => {
      expect(await getAccountDelegateById(uuidv4())).toStrictEqual(undefined)
    })
    it('finds a matching record', async () => {
      const id = uuidv4()
      await createAccountDelegate({
        id,
        accountId: uuidv4(),
        delegateEmail: uuidv4(),
        inviteValidUntil: addDaysFromNow(14),
        status: UserDelegatedAccessStatus.INVITATIONSENT,
        userId: uuidv4(),
      }),
        expect(await getAccountDelegateById(id)).toEqual(
          expect.objectContaining({
            id,
          }),
        )
    })
  })

  describe('updateAccountDelegate', () => {
    const accountId = uuidv4()
    const delegateEmail = uuidv4()
    it('returns undefined on none found', async () => {
      expect(
        await updateAccountDelegate(uuidv4(), accountId, {
          status: UserDelegatedAccessStatus.ACTIVE,
        }),
      ).toStrictEqual(undefined)
    })
    it('updates the matching record', async () => {
      const id = uuidv4()
      const userId = uuidv4()
      await createAccountDelegate({
        id,
        accountId,
        delegateEmail,
        inviteValidUntil: addDaysFromNow(14),
        status: UserDelegatedAccessStatus.INVITATIONSENT,
        userId: accountId,
      }),
        expect(
          await updateAccountDelegate(id, userId, {
            status: UserDelegatedAccessStatus.ACTIVE,
          }),
        ).toEqual(
          expect.objectContaining({
            id,
            status: UserDelegatedAccessStatus.ACTIVE,
            updatedBy: userId,
          }),
        )
    })
  })

  describe('countAccountDelegates', () => {
    it('returns 0 on none found', async () => {
      expect(await countAccountDelegates(uuidv4())).toStrictEqual(0)
    })
    it('returns 1 when found', async () => {
      const accountId = uuidv4()
      await createAccountDelegate({
        id: uuidv4(),
        accountId,
        delegateEmail: uuidv4(),
        inviteValidUntil: addDaysFromNow(14),
        status: UserDelegatedAccessStatus.INVITATIONSENT,
        userId: accountId,
      })
      expect(await countAccountDelegates(accountId)).toStrictEqual(1)
    })
    it('returns 2 when found', async () => {
      const accountId = uuidv4()
      await createAccountDelegate({
        id: uuidv4(),
        accountId,
        delegateEmail: uuidv4(),
        inviteValidUntil: addDaysFromNow(14),
        status: UserDelegatedAccessStatus.INVITATIONSENT,
        userId: accountId,
      })
      await createAccountDelegate({
        id: uuidv4(),
        accountId,
        delegateEmail: uuidv4(),
        inviteValidUntil: addDaysFromNow(14),
        status: UserDelegatedAccessStatus.INVITATIONSENT,
        userId: accountId,
      })
      expect(await countAccountDelegates(accountId)).toStrictEqual(2)
    })
  })
})
