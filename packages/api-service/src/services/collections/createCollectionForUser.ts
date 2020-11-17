import {
  Collection as CollectionContract,
  CollectionCreate as CollectionCreateContract,
  CollectionGrantType,
} from 'api-client'
import { requirePathParameter, requireUserId } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { createCollectionSchema } from './validation'
import { v4 as uuidv4 } from 'uuid'
import { createCollection, CreateCollectionInput } from '@/models/collection'
import { allDocumentsExistById } from '@/models/document'
import {
  setContext,
  APIGatewayRequestBody,
  createApiGatewayHandler,
  requireValidBody,
} from '@/utils/middleware'
import {
  requirePermissionToUser,
  UserPermission,
} from '@/services/users/authorization'
import createError from 'http-errors'
import { requireUserData } from '@/services/users'
import { formatCollectionListItem } from '.'
import { CollectionPermission } from './authorization'
import { sendSharedCollectionNotification } from '../emails/sendSharedCollectionNotification'
import { EnvironmentVariable, requireConfiguration } from '@/config'

connectDatabase()

export const handler = createApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
  setContext('userId', (r) => requireUserId(r.event)),
  setContext('webAppDomain', () =>
    requireConfiguration(EnvironmentVariable.WEB_APP_DOMAIN),
  ),
  setContext('user', async (r) => await requireUserData(r)),
  requirePermissionToUser(UserPermission.WriteCollection),
  requireValidBody<CollectionCreateContract>(createCollectionSchema),
  async (
    request: APIGatewayRequestBody<CollectionCreateContract>,
  ): Promise<CollectionContract> => {
    const { ownerId, userId, user, body, webAppDomain } = request
    // prepare values
    const createdAt = new Date()
    const updatedAt = createdAt
    const createdBy = userId
    const updatedBy = userId
    const {
      name,
      documentIds,
      individualEmailAddresses,
    } = body as CollectionCreateContract

    // extended validation - check documents exist for user
    const allDocumentsBelongToUser = await allDocumentsExistById(
      documentIds,
      ownerId,
    )
    if (!allDocumentsBelongToUser) {
      throw new createError.BadRequest(`validation error: documents not found`)
    }

    // create model input
    const collection: CreateCollectionInput = {
      name: name,
      id: uuidv4(),
      ownerId,
      createdBy,
      createdAt,
      updatedAt,
      updatedBy,
      collectionDocuments: documentIds.map((documentId) => ({
        documentId,
        createdBy,
        createdAt,
      })),
      grants: individualEmailAddresses.map((email) => ({
        requirementType: CollectionGrantType.INDIVIDUALEMAIL,
        requirementValue: email,
        createdBy,
        createdAt,
      })),
    }

    // submit model
    const createdCollection = await createCollection(collection)
    if (!createdCollection) {
      throw new createError.InternalServerError(
        'collection could not be created',
      )
    }

    try {
      await sendSharedCollectionNotification({
        collection: {
          link: `https://${webAppDomain}/collections/shared`,
          name: `${user.givenName} ${user.familyName}`,
        },
        emails: individualEmailAddresses,
      })
    } catch (err) {
      console.error('An error occurred sending email: ', err)
    }

    // return response
    return formatCollectionListItem(createdCollection, [
      CollectionPermission.ListDocuments,
      CollectionPermission.ListGrants,
    ])
  },
)

export default handler
