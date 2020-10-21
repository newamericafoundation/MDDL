import { AnySchema, ValidationError } from 'joi'

interface ValidationResult<T> {
  error?: ValidationError
  errors?: ValidationError
  warning?: ValidationError
  value: T
}

export const parseAndValidate = <T>(
  body: string,
  schema: AnySchema,
): ValidationResult<T> => {
  const result = schema.validate(JSON.parse(body), {
    stripUnknown: true,
    abortEarly: false,
  })
  const { error, errors, warning, value } = result
  return {
    error,
    errors,
    warning,
    value: value as T,
  }
}
