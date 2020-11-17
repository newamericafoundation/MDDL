import { setContext } from '@/utils/middleware'

const authorization = jest.requireActual('@/services/documents/authorization')

export const DocumentPermission = authorization.DocumentPermission

export const requirePermissionToDocumentImpl = jest
  .fn()
  .mockImplementation(async (request) => {
    await setContext('documentPermissions', () =>
      Object.values(DocumentPermission),
    )(request)
    return request
  })

export const requirePermissionToDocument = jest.fn(
  () => requirePermissionToDocumentImpl,
)
