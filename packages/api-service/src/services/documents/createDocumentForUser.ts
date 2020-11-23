import { Document as DocumentContract, DocumentCreate } from 'api-client'
import {
  createDocument,
  CreateDocumentInput,
  CreateDocumentFileInput,
  countDocumentsByOwnerId,
} from '@/models/document'
import { requirePathParameter } from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { createDocumentSchema } from './validation'
import { createFilePath } from '@/utils/s3'
import { v4 as uuidv4 } from 'uuid'
import { singleDocumentResult } from '@/services/documents'
import { MaxDocumentsPerUser } from '@/constants'
import {
  APIGatewayRequestBody,
  requireValidBody,
  setContext,
} from '@/utils/middleware'
import {
  requirePermissionToUser,
  UserPermission,
} from '@/services/users/authorization'
import createError from 'http-errors'
import { DocumentPermission } from './authorization'
import { createAuthenticatedApiGatewayHandler } from '@/services/users/middleware'
import { submitDocumentCreatedEvent } from '../activity'
import { User } from '@/models/user'

connectDatabase()
type Request = {
  ownerId: string
  userId: string
  user: User
  userPermissions: UserPermission[]
} & APIGatewayRequestBody<DocumentCreate>

export const handler = createAuthenticatedApiGatewayHandler(
  setContext('ownerId', (r) => requirePathParameter(r.event, 'userId')),
  requirePermissionToUser(UserPermission.WriteDocument),
  requireValidBody<DocumentCreate>(createDocumentSchema),
  async (
    request: APIGatewayRequestBody<DocumentCreate>,
  ): Promise<DocumentContract> => {
    const {
      ownerId,
      userId,
      user,
      body,
      userPermissions,
      event,
    } = request as Request

    const documentCount = await countDocumentsByOwnerId(ownerId)
    if (documentCount >= MaxDocumentsPerUser) {
      throw new createError.BadRequest(
        `validation error: maximum document count of ${MaxDocumentsPerUser} reached`,
      )
    }

    const createdDate = new Date()
    const id = uuidv4()
    const { name, description, files } = body
    const document: CreateDocumentInput = {
      name,
      description,
      id,
      ownerId: ownerId,
      createdBy: userId,
      createdAt: createdDate,
      updatedAt: createdDate,
      updatedBy: userId,
      files: files.map(
        (f: any, index: number): CreateDocumentFileInput => {
          const fileId = uuidv4()
          return {
            ...f,
            id: fileId,
            path: createFilePath(ownerId, id, fileId),
            order: index,
            createdAt: createdDate,
            createdBy: userId,
            received: false,
          }
        },
      ),
    }

    // submit audit activity
    await submitDocumentCreatedEvent({
      ownerId,
      user,
      document: document,
      event,
    })

    const createdDocument = await createDocument(document)
    if (!createdDocument) {
      throw new createError.InternalServerError('document could not be created')
    }

    const permissions = userPermissions.includes(UserPermission.WriteUser)
      ? [
          DocumentPermission.DeleteDocument,
          DocumentPermission.WriteDocument,
          DocumentPermission.GetDocument,
        ]
      : [DocumentPermission.WriteDocument, DocumentPermission.GetDocument]
    return singleDocumentResult(createdDocument, permissions)
  },
)

export default handler
