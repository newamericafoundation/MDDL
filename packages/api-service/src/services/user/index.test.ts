import { getUserById, insertUser, updateUser, User } from '@/models/user'
import { getUserInfo } from '@/utils/oauth'
import { toMockedFunction } from '@/utils/test'
import { getUserData } from './index'

jest.mock('@/utils/oauth')
jest.mock('@/models/user')

describe('getUserData', () => {
  const userId = 'myUserId'
  const token = 'myToken'
  const issuedAt = '1603344236'
  const janeCitizenData = {
    id: userId,
    givenName: 'Jane',
    familyName: 'Citizen',
    email: 'jcitizen@example.com',
  }

  beforeEach(() => {
    toMockedFunction(getUserInfo).mockClear()
    toMockedFunction(insertUser).mockClear()
    toMockedFunction(updateUser).mockClear()
  })

  it('uses DB value when up to date', async () => {
    const data = { ...janeCitizenData, syncTimestamp: issuedAt }
    toMockedFunction(getUserById).mockImplementationOnce(async () =>
      User.fromDatabaseJson(data),
    )
    expect(await getUserData(userId, token, issuedAt)).toEqual(
      expect.objectContaining(data),
    )
    expect(toMockedFunction(getUserInfo)).not.toHaveBeenCalled()
    expect(toMockedFunction(insertUser)).not.toHaveBeenCalled()
    expect(toMockedFunction(updateUser)).not.toHaveBeenCalled()
  })
  it('inserts user when not existing', async () => {
    const data = { ...janeCitizenData, syncTimestamp: issuedAt }
    toMockedFunction(getUserById).mockImplementationOnce(async () => null)
    toMockedFunction(insertUser).mockImplementationOnce(async () =>
      User.fromDatabaseJson(data),
    )
    toMockedFunction(getUserInfo).mockImplementationOnce(async () => ({
      sub: userId,
      email_verified: 'true',
      given_name: janeCitizenData.givenName,
      family_name: janeCitizenData.familyName,
      email: janeCitizenData.email,
      username: userId,
    }))
    expect(await getUserData(userId, token, issuedAt)).toEqual(
      expect.objectContaining(data),
    )
    expect(toMockedFunction(getUserInfo)).toHaveBeenCalled()
    expect(toMockedFunction(insertUser)).toHaveBeenCalled()
    expect(toMockedFunction(updateUser)).not.toHaveBeenCalled()
  })
  it('updates user when out of date', async () => {
    const data = { ...janeCitizenData, syncTimestamp: '1603343236' }
    toMockedFunction(getUserById).mockImplementationOnce(async () =>
      User.fromDatabaseJson(data),
    )
    toMockedFunction(updateUser).mockImplementationOnce(async () =>
      User.fromDatabaseJson(data),
    )
    toMockedFunction(getUserInfo).mockImplementationOnce(async () => ({
      sub: userId,
      email_verified: 'true',
      given_name: janeCitizenData.givenName,
      family_name: janeCitizenData.familyName,
      email: janeCitizenData.email,
      username: userId,
    }))
    expect(await getUserData(userId, token, issuedAt)).toEqual(
      expect.objectContaining(data),
    )
    expect(toMockedFunction(getUserInfo)).toHaveBeenCalled()
    expect(toMockedFunction(insertUser)).not.toHaveBeenCalled()
    expect(toMockedFunction(updateUser)).toHaveBeenCalled()
  })
})
