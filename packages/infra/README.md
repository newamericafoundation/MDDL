# My Digital Data Locker Infrastructure

## Useful commands

- `yarn infra build` compile typescript to js
- `yarn infra test` perform the jest unit tests
- `yarn infra cdk deploy` deploy this stack to your default AWS account/region
- `yarn infra cdk diff` compare deployed stack with current state
- `yarn infra cdk synth` emits the synthesized CloudFormation template

## Bootstrapping an environment

AWS CDK requires a "bootstrap" stack that adds resources specific to AWS CDK.
This includes an S3 bucket for CloudFormation artifacts and a CloudFormation deploy role.

To bootstrap an account and region, run the following command from the root of this workspace:

```bash
yarn infra cdk bootstrap YOUR_ACCOUNT_NUMBER/YOUR_REGION --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

Update the `cloudformation-execution-policies` to more restrictive policies as needed.

## Configuring for Deployment

The Deployment Stack is configured based on a JSON file that is included with a build when it is deployed from the deployment script found below, or via the CI/CD stack of your choosing.

This file should be named `cdk.pipeline.json` and contains information on the stacks for deployment.  Place this file in the packages/infra directory.

An example configuration can be found below.

Also in that same directory you will need to add a file named `cdk.context.json` which contains the following:

```{
  "availability-zones:account={accountID}:region={region}": [
    "us-east-1a",
    "us-east-1b",
    "us-east-1c",
    "us-east-1d",
    "us-east-1e",
    "us-east-1f"
  ]
}
```

...be sure to replace the accoundID with your AWS account and the region with your AWS region.

For full reference of properties, see:

1. [Auth Stack Properties](src/auth-stack.ts), for the `authStackProps` sections
2. [Data Store Stack Properties](src/data-store-stack.ts), for the `dataStoreStackProps` sections
3. [City Stack Properties](src/city-stack.ts), for the `cityStacksProps` sections

### Example deployment script

Run this command, also found in the root level `package.json`, from the root of the project:

```
npm run deploy --city=Bullville --bucket=s3://bucket-for-webapp
```

The city param is the cityStacksProps name that you will create in the example configuration listed below.

The bucket param is the full path to the S3 bucket created after setting up the previously mentioned files and running: 

```
yarn infra cdk deploy
```

### Example configuration

```json
{
  "env": {
    "account": "111111111111",
    "region": "us-west-2"
  },
  "developStageConfiguration": {
    "authStackProps": {
      "name": "ProdAuth",
      "props": {
        "userPoolName": "DataLockerUserPool",
        "env": {
          "account": "111111111111",
          "region": "us-west-2"
        },
        "emailSender": {
          "address": "noreply@datalocker.example.com",
          "name": "My Digital Data Locker"
        },
        "customDomain": {
          "certificateArn": "arn:aws:acm:us-east-1:111111111111:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
          "domain": "auth.datalocker.example.com",
          "shouldCreateRootARecord": true,
          "hostedZoneAttributes": {
            "hostedZoneId": "AAAAAAAAAAAAAAA",
            "zoneName": "datalocker.example.com"
          }
        }
      }
    },
    "dataStoreStackProps": {
      "name": "ProdDataStore",
      "props": {
        "env": {
          "account": "111111111111",
          "region": "us-west-2"
        },
        "vpcConfig": {
          "natGatewaysCount": 1,
          "maxAzs": 2
        },
        "rdsConfig": {
          "backupRetentionDays": 7,
          "maxCapacity": 2
        }
      }
    },
    "cityStacksProps": [
      {
        "name": "Bullville",
        "props": {
          "env": {
            "account": "111111111111",
            "region": "us-west-2"
          },
          "authStackName": "ProdAuth",
          "dataStoreStackName": "ProdDataStore",
          "webAppBuildVariables": {
            "API_URL": "https://dev-city-api.datalocker.example.com",
            "AUTH_URL": "https://auth.datalocker.example.com",
            "AUTH_CLIENT_ID": "5984716e12bf48bbb7a96ada8ed7311f",
            "GOOGLE_ANALYTICS_TRACKING_ID": "UA-123456789-1",
            "SHOW_BUILD_INFO": "1"
          },
          "apiDomainConfig": {
            "certificateArn": "arn:aws:acm:us-west-2:111111111111:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
            "domain": "dev-city-api.datalocker.example.com",
            "corsAllowAnyHost": true
          },
          "webAppDomainConfig": {
            "certificateArn": "arn:aws:acm:us-east-1:111111111111:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
            "domain": "dev-city.datalocker.example.com"
          },
          "hostedZoneAttributes": {
            "hostedZoneId": "AAAAAAAAAAAAAAA",
            "zoneName": "datalocker.example.com"
          },
          "additionalCallbackUrls": ["http://localhost:3000/authorize"],
          "emailSender": {
            "address": "noreply@datalocker.example.com",
            "name": "My Digital Data Locker"
          },
          "agencyEmailDomainsWhitelist": ["@example.com"]
        }
      }
    ]
  }
}
```

## First time deployment

For first time deployment, after bootstrapping and configuring the pipeline settings, you'll need to complete the following steps:

### SES Set Up

The Auth Stack (which uses Cognito) and the application layer use SES to send notifications to users on collection sharing and sign up, etc.
You'll need a verified identity (individual email address) in SES in the region of your application and your account out of the SES sandbox.
There are two Identity Policies that need to be applied to the sending identity, which are:

1. AllowIAMAccess

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:root"
      },
      "Action": ["SES:SendEmail", "SES:SendRawEmail"],
      "Resource": "arn:aws:ses:REGION:ACCOUNT_ID:identity/email@example.com"
    }
  ]
}
```

1. AllowCognitoAccess

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cognito-idp.amazonaws.com"
      },
      "Action": ["SES:SendEmail", "SES:SendRawEmail"],
      "Resource": "arn:aws:ses:REGION:ACCOUNT_ID:identity/email@example.com"
    }
  ]
}
```

### (Optional) Create Hosted Zone and ACM Certificates

If you do not want a specific domain for your hosted API and web app, you can use the default cloudfront distribution and API Gateway URLs instead, and you can skip this step. Just don't define the `apiDomainConfig`, `webAppDomainConfig` or `hostedZoneAttributes` above.

If you do want a specific domain, at the minimum you'll need to:

1. Set up a Hosted Zone in Route 53 with the domain you are hosting at. Make sure DNS is delegated from your root domain if this is a subdomain.
2. A wildcard certificate in your application region (above, this is `us-west-2`) - can be validated by the above Hosted Zone
3. A wildcard certificate in `us-east-1` for the cloudfront hosting for the web app - can be validated by the above Hosted Zone

If you want fully qualified certificates, you'll need:

1. 1 certificate for the API in the application region for each "city stack".
1. 1 certificate for the web app hosting in `us-east-1` for each "city stack".
1. [If using the auth stack] 1 certificate for the auth hosted domain in `us-east-1`.

### Initial Environment Deployments

It can be easier for first time deployments to deploy the stacks manually to resolve any "teething" issues faster.
The suggested order for deployment is:

1. Auth Stacks
2. Data Store Stacks
3. City Stacks

#### Auth Stack Deployment notes

There is an issue with bringing up Cognito and Styling the UI in a single change set.
The `UserPoolUICustomizationAttachment` resource requires the domain to already be attached, but the `CustomDomain` resource returns before it is "active" (which can take up to 15 minutes).
To assist with this, switch the `deployUiCustomization` flag to `false` for first time deploy, and then once the Domain is "active" in Cognito, set it to `true` and redeploy.

### (Optional) Using your own KMS Key with the Data Store and City Stacks

If you do not want a KMS key provisioned by the stack, a KMS Key ARN can be provided in the stack configuration for both Data Store and City Stacks by using the `providedKmsKey` element.

The suggested key policy is as follows, please see the "Sid" elements for the purpose of each statement:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowKeyAdministration",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNTID:root"
      },
      "Action": [
        "kms:Create*",
        "kms:Describe*",
        "kms:Enable*",
        "kms:List*",
        "kms:Put*",
        "kms:Update*",
        "kms:Revoke*",
        "kms:Disable*",
        "kms:Get*",
        "kms:Delete*",
        "kms:ScheduleKeyDeletion",
        "kms:CancelKeyDeletion",
        "kms:GenerateDataKey",
        "kms:TagResource",
        "kms:UntagResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AllowKeyUseViaS3AndSQS",
      "Effect": "Allow",
      "Principal": { "AWS": "*" },
      "Action": ["kms:Decrypt", "kms:GenerateDataKey*"],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "kms:CallerAccount": "ACCOUNTID",
          "kms:ViaService": [
            "s3.REGION.amazonaws.com",
            "sqs.REGION.amazonaws.com"
          ]
        }
      }
    },
    {
      "Sid": "AllowKeyUseForLambdaEnvironmentVariables",
      "Effect": "Allow",
      "Principal": { "AWS": "*" },
      "Action": ["kms:Encrypt", "kms:Decrypt", "kms:CreateGrant"],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "kms:CallerAccount": "ACCOUNTID",
          "kms:ViaService": "lambda.REGION.amazonaws.com"
        }
      }
    },
    {
      "Sid": "AllowCloudwatchLogGroupEncryption",
      "Effect": "Allow",
      "Principal": {
        "Service": "logs.REGION.amazonaws.com"
      },
      "Action": [
        "kms:Encrypt*",
        "kms:Decrypt*",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey*",
        "kms:Describe*"
      ],
      "Resource": "*",
      "Condition": {
        "ArnEquals": {
          "kms:EncryptionContext:aws:logs:arn": "arn:aws:logs:REGION:ACCOUNTID:log-group:*"
        }
      }
    },
    {
      "Sid": "AllowKeyUseViaSecretsManager",
      "Effect": "Allow",
      "Principal": { "AWS": "*" },
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey*",
        "kms:CreateGrant",
        "kms:DescribeKey"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "kms:CallerAccount": "ACCOUNTID",
          "kms:ViaService": "secretsmanager.REGION.amazonaws.com"
        }
      }
    },
    {
      "Sid": "AllowKeyUseViaRDS",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["kms:Decrypt", "kms:GenerateDataKey*"],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "kms:ViaService": "rds.REGION.amazonaws.com",
          "kms:CallerAccount": "ACCOUNTID"
        }
      }
    }
  ]
}
```
