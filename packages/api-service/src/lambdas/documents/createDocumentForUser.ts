import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda'
import {
  Document as DocumentContract,
  DocumentCreate as DocumentCreateContract,
} from '../contracts'
import {
  createDocument,
  CreateDocumentInput,
  CreateDocumentFileInput,
} from '../../models/document'
import {
  createErrorResponse,
  getPathParameter,
  getUserId,
} from '../../utils/api-gateway'
import { connectDatabase } from '../../utils/database'
import { createDocumentSchema } from './validation'
import { createFilePath } from '../../utils/s3'
import { v4 as uuidv4 } from 'uuid'
import { createSingleDocumentResult } from '.'

connectDatabase()

export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2<
  DocumentCreateContract
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
  const { error, value } = createDocumentSchema.validate(JSON.parse(event.body))
  if (error) {
    return createErrorResponse(
      `validation error: ${error.details.map((x) => x.message).join(', ')}`,
    )
  }

  const createdDate = new Date()
  const document: CreateDocumentInput = {
    ...value,
    id: uuidv4(),
    ownerId: ownerId,
    createdBy: userId,
    createdAt: createdDate,
    updatedAt: createdDate,
    updatedBy: userId,
  }
  document.files = value.files.map(
    (f: any, index: number): CreateDocumentFileInput => {
      const fileId = uuidv4()
      return {
        ...f,
        id: fileId,
        path: createFilePath(ownerId, document.id, fileId),
        order: index,
        createdAt: createdDate,
        createdBy: userId,
        received: false,
      }
    },
  )

  const createdDocument = await createDocument(document)
  if (!createdDocument) {
    return createErrorResponse('document could not be created')
  }

  return await createSingleDocumentResult(createdDocument)
}

export default handler
