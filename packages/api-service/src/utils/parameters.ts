import SSM from 'aws-sdk/clients/ssm'
import { captureAWSClient } from 'aws-xray-sdk'

const ssm = captureAWSClient(new SSM())

export const getParameterValue = async (path: string) => {
  const parameter = await ssm
    .getParameter(
      {
        Name: path,
      },
      undefined,
    )
    .promise()
  return parameter.Parameter?.Value
}
