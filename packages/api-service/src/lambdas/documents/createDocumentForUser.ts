import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda'
import { Document as DocumentContract, DocumentCreate } from 'api-client'
import {
  createDocument,
  CreateDocumentInput,
  CreateDocumentFileInput,
  countDocumentsByOwnerId,
} from '@/models/document'
import {
  createErrorResponse,
  getPathParameter,
  getUserId,
} from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { createDocumentSchema } from './validation'
import { createFilePath } from '@/utils/s3'
import { v4 as uuidv4 } from 'uuid'
import { createSingleDocumentResult } from '@/lambdas/documents'
import { MaxDocumentsPerUser } from '@/constants'
import { parseAndValidate } from '@/utils/validation'

connectDatabase()

export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2<
  DocumentContract
>> = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2<DocumentContract>> => {
  const ownerId = getPathParameter(event, 'userId')
  const userId = getUserId(event)
  if (!ownerId) {
    return createErrorResponse('userId path parameter not found')
  }
  if (ownerId != userId) {
    return createErrorResponse('userId not found')
  }
  if (!event.body) {
    return createErrorResponse('body not supplied')
  }
  const { error, value } = parseAndValidate<DocumentCreate>(
    event.body,
    createDocumentSchema,
  )
  if (error) {
    return createErrorResponse(
      `validation error: ${error.details.map((x) => x.message).join(', ')}`,
    )
  }
  const documentCount = await countDocumentsByOwnerId(ownerId)
  if (documentCount >= MaxDocumentsPerUser) {
    return createErrorResponse(
      `validation error: maximum document count of ${MaxDocumentsPerUser} reached`,
    )
  }

  const createdDate = new Date()
  const id = uuidv4()
  const { name, description, files } = value
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

  const createdDocument = await createDocument(document)
  if (!createdDocument) {
    return createErrorResponse('document could not be created')
  }

  return await createSingleDocumentResult(createdDocument)
}

export default handler
