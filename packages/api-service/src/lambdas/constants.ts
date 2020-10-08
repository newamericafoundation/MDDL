import { FileContentTypeEnum } from './contracts'

const enumToMap = <T>(source: Record<string, T>) => {
  return new Map(Object.entries(source))
}

export const FILE_CONTENT_TYPE = enumToMap(FileContentTypeEnum)
