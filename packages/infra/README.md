# Data Locker Infrastructure

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
            "API_URL": "https://dev-city-api.datalocker.example.com",
            "AUTH_URL": "https://auth.datalocker.example.com",
            "AUTH_CLIENT_ID": "5984716e12bf48bbb7a96ada8ed7311f",
            "GOOGLE_ANALYTICS_TRACKING_ID": "UA-123456789-1",
            "SHOW_BUILD_INFO": "1"
          },
          "staticAssetsPath": "DevCityStack",
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
            "name": "Data Locker"
          },
          "agencyEmailDomainsWhitelist": ["@example.com"]
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
            "API_URL": "https://my-city1-api.datalocker.example.com",
            "AUTH_URL": "https://auth.datalocker.example.com",
            "AUTH_CLIENT_ID": "5984716e12bf48bbb7a96ada8ed7311f",
            "GOOGLE_ANALYTICS_TRACKING_ID": "UA-123456789-1"
          },
          "staticAssetsPath": "MyCity1Stack",
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
            "name": "Data Locker"
          },
          "agencyEmailDomainsWhitelist": ["@mycity1.gov"]
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
            "API_URL": "https://my-city2-api.datalocker.example.com",
            "AUTH_URL": "https://auth.datalocker.example.com",
            "AUTH_CLIENT_ID": "5984716e12bf48bbb7a96ada8ed7311f",
            "GOOGLE_ANALYTICS_TRACKING_ID": "UA-123456789-1"
          },
          "staticAssetsPath": "MyCity2Stack",
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
            "name": "Data Locker"
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

### (Optional) Create Hosted Zone and ACM Certificates

If you do not want a specific domain for your hosted API and web app, you can use the default cloudfront distribution and API Gateway URLs instead, and you can skip this step. Just don't define the `apiDomainConfig`, `webAppDomainConfig` or `hostedZoneAttributes` above.

If you do want a specific domain, at the minimum you'll need to:

1. Set up a Hosted Zone in Route 53 with the domain you are hosting at. Make sure DNS is delegated from your root domain if this is a subdomain.
2. A wildcard certificate in your application region (above, this is `us-west-2`) - can be validated by the above Hosted Zone
3. A wildcard certificate in `us-east-1` for the cloudfront hosting for the web app - can be validated by the above Hosted Zone

If you want fully qualified certificates, you'll need 1 certificate for the API (in the application region) and one certificate for the web app hosting (in `us-east-1`) for each "city stack".

### Initial CI/CD Deployment

You'll need to do an initial deployment of the CI/CD stack with

```bash
yarn infra cdk deploy CiCd -e
```

This will set up the pipeline and create necessary other resources.

## (Optional) Upload static resources for different city stacks

If you have static resources that are different per city stack and not included in the `frontend/static` code base, after the above deployment you'll be able to upload these to the created 'Static Assets Bucket' with the prefix defined by `staticAssetsPath` for the specific city's stack.
For example, from the above configuration, `logo.svg` for `MyCity2` should be uploaded to the `MyCity2Stack/logo.svg` key. This will then be set as the logo for the `MyCity2` build.
