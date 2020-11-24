import { EnvironmentVariable, requireConfiguration } from '@/config'
import { validate } from '@/utils/validation'
import { submitActivitySchema, ActivityInput } from './validation'
import createError from 'http-errors'
import { putMessage, putMessages } from '@/utils/sqs'
import { CreateDocumentInput, Document } from '@/models/document'
import { CreateCollectionInput } from '@/models/collection'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import {
  ActivityActionTypeEnum,
  ActivityResource,
  ActivityResourceChange,
  ActivityResourceTypeEnum,
  CollectionGrantType,
} from 'api-client'
import { File } from '@/models/file'
import {
  AccountDelegate,
  CreateAccountDelegateInput,
} from '@/models/accountDelegate'
import { User } from '@/models/user'

const getQueueUrl = () =>
  requireConfiguration(EnvironmentVariable.ACTIVITY_RECORD_SQS_QUEUE_URL)

const submitActivities = async (
  ownerId: string,
  activities: ActivityInput[],
) => {
  const values = activities.map((activity) => {
    const { error, value } = validate(activity, submitActivitySchema)
    if (error) {
      throw new createError.InternalServerError(
        `Error validating activity: ${error.details
          .map((x) => x.message)
          .join(', ')}`,
      )
    }
    return value
  })
  await putMessages(
    values.map((v, i) => ({
      Id: v.resource.id,
      Data: v,
      MessageDeduplicationId: `${v.requestId}-${i}`,
      MessageGroupId: ownerId,
    })),
    getQueueUrl(),
  )
}

const submitActivity = async (ownerId: string, activity: ActivityInput) => {
  const { error, value } = validate(activity, submitActivitySchema)
  if (error) {
    throw new createError.InternalServerError(
      `Error validating activity: ${error.details
        .map((x) => x.message)
        .join(', ')}`,
    )
  }
  await putMessage(value, getQueueUrl(), {
    MessageDeduplicationId: activity.requestId,
    MessageGroupId: ownerId,
  })
}

export const changesBetween = (
  oldValue: any,
  newValue: any,
): ActivityResourceChange[] => {
  return Object.keys(newValue)
    .map((key) => ({
      field: key,
      oldValue: oldValue[key] ?? null,
      newValue: newValue[key] ?? null,
    }))
    .filter((c) => c.oldValue !== c.newValue)
}

const toActivityResource = (
  resource: { id: string; name: string },
  type: ActivityResourceTypeEnum,
): ActivityResource => ({
  id: resource.id,
  name: resource.name,
  type,
})

const createActivityInput = (props: {
  user: User
  type: ActivityActionTypeEnum
  resource: { id: string; name: string }
  resourceType: ActivityResourceTypeEnum
  relatedResources?: ActivityResource[]
  changes?: ActivityResourceChange[]
  event: APIGatewayProxyEventV2
}): ActivityInput => {
  const {
    user,
    type,
    resource,
    resourceType,
    relatedResources = [],
    changes = [],
    event,
  } = props
  const { requestId, requestContext } = extractEventInformation(event)
  const activity: ActivityInput = {
    date: new Date().toISOString(),
    principal: {
      id: user.id,
      name: user.email ?? user.id,
    },
    requestId,
    requestContext,
    type,
    resource: {
      ...toActivityResource(resource, resourceType),
      changes,
    },
    relatedResources,
  }
  return activity
}

const extractEventInformation = (event: APIGatewayProxyEventV2) => {
  const { requestId, http } = event.requestContext
  const { method, path, protocol, sourceIp, userAgent } = http
  return {
    requestId,
    requestContext: {
      method,
      path,
      protocol,
      sourceIp,
      userAgent,
    },
  }
}

export const submitCollectionCreatedEvent = async (props: {
  ownerId: string
  user: User
  collection: CreateCollectionInput
  documents: Document[]
  event: APIGatewayProxyEventV2
}) => {
  const { ownerId, user, collection, documents, event } = props
  const { grants: collectionGrants } = collection
  const activity = createActivityInput({
    user,
    type: ActivityActionTypeEnum.COLLECTIONCREATED,
    resource: collection,
    resourceType: ActivityResourceTypeEnum.COLLECTION,
    relatedResources: [
      ...documents.map((r) =>
        toActivityResource(r, ActivityResourceTypeEnum.DOCUMENT),
      ),
      ...collectionGrants
        .filter(
          (cg) => cg.requirementType == CollectionGrantType.INDIVIDUALEMAIL,
        )
        .map((r) =>
          toActivityResource(
            { id: r.id, name: r.requirementValue },
            ActivityResourceTypeEnum.COLLECTIONINDIVIDUALEMAILGRANT,
          ),
        ),
    ],
    event,
  })
  return await submitActivity(ownerId, activity)
}

export const submitDocumentCreatedEvent = async (props: {
  ownerId: string
  user: User
  document: CreateDocumentInput
  event: APIGatewayProxyEventV2
}) => {
  const { ownerId, user, document, event } = props
  const { files } = document
  const activity = createActivityInput({
    user,
    type: ActivityActionTypeEnum.DOCUMENTCREATED,
    resource: document,
    resourceType: ActivityResourceTypeEnum.DOCUMENT,
    relatedResources: files.map((r) =>
      toActivityResource(r, ActivityResourceTypeEnum.DOCUMENTFILE),
    ),
    event,
  })
  return await submitActivity(ownerId, activity)
}

export const submitDocumentAccessedEvent = async (props: {
  ownerId: string
  user: User
  document: Document
  files: File[]
  event: APIGatewayProxyEventV2
}) => {
  const { ownerId, user, document, files, event } = props
  const activity = createActivityInput({
    user,
    type: ActivityActionTypeEnum.DOCUMENTACCESSED,
    resource: document,
    resourceType: ActivityResourceTypeEnum.DOCUMENT,
    relatedResources: files.map((r) =>
      toActivityResource(r, ActivityResourceTypeEnum.DOCUMENTFILE),
    ),
    event,
  })
  return await submitActivity(ownerId, activity)
}

type DocumentAccessed = {
  document: Document
  files: File[]
}

export const submitDocumentsAccessedEvent = async (props: {
  ownerId: string
  user: User
  documents: DocumentAccessed[]
  event: APIGatewayProxyEventV2
}) => {
  const { ownerId, user, documents, event } = props
  const activities = documents.map(({ document, files }) =>
    createActivityInput({
      user,
      type: ActivityActionTypeEnum.DOCUMENTACCESSED,
      resource: document,
      resourceType: ActivityResourceTypeEnum.DOCUMENT,
      relatedResources: files.map((r) =>
        toActivityResource(r, ActivityResourceTypeEnum.DOCUMENTFILE),
      ),
      event,
    }),
  )
  return await submitActivities(ownerId, activities)
}

export const submitDocumentEditedEvent = async (props: {
  ownerId: string
  user: User
  document: Document
  changes: ActivityResourceChange[]
  event: APIGatewayProxyEventV2
}) => {
  const { ownerId, user, document, changes, event } = props
  const activity = createActivityInput({
    user,
    type: ActivityActionTypeEnum.DOCUMENTEDITED,
    resource: document,
    resourceType: ActivityResourceTypeEnum.DOCUMENT,
    changes,
    event,
  })
  return await submitActivity(ownerId, activity)
}

export const submitDocumentDeletedEvent = async (props: {
  ownerId: string
  user: User
  document: Document
  files: File[]
  event: APIGatewayProxyEventV2
}) => {
  const { ownerId, user, document, files, event } = props
  const activity = createActivityInput({
    user,
    type: ActivityActionTypeEnum.DOCUMENTDELETED,
    resource: document,
    resourceType: ActivityResourceTypeEnum.DOCUMENT,
    relatedResources: files.map((r) =>
      toActivityResource(r, ActivityResourceTypeEnum.DOCUMENTFILE),
    ),
    event,
  })
  return await submitActivity(ownerId, activity)
}

export const submitDelegatedUserInvitedEvent = async (props: {
  ownerId: string
  user: User
  accountDelegate: CreateAccountDelegateInput
  event: APIGatewayProxyEventV2
}) => {
  const { ownerId, user, accountDelegate, event } = props
  const activity = createActivityInput({
    user,
    type: ActivityActionTypeEnum.DELEGATEDUSERINVITED,
    resource: {
      id: accountDelegate.id,
      name: accountDelegate.delegateEmail,
    },
    resourceType: ActivityResourceTypeEnum.DELEGATEDUSER,
    event,
  })
  return await submitActivity(ownerId, activity)
}

export const submitDelegatedUserInviteAcceptedEvent = async (props: {
  ownerId: string
  user: User
  accountDelegate: AccountDelegate
  event: APIGatewayProxyEventV2
}) => {
  const { ownerId, user, accountDelegate, event } = props
  const activity = createActivityInput({
    user,
    type: ActivityActionTypeEnum.DELEGATEDUSERINVITEACCEPTED,
    resource: {
      id: accountDelegate.id,
      name: accountDelegate.delegateEmail,
    },
    resourceType: ActivityResourceTypeEnum.DELEGATEDUSER,
    event,
  })
  return await submitActivity(ownerId, activity)
}

export const submitDelegatedUserDeletedEvent = async (props: {
  ownerId: string
  user: User
  accountDelegate: AccountDelegate
  event: APIGatewayProxyEventV2
}) => {
  const { ownerId, user, accountDelegate, event } = props
  const activity = createActivityInput({
    user,
    type: ActivityActionTypeEnum.DELEGATEDUSERDELETED,
    resource: {
      id: accountDelegate.id,
      name: accountDelegate.delegateEmail,
    },
    resourceType: ActivityResourceTypeEnum.DELEGATEDUSER,
    event,
  })
  return await submitActivity(ownerId, activity)
}

export const submitTermsAcceptedEvent = async (props: {
  ownerId: string
  user: User
  event: APIGatewayProxyEventV2
}) => {
  const { ownerId, user, event } = props
  const activity = createActivityInput({
    user,
    type: ActivityActionTypeEnum.USERTERMSACCEPTED,
    resource: {
      id: user.id,
      name: user.email ?? user.id,
    },
    resourceType: ActivityResourceTypeEnum.USER,
    event,
  })
  return await submitActivity(ownerId, activity)
}
