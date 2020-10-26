import { getUserById, getUsersById, insertUser, updateUser, User } from './user'
import { v4 as uuidv4 } from 'uuid'
import { connectDatabase } from '@/utils/database'

describe('UserModel', () => {
  beforeAll(async () => {
    await connectDatabase().migrate.latest()
  })

  describe('getById', () => {
    it('returns null when no user found', async () => {
      const id = uuidv4()
      expect(await getUserById(id)).toStrictEqual(undefined)
    })
    it('returns a user when there is one found', async () => {
      const id = uuidv4()
      await User.query().insert({
        id,
      })
      const results = await getUserById(id)
      expect(results).toEqual(
        expect.objectContaining({
          id,
        }),
      )
    })
  })

  describe('getUsersById', () => {
    it('returns null when no users found', async () => {
      const id = uuidv4()
      expect(await getUsersById([id])).toStrictEqual([])
    })
    it('returns found users', async () => {
      const id = uuidv4()
      await User.query().insert({
        id,
      })
      const results = await getUsersById([id])
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id,
          }),
        ]),
      )
    })
  })

  describe('insertUser', () => {
    it('will create a user', async () => {
      const data = {
        id: uuidv4(),
        givenName: 'Jane',
        familyName: 'Citizen',
      }
      const results = await insertUser(data)
      expect(results).toEqual(expect.objectContaining(data))
    })
  })

  describe('updatesUser', () => {
    it('will update a user', async () => {
      const data = {
        id: uuidv4(),
        givenName: 'Jane',
        familyName: 'Citizen',
      }
      const results = await insertUser(data)
      data.givenName = 'John'
      expect(await updateUser(data.id, data)).toEqual(
        expect.objectContaining(data),
      )
    })
  })
})
