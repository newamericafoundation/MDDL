import {
  countResources,
  expect as expectCDK,
  haveResource,
  ResourcePart,
} from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import { DataStoreStack } from '../data-store-stack'

test('Minimum Stack', () => {
  const app = new cdk.App()
  // WHEN
  const stack = new DataStoreStack(app, 'MyTestDataStoreStack', {
    rdsConfig: {
      backupRetentionDays: 1,
    },
    vpcConfig: {
      natGatewaysCount: 1,
      maxAzs: 1,
    },
  })
  expectCDK(stack).to(countResources('AWS::EC2::NatGateway', 1))
  expectCDK(stack).to(countResources('AWS::EC2::Subnet', 3))
})
test('Default Stack', () => {
  const app = new cdk.App()
  // WHEN
  const stack = new DataStoreStack(app, 'MyTestDataStoreStack', {
    rdsConfig: {
      backupRetentionDays: 1,
    },
  })
  // THEN
  expectCDK(stack).to(haveResource('AWS::KMS::Key'))
  expectCDK(stack).to(haveResource('AWS::EC2::VPC'))
  expectCDK(stack).to(countResources('AWS::EC2::NatGateway', 2))
  expectCDK(stack).to(countResources('AWS::EC2::Subnet', 6))
  expectCDK(stack).to(countResources('AWS::EC2::SecurityGroup', 2))
  expectCDK(stack).to(
    haveResource('AWS::RDS::DBCluster', {
      Engine: 'aurora-mysql',
      EngineMode: 'serverless',
      EngineVersion: '5.7.mysql_aurora.2.07.1',
      DBClusterParameterGroupName: 'default.aurora-mysql5.7',
      BackupRetentionPeriod: 1,
      DatabaseName: 'root',
      StorageEncrypted: true,
      DeletionProtection: true,
      DBSubnetGroupName: (v: any) => !!v,
    }),
  )
  expectCDK(stack).to(
    haveResource(
      'AWS::RDS::DBCluster',
      {
        UpdateReplacePolicy: 'Snapshot',
        DeletionPolicy: 'Snapshot',
      },
      ResourcePart.CompleteDefinition,
    ),
  )
  expectCDK(stack).to(haveResource('AWS::SecretsManager::Secret'))
})
