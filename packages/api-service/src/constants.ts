import {
  FileContentTypeEnum,
  FileDownloadDispositionTypeEnum,
} from 'api-client'

const enumToMap = <T>(source: Record<string, T>) => {
  return new Map(Object.entries(source))
}

export const FileContentTypeMap = enumToMap(FileContentTypeEnum)

export const FileDownloadDispositionTypeMap = enumToMap(
  FileDownloadDispositionTypeEnum,
)

export const MaxFilesPerDocument = 10

export const MaxDocumentsPerUser = 100

export const MaxFileSize = 10000000

export const MaxIndividualEmailAddressesPerCollection = 10
