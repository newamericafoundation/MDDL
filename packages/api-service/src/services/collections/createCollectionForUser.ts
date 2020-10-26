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
} from '@/services/user/authorization'
import createError from 'http-errors'
import { requireUserData } from '@/services/user'
import { formatCollectionListItem } from '.'

connectDatabase()

export const handler = createApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
  setContext('userId', (r) => requireUserId(r.event)),
  setContext('user', async (r) => await requireUserData(r)),
  requirePermissionToUser(UserPermission.WriteCollection),
  requireValidBody<CollectionCreateContract>(createCollectionSchema),
  async (
    request: APIGatewayRequestBody<CollectionCreateContract>,
  ): Promise<CollectionContract> => {
    const { ownerId, userId, body } = request
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

    // return response
    return formatCollectionListItem(createdCollection)
  },
)

export default handler
