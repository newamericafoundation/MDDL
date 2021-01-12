# Civifile Infrastructure

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
Add `--trust ACCOUNT_ID` where ACCOUNT_ID is your CI/CD account, if you are deploying across account.

## Configuring the Pipeline

The CI/CD Stack is configured based on a JSON file that is included with a build when it is deployed from GitHub.

This file should be name `cdk.pipeline.json` and it contains information on the stacks that the pipeline should deploy to and how they are related to each other.

An example configuration can be found below.

For full reference of properties, see:

1. [CI/CD Stack Properties](src/cicd-stack.ts), for the high level structure
1. [Auth Stack Properties](src/auth-stack.ts), for the `authStackProps` sections
1. [Data Store Stack Properties](src/data-store-stack.ts), for the `dataStoreStackProps` sections
1. [City Stack Properties](src/city-stack.ts), for the `cityStacksProps` sections

### Example configuration

```json
{
  "env": {
    "account": "111111111111",
    "region": "us-west-2"
  },
  "developStageConfiguration": {
    "authStackProps": {
      "name": "NonProdAuth",
      "props": {
        "userPoolName": "DataLockerUserPool",
        "env": {
          "account": "111111111111",
          "region": "us-west-2"
        },
        "emailSender": {
          "address": "noreply@datalocker.example.com",
          "name": "Civifile"
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
      "name": "NonProdDataStore",
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
        "name": "DevCity",
        "props": {
          "env": {
            "account": "111111111111",
            "region": "us-west-2"
          },
          "authStackName": "NonProdAuth",
          "dataStoreStackName": "NonProdDataStore",
          "webAppBuildVariables": {
            "API_URL": "https://dev-city-api.datalocker.example.com",
            "AUTH_URL": "https://auth.datalocker.example.com",
            "AUTH_CLIENT_ID": "5984716e12bf48bbb7a96ada8ed7311f",
            "GOOGLE_ANALYTICS_TRACKING_ID": "UA-123456789-1",
            "SHOW_BUILD_INFO": "1"
          },
          "assetsOverridePath": "DevCityStack",
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
            "name": "Civifile"
          },
          "agencyEmailDomainsWhitelist": ["@example.com"]
        }
      }
    ]
  },
  "stagingStageConfiguration": {
    "cityStacksProps": [
      {
        "name": "MyCity1Staging",
        "props": {
          "env": {
            "account": "111111111111",
            "region": "us-west-2"
          },
          "authStackName": "NonProdAuth",
          "dataStoreStackName": "NonProdDataStore",
          "webAppBuildVariables": {
            "API_URL": "https://my-city1-api.datalocker.example.com",
            "AUTH_URL": "https://auth.datalocker.example.com",
            "AUTH_CLIENT_ID": "5984716e12bf48bbb7a96ada8ed7311f",
            "GOOGLE_ANALYTICS_TRACKING_ID": "UA-123456789-1"
          },
          "assetsOverridePath": "MyCity1",
          "apiDomainConfig": {
            "certificateArn": "arn:aws:acm:us-west-2:111111111111:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
            "domain": "my-city1-api.datalocker.example.com"
          },
          "webAppDomainConfig": {
            "certificateArn": "arn:aws:acm:us-east-1:111111111111:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
            "domain": "my-city1.datalocker.example.com"
          },
          "hostedZoneAttributes": {
            "hostedZoneId": "AAAAAAAAAAAAAAA",
            "zoneName": "datalocker.example.com"
          },
          "emailSender": {
            "address": "noreply@datalocker.example.com",
            "name": "Civifile"
          },
          "agencyEmailDomainsWhitelist": ["@mycity1.gov"]
        }
      },
      {
        "name": "MyCity2Staging",
        "props": {
          "env": {
            "account": "111111111111",
            "region": "us-west-2"
          },
          "authStackName": "NonProdAuth",
          "dataStoreStackName": "NonProdDataStore",
          "webAppBuildVariables": {
            "API_URL": "https://my-city2-api.datalocker.example.com",
            "AUTH_URL": "https://auth.datalocker.example.com",
            "AUTH_CLIENT_ID": "5984716e12bf48bbb7a96ada8ed7311f",
            "GOOGLE_ANALYTICS_TRACKING_ID": "UA-123456789-1"
          },
          "assetsOverridePath": "MyCity2",
          "apiDomainConfig": {
            "certificateArn": "arn:aws:acm:us-west-2:111111111111:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
            "domain": "my-city2-api.datalocker.example.com"
          },
          "webAppDomainConfig": {
            "certificateArn": "arn:aws:acm:us-east-1:111111111111:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
            "domain": "my-city2.datalocker.example.com"
          },
          "hostedZoneAttributes": {
            "hostedZoneId": "AAAAAAAAAAAAAAA",
            "zoneName": "datalocker.example.com"
          },
          "emailSender": {
            "address": "noreply@datalocker.example.com",
            "name": "Civifile"
          },
          "agencyEmailDomainsWhitelist": ["@mycity2.gov"]
        }
      }
    ]
  },
  "prodStageConfiguration": {
    "authStackProps": {
      "name": "ProdAuth",
      "props": {
        "userPoolName": "DataLockerUserPool",
        "env": {
          "account": "222222222222",
          "region": "us-west-2"
        },
        "emailSender": {
          "address": "noreply@datalocker.example.com",
          "name": "Civifile"
        },
        "customDomain": {
          "certificateArn": "arn:aws:acm:us-east-1:222222222222:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
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
          "account": "222222222222",
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
        "name": "MyCity1Prod",
        "props": {
          "env": {
            "account": "222222222222",
            "region": "us-west-2"
          },
          "authStackName": "ProdAuth",
          "dataStoreStackName": "ProdDataStore",
          "webAppBuildVariables": {
            "API_URL": "https://my-city1-api.datalocker.prod.com",
            "AUTH_URL": "https://auth.datalocker.prod.com",
            "AUTH_CLIENT_ID": "5984716e12bf48bbb7a96ada8ed7311f",
            "GOOGLE_ANALYTICS_TRACKING_ID": "UA-123456789-1"
          },
          "assetsOverridePath": "MyCity1",
          "apiDomainConfig": {
            "certificateArn": "arn:aws:acm:us-west-2:222222222222:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
            "domain": "my-city1-api.datalocker.prod.com"
          },
          "webAppDomainConfig": {
            "certificateArn": "arn:aws:acm:us-east-1:222222222222:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
            "domain": "my-city1.datalocker.prod.com"
          },
          "hostedZoneAttributes": {
            "hostedZoneId": "AAAAAAAAAAAAAAA",
            "zoneName": "datalocker.prod.com"
          },
          "emailSender": {
            "address": "noreply@datalocker.prod.com",
            "name": "Civifile"
          },
          "agencyEmailDomainsWhitelist": ["@mycity1.gov"]
        }
      },
      {
        "name": "MyCity2Prod",
        "props": {
          "env": {
            "account": "222222222222",
            "region": "us-west-2"
          },
          "authStackName": "ProdAuth",
          "dataStoreStackName": "ProdDataStore",
          "webAppBuildVariables": {
            "API_URL": "https://my-city2-api.datalocker.prod.com",
            "AUTH_URL": "https://auth.datalocker.prod.com",
            "AUTH_CLIENT_ID": "5984716e12bf48bbb7a96ada8ed7311f",
            "GOOGLE_ANALYTICS_TRACKING_ID": "UA-123456789-1"
          },
          "assetsOverridePath": "MyCity2",
          "apiDomainConfig": {
            "certificateArn": "arn:aws:acm:us-west-2:222222222222:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
            "domain": "my-city2-api.datalocker.prod.com"
          },
          "webAppDomainConfig": {
            "certificateArn": "arn:aws:acm:us-east-1:222222222222:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
            "domain": "my-city2.datalocker.prod.com"
          },
          "hostedZoneAttributes": {
            "hostedZoneId": "AAAAAAAAAAAAAAA",
            "zoneName": "datalocker.prod.com"
          },
          "emailSender": {
            "address": "noreply@datalocker.prod.com",
            "name": "Civifile"
          },
          "agencyEmailDomainsWhitelist": ["@mycity2.gov"]
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

### Initial CI/CD Deployment

You'll need to do an initial deployment of the CI/CD stack with

```bash
yarn infra cdk deploy CiCd -e
```

This will set up the pipeline and create necessary other resources.

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

## (Optional) Upload static resources and assets for different city stacks

If you have static resources (in the frontend/static directory) or assets (frontend/assets directory) that are different per city stack and not included in the code base, after the above deployment you'll be able to upload these to the created 'Static Assets Bucket' with the prefix defined by `assetsOverridePath` for the specific city's stack. This will perform an S3 sync with the 'static' and 'assets' paths only
For example, from the above configuration, `images/city-logo.svg` for `MyCity2` should be uploaded to the `MyCity2Stack/static/images/city-logo.svg` key. This will then be set as the logo for the `MyCity2` build.
