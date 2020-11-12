import { Collection, getDocumentsByCollectionId } from '@/models/collection'
import { User } from '@/models/user'
import { hashString } from '@/utils/string'
import { CollectionListItem, Link, SharedCollectionListItem } from 'api-client'
import { CollectionPermission } from './authorization'

export const formatCollectionListItem = (
  collection: Collection,
  permissions: CollectionPermission[],
): CollectionListItem => {
  const { id, name, createdAt } = collection
  const links: Link[] = []
  if (permissions.includes(CollectionPermission.ListDocuments)) {
    links.push({
      href: `/collections/${id}/documents`,
      rel: 'documents',
      type: 'GET',
    })
  }
  if (permissions.includes(CollectionPermission.ListGrants)) {
    links.push({
      href: `/collections/${id}/grants`,
      rel: 'grants',
      type: 'GET',
    })
  }
  return {
    name,
    createdDate: createdAt.toISOString(),
    id,
    links,
  }
}
export const formatCollections = (
  collections: Collection[],
  permissions: CollectionPermission[],
) => ({
  collections: collections.map((c) => formatCollectionListItem(c, permissions)),
})

export const formatSharedCollections = (
  collections: Collection[],
  users: User[],
  permissions: CollectionPermission[],
) => ({
  sharedCollections: collections.map(
    (collection): SharedCollectionListItem => {
      const { ownerId } = collection
      const owner = users.find((u) => u.id == ownerId)
      return {
        collection: formatCollectionListItem(collection, permissions),
        owner: {
          id: ownerId,
          givenName: owner?.givenName ?? 'Unknown',
          familyName: owner?.familyName ?? 'Unknown',
        },
      }
    },
  ),
})

export const getCollectionDetails = async (collectionId: string) => {
  // read in documents
  const documents = await getDocumentsByCollectionId(collectionId)

  // create a consistent hash that can be used as the download file name
  const documentsHash = hashString(
    collectionId +
      ':' +
      documents.map((d) => d.id + d.updatedAt.toUTCString()).join(':'),
  )

  return {
    documents,
    documentsHash,
  }
}
