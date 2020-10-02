import {
  Construct,
  CustomResource,
  Duration,
  Stack,
  StackProps
} from '@aws-cdk/core'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
import path = require('path')
import { Function, IFunction, Runtime } from '@aws-cdk/aws-lambda'
import { Bucket } from '@aws-cdk/aws-s3'
import {
  OriginAccessIdentity,
  CloudFrontWebDistribution
} from '@aws-cdk/aws-cloudfront'
import { DataStoreStack } from './data-store-stack'
import { AuthStack } from './auth-stack'
import { Provider } from '@aws-cdk/custom-resources'
import { RetentionDays } from '@aws-cdk/aws-logs'
import { Secret } from '@aws-cdk/aws-secretsmanager'
import { AnyPrincipal, Policy, PolicyStatement, Role } from '@aws-cdk/aws-iam'
import { IKey, Key } from '@aws-cdk/aws-kms'
import { Certificate } from '@aws-cdk/aws-certificatemanager'
import { ViewerCertificate } from '@aws-cdk/aws-cloudfront/lib/web_distribution'
import {
  ARecord,
  HostedZone,
  RecordTarget,
  HostedZoneAttributes
} from '@aws-cdk/aws-route53'
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets'
import {
  CfnUserPoolResourceServer,
  OAuthScope,
  UserPool
} from '@aws-cdk/aws-cognito'
import { HostedDomain } from './hosted-domain'

export interface Props extends StackProps {
  /**
   * The auth stack to secure access to the application resources in this stack
   */
  authStack?: AuthStack
  /**
   * Whether or not an auth stack should be provided for this
   */
  expectsAuthStack: boolean
  /**
   * The data stack that contains resources and access to the database
   */
  dataStoreStack?: DataStoreStack
  /**
   * Key-value build parameters for the web app
   */
  webAppBuildVariables?: { [index: string]: string }
  /**
   * API domain configuration
   */
  apiDomainConfig?: HostedDomain
  /**
   * Web App domain configuration
   */
  webAppDomainConfig?: HostedDomain
  /**
   * Hosted zone attributes for adding record sets to
   */
  hostedZoneAttributes?: HostedZoneAttributes
}

const pathToLambda = (packageName: string, handlerName = 'index.ts'): string =>
  path.join(__dirname, '..', '..', packageName, 'src', handlerName)

export class CityStack extends Stack {
  public bucketNames: { [index: string]: string }
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    // initialise properties
    this.bucketNames = {}

    // read out config
    const {
      dataStoreStack,
      authStack,
      expectsAuthStack,
      apiDomainConfig,
      webAppDomainConfig,
      hostedZoneAttributes
    } = props

    // check auth stack is given if this stack expects it
    if (expectsAuthStack && !authStack) {
      throw new Error(
        'authStack must be provided when expectsAuthStack is true'
      )
    }

    // check auth stack is not given if this stack doesn't expect it
    if (!expectsAuthStack && authStack) {
      throw new Error(
        'authStack should not be provided when expectsAuthStack is false'
      )
    }

    // check data store stack is given - it is "optional" to allow for configuration
    // to be put together at runtime
    if (!dataStoreStack) {
      throw new Error('dataStoreStack must be provided')
    }

    // check the cloudfront certificate is in north virginia
    if (
      webAppDomainConfig &&
      webAppDomainConfig.certificateArn &&
      !webAppDomainConfig.certificateArn.toLowerCase().includes('us-east-1')
    ) {
      throw new Error(
        'webAppDomainConfig.certificateArn must be a certificate in us-east-1'
      )
    }

    // add hosting for the web app
    const { domain } = this.addHosting(
      'WebApp',
      webAppDomainConfig,
      hostedZoneAttributes
    )

    // add auth stack integration
    this.addAuthIntegration(domain, authStack, apiDomainConfig)

    // add a sample lambda
    new NodejsFunction(this, 'HelloWorldFunction', {
      entry: pathToLambda('hello-world-lambda'),
      runtime: Runtime.NODEJS_12_X
    })

    // add a sample lambda in a VPC
    new NodejsFunction(this, 'HelloWorldFunction2', {
      entry: pathToLambda('hello-world-lambda'),
      runtime: Runtime.NODEJS_12_X,
      vpc: dataStoreStack.vpc,
      securityGroups: [dataStoreStack.rdsAccessSecurityGroup]
    })

    // create the city key used for encryption of resources in this stack
    const { kmsKey } = this.addKmsKey()

    // create the DB and access credentials for this city
    this.addDbAndCredentials(kmsKey, dataStoreStack.createDbUserFunction)
  }

  /**
   * Add any required auth integration for the stack
   * @param redirectUrl The allowed URL for redirection for the auth integration
   * @param authStack The auth stack, if any
   * @param apiDomainConfig The API's domain configuration
   */
  private addAuthIntegration(
    redirectUrl: string,
    authStack?: AuthStack,
    apiDomainConfig?: HostedDomain
  ) {
    if (authStack) {
      // add cognito specific integration
      const userPool = UserPool.fromUserPoolId(
        this,
        'UserPool',
        authStack.userPoolId
      )
      userPool.addClient('DataLockerClient', {
        authFlows: {
          userSrp: true,
          refreshToken: true
        },
        preventUserExistenceErrors: true,
        oAuth: {
          callbackUrls: ['https://' + redirectUrl],
          scopes: [OAuthScope.PROFILE, OAuthScope.OPENID, OAuthScope.EMAIL],
          flows: {
            authorizationCodeGrant: true
          }
        }
      })

      // add the resource server
      if (apiDomainConfig) {
        new CfnUserPoolResourceServer(this, 'UserPoolResourceServer', {
          identifier: 'https://' + apiDomainConfig.domain,
          name: this.stackName,
          userPoolId: authStack.userPoolId
        })
      }
    }
  }

  /**
   * Add hosting for a web app
   * @param appName The name of the web app
   * @param hostedDomainConfig The configuration for its hosting domain (optional)
   * @param hostedZoneAttributes The hosted zone attributes (optional)
   */
  private addHosting(
    appName: string,
    hostedDomainConfig?: HostedDomain,
    hostedZoneAttributes?: HostedZoneAttributes
  ) {
    //Create Certificate
    let viewerCertificate: ViewerCertificate | undefined
    if (hostedDomainConfig) {
      const certificate = Certificate.fromCertificateArn(
        this,
        `${appName}Certificate`,
        hostedDomainConfig.certificateArn
      )
      viewerCertificate = ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: [hostedDomainConfig.domain]
      })
    }

    // Random part included for easier update if needed
    const bucketName = `${this.stackName}-${appName}-AEBE24AF`.toLowerCase()
    this.bucketNames[appName] = bucketName

    // Create App Bucket
    const bucket = new Bucket(this, `${appName}Bucket`, {
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
      },
      bucketName
    })

    // Create App Origin Access Identity
    const originAccessIdentity = new OriginAccessIdentity(
      this,
      `${appName}OriginAccessIdentity`,
      {
        comment: appName
      }
    )
    bucket.grantRead(originAccessIdentity)

    // Create App CloudFront Distribution
    const cloudFrontDistribution = new CloudFrontWebDistribution(
      this,
      `${appName}CloudFrontWebDistribution`,
      {
        defaultRootObject: 'index.html',
        errorConfigurations: [
          {
            errorCode: 403,
            responseCode: 200,
            responsePagePath: '/index.html'
          },
          {
            errorCode: 404,
            responseCode: 200,
            responsePagePath: '/index.html'
          }
        ],
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: originAccessIdentity
            },
            behaviors: [
              {
                maxTtl: Duration.minutes(5),
                minTtl: Duration.minutes(5),
                defaultTtl: Duration.minutes(5),
                pathPattern: '/index.html',
                compress: true
              },
              {
                isDefaultBehavior: true,
                compress: true
              }
            ]
          }
        ],
        viewerCertificate
      }
    )
    cloudFrontDistribution.node.addDependency(bucket, originAccessIdentity)

    // Create Domain Record
    if (hostedDomainConfig && hostedZoneAttributes) {
      const { domain } = hostedDomainConfig
      const hostedZone = HostedZone.fromHostedZoneAttributes(
        this,
        `${appName}HostedZone`,
        hostedZoneAttributes
      )
      const aliasRecord = new ARecord(this, `${appName}AliasRecord`, {
        zone: hostedZone,
        recordName: domain,
        target: RecordTarget.fromAlias(
          new CloudFrontTarget(cloudFrontDistribution)
        )
      })
      aliasRecord.node.addDependency(cloudFrontDistribution)
    }

    return {
      domain: hostedDomainConfig
        ? hostedDomainConfig.domain
        : cloudFrontDistribution.distributionDomainName
    }
  }

  /**
   * Add the KMS key for encrypting data for the City stack
   */
  private addKmsKey() {
    const kmsKey = new Key(this, 'Key', {
      description: `KMS Key for ${this.stackName} stack`,
      enableKeyRotation: true
    })

    // permissions are automatically added to the key policy
    // but there seems to be issues using the key through secrets manager
    // the below resolves this by following the direction at https://docs.aws.amazon.com/kms/latest/developerguide/services-secrets-manager.html#asm-policies
    kmsKey.addToResourcePolicy(
      new PolicyStatement({
        actions: [
          'kms:Encrypt',
          'kms:Decrypt',
          'kms:ReEncrypt*',
          'kms:GenerateDataKey*',
          'kms:CreateGrant',
          'kms:DescribeKey'
        ],
        resources: ['*'],
        principals: [new AnyPrincipal()],
        conditions: {
          StringEquals: {
            'kms:ViaService': `secretsmanager.${this.region}.amazonaws.com`,
            'kms:CallerAccount': this.account
          }
        }
      })
    )

    return {
      kmsKey
    }
  }

  /**
   * Create credentials, a new DB and DB User in the DB Server for the city to use
   * @param kmsKey The KMS Key to encrypt the secrets
   * @param exportedCreateDbUserFunction The function exported from the data stack to use to create the DB User
   */
  private addDbAndCredentials(
    kmsKey: IKey,
    exportedCreateDbUserFunction: IFunction
  ) {
    // import the function
    const createDbUserFunction = Function.fromFunctionArn(
      this,
      'CreateDbUserFunction',
      exportedCreateDbUserFunction.functionArn
    )

    // check the exported role is accessible
    if (!exportedCreateDbUserFunction.role) {
      throw new Error(
        'dataStoreStack.createDbUserFunction.role should be accessible'
      )
    }

    // import the role
    const createDbUserFunctionRole = Role.fromRoleArn(
      this,
      'CreateDbUserFunctionRole',
      exportedCreateDbUserFunction.role.roleArn
    )

    // create a custom resource provider
    const createDbUserCustomResourceProvider = new Provider(
      this,
      'CreateDbUserCustomResourceProvider',
      {
        onEventHandler: createDbUserFunction,
        logRetention: RetentionDays.ONE_DAY
      }
    )

    // create the new DB user's credentials
    const dbCredentials = new Secret(this, 'DbCredentialsSecret', {
      secretName: `${this.stackName}-rds-db-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: this.stackName.toLowerCase().replace(/[\W_]+/g, '')
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
        passwordLength: 30
      },
      encryptionKey: kmsKey
    })

    // allow the base function to access our new secret
    const secretAccessPolicy = new Policy(this, 'AllowAccessToDatabaseSecret', {
      roles: [createDbUserFunctionRole],
      statements: [
        new PolicyStatement({
          actions: ['secretsmanager:GetSecretValue'],
          resources: [dbCredentials.secretArn]
        })
      ]
    })

    // execute the custom resource to connect to the DB Server and create the new DB and User
    const createDbUser = new CustomResource(
      this,
      'CreateDbUserCustomResource',
      {
        serviceToken: createDbUserCustomResourceProvider.serviceToken,
        properties: {
          NewUserSecretId: dbCredentials.secretArn
        }
      }
    )
    createDbUser.node.addDependency(secretAccessPolicy)
  }
}
