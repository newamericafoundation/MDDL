export const { File } = jest.requireActual('../file')

export const getFileByIdAndDocumentId = jest.fn()
export const getFilesByDocumentId = jest.fn()
export const getFilesByDocumentIds = jest.fn(async (documentIds: string[]) => {
  return documentIds.map((dId) =>
    File.fromDatabaseJson({
      id: 'file-' + dId,
      documentId: dId,
      name: 'file-' + dId,
    }),
  )
})
