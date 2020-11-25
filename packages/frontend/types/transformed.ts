import {
  SharedCollectionListItem as ClientSharedCollectionListItem,
  CollectionListItem as ClientCollectionListItem,
} from 'api-client'
import { ActivityActionTypeEnum } from 'api-client'
import messages from '../assets/js/messages'

export interface CollectionListItem
  extends Omit<ClientCollectionListItem, 'createdDate'> {
  createdDate: Date
}

export interface SharedCollectionListItem
  extends Omit<ClientSharedCollectionListItem, 'collection'> {
  collection: CollectionListItem
}

// TODO: support i8n messages beyond English; wire up delegate events
export const ActivityResourceTypeEnumMessageMap: any = new Map([
  [ActivityActionTypeEnum.COLLECTIONCREATED, messages.en.activity.shared],
  [ActivityActionTypeEnum.DOCUMENTCREATED, messages.en.activity.added],
  [ActivityActionTypeEnum.DOCUMENTACCESSED, messages.en.activity.accessed],
  [ActivityActionTypeEnum.DOCUMENTEDITED, messages.en.activity.edited],
  [ActivityActionTypeEnum.DOCUMENTDELETED, messages.en.activity.deleted],
  // [ActivityActionTypeEnum.DELEGATEDUSERINVITED, messages.en.activity.shared],
  // [ActivityActionTypeEnum.DELEGATEDUSERINVITEACCEPTED, messages.en.activity.shared],
  // [ActivityActionTypeEnum.DELEGATEDUSERINVITEREJECTED, messages.en.activity.shared],
  // [ActivityActionTypeEnum.DELEGATEDUSERDELETED, messages.en.activity.shared],
])

export const ActivityResourceTypeEnumIconMap: any = new Map([
  [ActivityActionTypeEnum.COLLECTIONCREATED, '$send'],
  [ActivityActionTypeEnum.DOCUMENTCREATED, '$plus'],
  [ActivityActionTypeEnum.DOCUMENTACCESSED, '$eye'],
  [ActivityActionTypeEnum.DOCUMENTEDITED, '$pencil'],
  [ActivityActionTypeEnum.DOCUMENTDELETED, '$deleteAlt'],

  // [ActivityActionTypeEnum.DELEGATEDUSERINVITED, messages.en.activity.shared],
  // [ActivityActionTypeEnum.DELEGATEDUSERINVITEACCEPTED, messages.en.activity.shared],
  // [ActivityActionTypeEnum.DELEGATEDUSERINVITEREJECTED, messages.en.activity.shared],
  // [ActivityActionTypeEnum.DELEGATEDUSERDELETED, messages.en.activity.shared],
])
