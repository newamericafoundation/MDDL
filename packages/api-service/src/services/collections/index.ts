import { Collection } from '@/models/collection'
import { User } from '@/models/user'
import { CollectionListItem, SharedCollectionListItem } from 'api-client'

export const formatCollectionListItem = (
  collection: Collection,
): CollectionListItem => {
  const { id, name, createdAt } = collection
  return {
    name,
    createdDate: createdAt.toISOString(),
    id,
    links: [
      {
        href: `/collections/${id}/grants`,
        rel: 'grants',
        type: 'GET',
      },
      {
        href: `/collections/${id}/documents`,
        rel: 'documents',
        type: 'GET',
      },
    ],
  }
}
export const formatCollections = (collections: Collection[]) => ({
  collections: collections.map(formatCollectionListItem),
})

export const formatSharedCollections = (
  collections: Collection[],
  users: User[],
) => ({
  sharedCollections: collections.map(
    (collection): SharedCollectionListItem => {
      const { ownerId } = collection
      const owner = users.find((u) => u.id == ownerId)
      return {
        collection: formatCollectionListItem(collection),
        owner: {
          givenName: owner && owner.givenName ? owner.givenName : 'Unknown',
          familyName: owner && owner.familyName ? owner.familyName : 'Unknown',
        },
      }
    },
  ),
})
