import {
  countResources,
  expect as expectCDK,
  haveResource,
  ResourcePart,
  ABSENT,
} from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import { DefaultStackSynthesizer } from '@aws-cdk/core'
import { CiCdStack } from './cicd-stack'

test.skip('Default Stack', () => {
  const app = new cdk.App()
  // WHEN
  const name = 'test-user-pool'
  const stack = new CiCdStack(app, 'MyTestAuthStack', {
    env: {
      region: 'us-west-2',
    },
    synthesizer: new DefaultStackSynthesizer(),
    stage1Configuration: {
      dataStoreStackProps: {
        name: 'DataStoreStack',
        props: {},
      },
    },
  })
  // THEN
  expectCDK(stack).to(countResources('AWS::S3::Bucket', 2))
})
