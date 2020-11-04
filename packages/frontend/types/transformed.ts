import {
  SharedCollectionListItem as ClientSharedCollectionListItem,
  CollectionListItem as ClientCollectionListItem,
} from 'api-client'

export interface CollectionListItem
  extends Omit<ClientCollectionListItem, 'createdDate'> {
  createdDate: Date
}

export interface SharedCollectionListItem
  extends Omit<ClientSharedCollectionListItem, 'collection'> {
  collection: CollectionListItem
}
