import {
  DocumentFormatEnum,
  DocumentSourceEnum,
  DocumentTypeEnum,
} from './apis/models'

const enumToMap = <T>(source: Record<string, T>) => {
  return new Map(Object.entries(source).map(([key]) => [key, source[key]]))
}

export const DOCUMENT_FORMAT_OPTIONS = enumToMap(DocumentFormatEnum)
export const DOCUMENT_SOURCE_OPTIONS = enumToMap(DocumentSourceEnum)
export const DOCUMENT_TYPE_OPTIONS = enumToMap(DocumentTypeEnum)
