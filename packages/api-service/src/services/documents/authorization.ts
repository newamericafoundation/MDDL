import { documentExistsById } from '@/models/document'
import { APIGatewayRequest } from '@/utils/middleware'
import createError from 'http-errors'

export enum DocumentPermission {
  GetDocument = 'get:document',
  WriteDocument = 'write:document',
  DeleteDocument = 'delete:document',
}

const getPermissionsToDocument = async (
  documentId: string,
  userId: string,
): Promise<DocumentPermission[]> => {
  const isDocumentOwner = await documentExistsById(documentId, userId)
  if (isDocumentOwner) {
    return Object.values(DocumentPermission)
  }
  // TODO check other forms of access here, e.g delegated, part of collection, etc
  return []
}

export const requirePermissionToDocument = (
  permission: DocumentPermission,
) => async (request: APIGatewayRequest): Promise<APIGatewayRequest> => {
  const { documentId, userId } = request
  const permissions = await getPermissionsToDocument(documentId, userId)
  if (permissions.includes(permission)) {
    return request
  }
  throw new createError.NotFound('document not found')
}
