import { Document, getDocumentById } from '@/models/document'
import { User } from '@/models/user'
import { APIGatewayRequest, setContext } from '@/utils/middleware'
import createError from 'http-errors'
import { hasAccessToDocumentViaCollectionGrant } from '@/services/documents'
import {
  hasDelegatedAccessToUserAccount,
  requireUserData,
} from '@/services/users'

export enum DocumentPermission {
  GetDocument = 'get:document',
  WriteDocument = 'write:document',
  DeleteDocument = 'delete:document',
}

const getPermissionsToDocument = async (
  document: Document,
  user: User,
): Promise<DocumentPermission[]> => {
  if (document.ownerId === user.id) {
    // check if owner
    return Object.values(DocumentPermission)
  }

  if (
    user.email &&
    (await hasDelegatedAccessToUserAccount(user.email, document.ownerId))
  ) {
    // check for delegated access
    return [DocumentPermission.GetDocument, DocumentPermission.WriteDocument]
  }

  if (
    user.email &&
    (await hasAccessToDocumentViaCollectionGrant(document.id, user.email))
  ) {
    // check if in a shared collection to this individual
    return [DocumentPermission.GetDocument]
  }

  // can't find any permissions
  return []
}

export const requirePermissionToDocument = (
  permission: DocumentPermission,
) => async (request: APIGatewayRequest): Promise<APIGatewayRequest> => {
  // resolve context data for determining permissions
  const { documentId, document: passedDocument, user: passedUser } = request
  const user = passedUser || (await requireUserData(request))
  const document = passedDocument || (await getDocumentById(documentId))
  if (!document) {
    throw new createError.NotFound('document not found')
  }
  await setContext('user', () => user)(request)
  await setContext('document', () => document)(request)

  // resolve permissions
  const permissions = await getPermissionsToDocument(document, user)
  await setContext('documentPermissions', () => permissions)(request)

  // determine access to permissions
  if (permissions.includes(permission)) {
    return request
  }
  throw new createError.NotFound('document not found')
}
