import { Collection, getDocumentsByCollectionId } from '@/models/collection'
import { collectionGrantExists } from '@/models/collectionGrant'
import { getFilesByDocumentIds } from '@/models/file'
import { User } from '@/models/user'
import { hashString } from '@/utils/string'
import { emailIsWhitelisted } from '@/utils/whitelist'
import {
  CollectionGrantType,
  CollectionListItem,
  Link,
  SharedCollectionListItem,
} from 'api-client'
import { submitDocumentsAccessedEvent } from '../activity'
import { userToApiOwner } from '../users'
import { CollectionPermission } from './authorization'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { Document } from '@/models/document'

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
  sharedCollections: collections
    .map((collection): SharedCollectionListItem | null => {
      const { ownerId } = collection
      const owner = users.find((u) => u.id == ownerId)
      if (!owner) {
        return null
      }
      return {
        collection: formatCollectionListItem(collection, permissions),
        owner: userToApiOwner(owner),
      }
    })
    .filter((c) => c !== null) as SharedCollectionListItem[],
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

export const submitCollectionDownloaded = async (
  collection: Collection,
  documents: Document[],
  event: APIGatewayProxyEventV2,
  user: User,
) => {
  const files = await getFilesByDocumentIds(documents.map(({ id }) => id))
  await submitDocumentsAccessedEvent({
    ownerId: collection.ownerId,
    event,
    user,
    documents: documents.map((d) => ({
      document: d,
      files: files.filter((f) => f.documentId === d.id),
    })),
  })
}

export const hasAccessToCollectionViaGrant = async (
  collectionId: string,
  userEmail: string,
) => {
  return (
    emailIsWhitelisted(userEmail) &&
    (await collectionGrantExists(
      collectionId,
      CollectionGrantType.INDIVIDUALEMAIL,
      userEmail,
    ))
  )
}
