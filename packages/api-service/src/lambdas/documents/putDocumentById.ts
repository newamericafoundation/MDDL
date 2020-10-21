import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda'
import {
  documentExistsById,
  UpdateDocumentInput,
  updateDocument,
} from '@/models/document'
import {
  createErrorResponse,
  createStatusCodeResponse,
  getPathParameter,
  getUserId,
} from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { putDocumentSchema } from './validation'
import { DocumentUpdate } from 'api-client'
import { parseAndValidate } from '@/utils/validation'

connectDatabase()

export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2> = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  const documentId = getPathParameter(event, 'documentId')
  const userId = getUserId(event)
  if (!documentId) {
    return createErrorResponse('documentId path parameter not found')
  }
  if (!userId) {
    return createErrorResponse('userId not found')
  }
  if (!event.body) {
    return createErrorResponse('body not supplied')
  }
  const { error, value } = parseAndValidate<DocumentUpdate>(
    event.body,
    putDocumentSchema,
  )
  if (error) {
    return createErrorResponse(
      `validation error: ${error.details.map((x) => x.message).join(', ')}`,
    )
  }
  const documentExists = await documentExistsById(documentId, userId)
  if (!documentExists) {
    return createErrorResponse('document not found', 404)
  }

  if (!value.description && !value.name) {
    return createStatusCodeResponse(204)
  }

  const updatedDate = new Date()
  const document: UpdateDocumentInput = {
    ...value,
    updatedAt: updatedDate,
    updatedBy: userId,
  }

  const updatedDocument = await updateDocument(documentId, document)
  if (!updatedDocument) {
    return createErrorResponse('document could not be updated')
  }

  return createStatusCodeResponse(204)
}

export default handler
