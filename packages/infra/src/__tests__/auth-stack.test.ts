import {
  countResources,
  expect as expectCDK,
  haveResource,
  ResourcePart,
  ABSENT,
} from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import { AuthStack } from '../auth-stack'

test('Default Stack', () => {
  const app = new cdk.App()
  // WHEN
  const name = 'test-user-pool'
  const stack = new AuthStack(app, 'MyTestAuthStack', {
    userPoolName: name,
  })
  // THEN
  expectCDK(stack).to(
    haveResource('AWS::Cognito::UserPool', {
      UserPoolName: name,
      Schema: (arr: any[]) => arr.length == 6,
      UsernameConfiguration: {
        CaseSensitive: false,
      },
      EmailConfiguration: ABSENT,
      AutoVerifiedAttributes: ['email'],
    })
  )
  expectCDK(stack).to(
    haveResource(
      'AWS::Cognito::UserPool',
      {
        DeletionPolicy: 'Retain',
      },
      ResourcePart.CompleteDefinition
    )
  )
  expectCDK(stack).to(countResources('AWS::Cognito::UserPoolDomain', 0))
  expectCDK(stack).to(countResources('AWS::SNS::Topic', 3))
})

test('Stack with all options', () => {
  const app = new cdk.App()
  // WHEN
  const name = 'test-user-pool'
  const stack = new AuthStack(app, 'MyTestAuthStack', {
    userPoolName: name,
    customDomain: {
      certificateArn:
        'arn:aws:acm:us-east-1:111111111111:certificate/aaaaaa-aaaa-aaaa-aaaaa',
      domain: 'auth.example.com',
      hostedZoneAttributes: {
        hostedZoneId: '111111111',
        zoneName: 'example.com',
      },
      shouldCreateRootARecord: true,
    },
    emailSender: {
      address: 'verification@example.com',
      name: 'Verifier',
    },
    env: {
      region: 'us-east-1',
    },
  })
  // THEN
  expectCDK(stack).to(
    haveResource('AWS::Cognito::UserPool', {
      UserPoolName: name,
      Schema: (arr: any[]) => arr.length == 6,
      UsernameConfiguration: {
        CaseSensitive: false,
      },
      EmailConfiguration: {
        EmailSendingAccount: 'DEVELOPER',
        From: 'Verifier <verification@example.com>',
        SourceArn: (fn: any) => !!fn,
      },
      AutoVerifiedAttributes: ['email'],
    })
  )
  expectCDK(stack).to(
    haveResource('AWS::Cognito::UserPoolDomain', {
      Domain: 'auth.example.com',
      CustomDomainConfig: {
        CertificateArn:
          'arn:aws:acm:us-east-1:111111111111:certificate/aaaaaa-aaaa-aaaa-aaaaa',
      },
    })
  )
  expectCDK(stack).to(countResources('AWS::Route53::RecordSet', 2))
})
