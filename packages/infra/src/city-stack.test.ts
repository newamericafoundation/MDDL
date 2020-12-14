import {
  countResourcesLike,
  expect as expectCDK,
  haveResource,
} from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import { AuthStack } from './auth-stack'
import { CityStack } from './city-stack'
import { DataStoreStack } from './data-store-stack'

test('Fails validation for auth stack', () => {
  const app = new cdk.App()
  // WHEN
  const authStack = new AuthStack(app, 'MyTestAuthStack', {
    userPoolName: 'MyTestAuthStack',
  })
  const dataStoreStack = new DataStoreStack(app, 'MyTestDataStoreStack', {})
  expect(() => {
    new CityStack(app, 'MyTestStack1', {
      dataStoreStack,
      emailSender: {
        address: 'myemail',
        name: 'Me',
      },
    })
  }).toThrowError(
    `jwtAuth must be provided when authStack is not provided in stack MyTestStack1`,
  )
})
test('Default Stack', () => {
  const app = new cdk.App()
  // WHEN
  const dataStoreStack = new DataStoreStack(app, 'MyTestDataStoreStack', {})
  const stack = new CityStack(app, 'MyTestStack', {
    dataStoreStack,
    jwtAuth: {
      audience: ['https://my-audience.com'],
      issuer: 'https://my-audience.com',
      userInfoEndpoint: 'https://my-auth-endpoint/oauth/userinfo',
    },
    emailSender: {
      address: 'myemail',
      name: 'Me',
    },
  })
  // THEN
  expectCDK(stack).to(haveResource('AWS::IAM::Role'))
  expectCDK(stack).to(
    countResourcesLike('AWS::Lambda::Function', 28, {
      Handler: 'index.handler',
      Runtime: 'nodejs12.x',
      MemorySize: 512,
      Timeout: 60,
    }),
  )
})
