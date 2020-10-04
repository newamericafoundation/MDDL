import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda'
import {
  Document as DocumentContract,
  DocumentListItem,
  DocumentList as DocumentListContract,
} from './models'
import { getDocumentById, getDocumentsByOwnerId } from '../models/document'
import {
  createErrorResponse,
  createJsonResponse,
  getPathParameter,
  getUserId,
} from '../utils/api-gateway'
import { connectDatabase } from '../utils/database'
import {
  DOCUMENT_FORMAT_OPTIONS,
  DOCUMENT_SOURCE_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
} from '../constants'

connectDatabase()

export const getByUserId: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2<
  DocumentListContract
>> = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2<DocumentListContract>> => {
  const ownerId = getPathParameter(event, 'userId')
  const userId = getUserId(event)
  if (!ownerId) {
    return createErrorResponse('userId path parameter not found')
  }
  if (ownerId != userId) {
    return createErrorResponse('userId not found')
  }
  const foundDocuments = await getDocumentsByOwnerId(ownerId, userId)
  return createJsonResponse({
    documents: foundDocuments.map(
      (document): DocumentListItem => {
        const { id, name, type, createdAt } = document

        return {
          //createdDate: createdAt.toISOString(),
          //description: name,
          id,
          //type: type ? DOCUMENT_TYPE_OPTIONS.get(type) : undefined,
        }
      },
    ),
  })
}

export const getById: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2<
  DocumentContract
>> = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2<DocumentContract>> => {
  const documentId = getPathParameter(event, 'documentId')
  const userId = getUserId(event)
  if (!documentId) {
    return createErrorResponse('documentId path parameter not found')
  }
  if (!userId) {
    return createErrorResponse('userId not found')
  }

  const foundDocument = await getDocumentById(documentId, userId)
  if (!foundDocument) {
    return createErrorResponse('document not found', 404)
  }

  const {
    id,
    name,
    source,
    format,
    type,
    expiryDate,
    createdAt,
  } = foundDocument

  return createJsonResponse({
    createdDate: createdAt.toISOString(),
    description: name,
    id,
    expiryDate: expiryDate ? expiryDate.toISOString() : undefined,
    format: format ? DOCUMENT_FORMAT_OPTIONS.get(format) : undefined,
    source: source ? DOCUMENT_SOURCE_OPTIONS.get(source) : undefined,
    type: type ? DOCUMENT_TYPE_OPTIONS.get(type) : undefined,
  })
}
