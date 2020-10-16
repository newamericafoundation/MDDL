import { v4 as uuidv4 } from 'uuid'
import { connectDatabase } from '@/utils/database'
import { AgencyGrant, allAgencyGrantsExists } from './agencyGrant'
import { Agency } from './agency'

describe('AgencyGrantModel', () => {
  beforeAll(async () => {
    await connectDatabase().migrate.latest()
  })
  describe('allAgencyGrantsExists', () => {
    it('returns false if grant not found', async () => {
      expect(
        await allAgencyGrantsExists([
          {
            requirementType: 'TEST',
            requirementValue: uuidv4(),
          },
        ]),
      ).toStrictEqual(false)
    })
    it('returns true when single grant is found', async () => {
      const agencyId = uuidv4()
      const userId = uuidv4()
      const grantId = uuidv4()
      await Agency.query().insert({
        id: agencyId,
        name: 'Test Agency',
        createdBy: userId,
        createdAt: new Date(),
      })
      await AgencyGrant.query().insert({
        requirementType: 'TEST',
        requirementValue: grantId,
        agencyId,
        createdBy: userId,
        createdAt: new Date(),
      })
      expect(
        await allAgencyGrantsExists([
          {
            requirementType: 'TEST',
            requirementValue: grantId,
          },
        ]),
      ).toStrictEqual(true)
    })
    it('returns false when single grant is not found from list', async () => {
      const agencyId = uuidv4()
      const userId = uuidv4()
      const grantId = uuidv4()
      await Agency.query().insert({
        id: agencyId,
        name: 'Test Agency',
        createdBy: userId,
        createdAt: new Date(),
      })
      await AgencyGrant.query().insert({
        requirementType: 'TEST',
        requirementValue: grantId,
        agencyId,
        createdBy: userId,
        createdAt: new Date(),
      })
      expect(
        await allAgencyGrantsExists([
          {
            requirementType: 'TEST',
            requirementValue: grantId,
          },
          {
            requirementType: 'TEST',
            requirementValue: uuidv4(),
          },
        ]),
      ).toStrictEqual(false)
    })
    it('returns true when all grants in list are found', async () => {
      const agencyId = uuidv4()
      const userId = uuidv4()
      const grantId1 = uuidv4()
      const grantId2 = uuidv4()
      await Agency.query().insert({
        id: agencyId,
        name: 'Test Agency',
        createdBy: userId,
        createdAt: new Date(),
      })
      await AgencyGrant.query().insert({
        requirementType: 'TEST',
        requirementValue: grantId1,
        agencyId,
        createdBy: userId,
        createdAt: new Date(),
      })
      await AgencyGrant.query().insert({
        requirementType: 'TEST',
        requirementValue: grantId2,
        agencyId,
        createdBy: userId,
        createdAt: new Date(),
      })
      expect(
        await allAgencyGrantsExists([
          {
            requirementType: 'TEST',
            requirementValue: grantId1,
          },
          {
            requirementType: 'TEST',
            requirementValue: grantId2,
          },
        ]),
      ).toStrictEqual(true)
    })
  })
})
