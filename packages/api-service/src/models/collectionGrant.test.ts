import { Collection as CollectionModel } from './collection'
import { v4 as uuidv4 } from 'uuid'
import { connectDatabase } from '@/utils/database'
import { CollectionGrantType } from 'api-client'
import {
  CollectionGrant as CollectionGrantModel,
  collectionGrantExists,
  collectionGrantExistsToOwner,
} from './collectionGrant'

describe('CollectionGrantModel', () => {
  beforeAll(async () => {
    await connectDatabase().migrate.latest()
  })
  describe('collectionGrantExists', () => {
    it('returns false when no collections found', async () => {
      const id = uuidv4()
      expect(
        await collectionGrantExists(
          id,
          CollectionGrantType.INDIVIDUALEMAIL,
          id,
        ),
      ).toStrictEqual(false)
    })
    it('returns true when one found', async () => {
      const id = uuidv4()
      const userId = uuidv4()
      const collection = await CollectionModel.query().insert({
        id,
        name: userId,
        ownerId: userId,
        createdBy: userId,
        createdAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      await CollectionGrantModel.query().insert({
        collectionId: collection.id,
        requirementType: CollectionGrantType.INDIVIDUALEMAIL,
        requirementValue: userId,
        createdBy: userId,
        createdAt: new Date(),
        ownerId: userId,
      })
      expect(
        await collectionGrantExists(
          id,
          CollectionGrantType.INDIVIDUALEMAIL,
          userId,
        ),
      ).toStrictEqual(true)
    })
  })
  describe('collectionGrantExistsToOwner', () => {
    it('returns false when no grant found', async () => {
      const id = uuidv4()
      const accessingUserEmail = uuidv4()
      expect(
        await collectionGrantExistsToOwner(
          id,
          CollectionGrantType.INDIVIDUALEMAIL,
          accessingUserEmail,
        ),
      ).toStrictEqual(false)
    })
    it('returns true when one found', async () => {
      const id = uuidv4()
      const userId = uuidv4()
      const accessingUserEmail = uuidv4()
      const collection = await CollectionModel.query().insert({
        id,
        name: userId,
        ownerId: userId,
        createdBy: userId,
        createdAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      await CollectionGrantModel.query().insert({
        collectionId: collection.id,
        requirementType: CollectionGrantType.INDIVIDUALEMAIL,
        requirementValue: accessingUserEmail,
        createdBy: userId,
        createdAt: new Date(),
        ownerId: userId,
      })
      expect(
        await collectionGrantExistsToOwner(
          userId,
          CollectionGrantType.INDIVIDUALEMAIL,
          accessingUserEmail,
        ),
      ).toStrictEqual(true)
    })
  })
})
