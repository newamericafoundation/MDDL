import { ActivityActionTypeEnum } from 'api-client'
import messages from '@/assets/js/messages'

export interface ResourceMetadata {
  resourceId: string
  principalId: string
  date: number
}

// TODO: support i8n messages beyond English
export const ActivityResourceTypeEnumMessageMap: any = new Map([
  [ActivityActionTypeEnum.COLLECTIONCREATED, messages.en.activity.shared],
  [ActivityActionTypeEnum.DOCUMENTCREATED, messages.en.activity.added],
  [ActivityActionTypeEnum.DOCUMENTACCESSED, messages.en.activity.accessed],
  [ActivityActionTypeEnum.DOCUMENTEDITED, messages.en.activity.edited],
  [ActivityActionTypeEnum.DOCUMENTDELETED, messages.en.activity.deleted],
  [ActivityActionTypeEnum.DELEGATEDUSERINVITED, messages.en.activity.invited],
  [
    ActivityActionTypeEnum.DELEGATEDUSERINVITEACCEPTED,
    messages.en.activity.delegateAccepted,
  ],
  [
    ActivityActionTypeEnum.DELEGATEDUSERDELETED,
    messages.en.activity.delegateDeleted,
  ],
])

export const ActivityResourceTypeEnumIconMap: any = new Map([
  [ActivityActionTypeEnum.COLLECTIONCREATED, '$send'],
  [ActivityActionTypeEnum.DOCUMENTCREATED, '$plus'],
  [ActivityActionTypeEnum.DOCUMENTACCESSED, '$eye'],
  [ActivityActionTypeEnum.DOCUMENTEDITED, '$pencil'],
  [ActivityActionTypeEnum.DOCUMENTDELETED, '$deleteAlt'],
  [ActivityActionTypeEnum.DELEGATEDUSERINVITED, '$delegate'],
  [ActivityActionTypeEnum.DELEGATEDUSERINVITEACCEPTED, '$delegate'],
  [ActivityActionTypeEnum.DELEGATEDUSERDELETED, '$delegate'],
])
