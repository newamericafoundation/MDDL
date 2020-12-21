import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { AnySchema, ValidationError } from 'joi'
import createError from 'http-errors'
import { logger } from './logging'

interface ValidationResult<T> {
  error?: ValidationError
  errors?: ValidationError
  warning?: ValidationError
  value: T
}

export type APIGatewayProxyEventV2WithBody<
  T = any,
  E extends APIGatewayProxyEventV2 = APIGatewayProxyEventV2
> = Omit<E, 'body'> & { body: T }

export const parseAndValidate = <T>(
  body: string,
  schema: AnySchema,
): ValidationResult<T> => {
  try {
    return validate<T>(JSON.parse(body), schema)
  } catch (err) {
    if (!(err instanceof SyntaxError)) {
      // ignore logging for json.parse failures
      logger.error(err)
    }
    throw new createError.BadRequest(
      `validation error: the body could not be read`,
    )
  }
}

export const validate = <T>(
  body: T,
  schema: AnySchema,
): ValidationResult<T> => {
  const result = schema.validate(body, {
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
