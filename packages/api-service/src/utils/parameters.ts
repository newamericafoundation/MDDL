import SSM from 'aws-sdk/clients/ssm'
import { captureAWSClient } from 'aws-xray-sdk'
import { logger } from './logging'

const ssm = captureAWSClient(new SSM())

export const getParameterValue = async (path: string) => {
  try {
    const parameter = await ssm
      .getParameter(
        {
          Name: path,
        },
        undefined,
      )
      .promise()
    return parameter.Parameter?.Value
  } catch (err) {
    logger.error(err)
  }
  return undefined
}
