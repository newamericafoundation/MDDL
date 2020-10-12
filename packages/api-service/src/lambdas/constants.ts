import { FileContentTypeEnum } from 'api-client'

const enumToMap = <T>(source: Record<string, T>) => {
  return new Map(Object.entries(source))
}

export const FILE_CONTENT_TYPE = enumToMap(FileContentTypeEnum)
