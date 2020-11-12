import Lambda from 'aws-sdk/clients/lambda'

const lambda = new Lambda()

export const invokeFunction = async <T = any>(
  functionName: string,
  body: T,
) => {
  const response = await lambda
    .invoke(
      {
        FunctionName: functionName,
        InvocationType: 'Event',
        Payload: JSON.stringify(body),
      },
      undefined,
    )
    .promise()
  return response.StatusCode as number
}
