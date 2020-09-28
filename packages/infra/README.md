# Data Locker Infrastructure

## Useful commands

- `yarn build` compile typescript to js
- `yarn watch` watch for changes and compile
- `yarn test` perform the jest unit tests
- `yarn cdk deploy` deploy this stack to your default AWS account/region
- `yarn cdk diff` compare deployed stack with current state
- `yarn cdk synth` emits the synthesized CloudFormation template

## Bootstrapping an environment

AWS CDK requires a "bootstrap" stack that adds resources specific to AWS CDK.
This includes an S3 bucket for CloudFormation artifacts and a CloudFormation deploy role.

To bootstrap an account and region, run the following command from the root of this workspace:

```bash
yarn infra cdk bootstrap YOUR_ACCOUNT_NUMBER/YOUR_REGION --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

Update the `cloudformation-execution-policies` to more restrictive policies as needed.

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
  "stage1Configuration": {
    "authStackProps": {
      "name": "AuthStack",
      "props": {
        "userPoolName": "DataLockerUserPool",
        "env": {
          "account": "111111111111",
          "region": "us-west-2"
        },
        "emailSender": {
          "address": "noreply@datalocker.example.com",
          "name": "Data Locker"
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
      "name": "DataStoreStack",
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
        "name": "DevCityStack",
        "props": {
          "env": {
            "account": "111111111111",
            "region": "us-west-2"
          },
          "expectsAuthStack": true,
          "webAppBuildVariables": {
            "API_URL": "http://dev-city-api.datalocker.example.com/v1"
          },
          "apiDomainConfig": {
            "certificateArn": "arn:aws:acm:us-west-2:111111111111:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
            "domain": "dev-city-api.datalocker.example.com"
          },
          "webAppDomainConfig": {
            "certificateArn": "arn:aws:acm:us-east-1:111111111111:certificate/cccccccc-cccc-cccc-cccc-cccccccccccc",
            "domain": "dev-city.datalocker.example.com"
          },
          "hostedZoneAttributes": {
            "hostedZoneId": "AAAAAAAAAAAAAAA",
            "zoneName": "datalocker.example.com"
          }
        }
      }
    ]
  },
  "stage2Configuration": {
    "cityStacksProps": [
      {
        "name": "MyCity1Stack",
        "props": {
          "env": {
            "account": "111111111111",
            "region": "us-west-2"
          },
          "expectsAuthStack": true,
          "webAppBuildVariables": {
            "API_URL": "http://my-city1-api.datalocker.example.com/v1"
          },
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
          }
        }
      },
      {
        "name": "MyCity2Stack",
        "props": {
          "env": {
            "account": "111111111111",
            "region": "us-west-2"
          },
          "expectsAuthStack": true,
          "webAppBuildVariables": {
            "API_URL": "http://my-city2-api.datalocker.example.com/v1"
          },
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
          }
        }
      }
    ]
  }
}
```
