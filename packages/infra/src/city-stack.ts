import {
  Construct,
  CustomResource,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from '@aws-cdk/core'
import path = require('path')
import {
  Function,
  LayerVersion,
  IFunction,
  ILayerVersion,
  Runtime,
  Code,
  FunctionProps,
} from '@aws-cdk/aws-lambda'
import { S3EventSource } from '@aws-cdk/aws-lambda-event-sources'
import { Bucket, IBucket, HttpMethods, EventType } from '@aws-cdk/aws-s3'
import {
  OriginAccessIdentity,
  CloudFrontWebDistribution,
} from '@aws-cdk/aws-cloudfront'
import { DataStoreStack } from './data-store-stack'
import { AuthStack } from './auth-stack'
import { Provider } from '@aws-cdk/custom-resources'
import {
  CfnLogGroup,
  ILogGroup,
  LogGroup,
  RetentionDays,
} from '@aws-cdk/aws-logs'
import { ISecret, Secret } from '@aws-cdk/aws-secretsmanager'
import {
  AccountPrincipal,
  AnyPrincipal,
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from '@aws-cdk/aws-iam'
import { IKey, Key } from '@aws-cdk/aws-kms'
import { Certificate } from '@aws-cdk/aws-certificatemanager'
import {
  DefaultDomainMappingOptions,
  DomainName,
  HttpApi,
  HttpMethod,
  CfnRoute,
  CfnAuthorizer,
  CfnIntegration,
} from '@aws-cdk/aws-apigatewayv2'
import { ViewerCertificate } from '@aws-cdk/aws-cloudfront/lib/web_distribution'
import {
  ARecord,
  HostedZone,
  IHostedZone,
  RecordTarget,
  HostedZoneAttributes,
} from '@aws-cdk/aws-route53'
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets'
import {
  CfnUserPoolClient,
  CfnUserPoolResourceServer,
  CfnUserPoolUICustomizationAttachment,
  OAuthScope,
  UserPool,
} from '@aws-cdk/aws-cognito'
import { HostedDomain } from './hosted-domain'
import { ISecurityGroup, IVpc } from '@aws-cdk/aws-ec2'
import { LambdaDestination } from '@aws-cdk/aws-lambda-destinations'
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources'
import { Queue, IQueue } from '@aws-cdk/aws-sqs'
import { MinimalCloudFrontTarget } from './minimal-cloudfront-target'
import { EmailSender } from './email-sender'
import { getCognitoHostedLoginCss } from './utils'

interface ApiHostedDomain extends HostedDomain {
  /**
   * Whether to allow any host for the CORS policy.
   * Useful for development environments.
   * @default false
   */
  corsAllowAnyHost?: boolean
}

interface JwtConfiguration {
  /**
   * The audience (aud) of the JWT token
   */
  audience: string[]

  /**
   * The issuer (iss) of the JWT token
   */
  issuer: string

  /**
   * The URL for User Info for this service
   */
  userInfoEndpoint: string
}

export interface Props extends StackProps {
  /**
   * The auth stack to secure access to the application resources in this stack
   */
  authStack?: AuthStack
  /**
   * The JWT Authorizer settings if not using the auth stack
   */
  jwtAuth?: JwtConfiguration
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
  apiDomainConfig?: ApiHostedDomain
  /**
   * Web App domain configuration
   */
  webAppDomainConfig?: HostedDomain
  /**
   * The path (S3 prefix) in the static assets bucket (supplied by CI/CD stack) that assets specific to this city can be copied from.
   */
  staticAssetsPath?: string
  /**
   * Hosted zone attributes for adding record sets to
   */
  hostedZoneAttributes?: HostedZoneAttributes
  /**
   * Additional callback URLs to be registered with the Auth Stack
   * Useful for development environments.
   * @default false
   */
  additionalCallbackUrls?: string[]
  /**
   * Details for how to send emails - this will resolve to an SES identity and must be preconfigured
   */
  emailSender: EmailSender
  /**
   * Agency Whitelisted Domains.
   * Restricts email addresses that collections can be shared to and accessed from.
   * If an explicit match is required, include the '@' at the start of the entry.
   * For example, if the list is '@myspecificdomain.com','partialdomain.net' it will match 'name@myspecificdomain.com', 'name@partialdomain.com', 'name@mypartialdomain.com', 'name@my.partialdomain.com' but not match 'name@sub.myspecificdomain.com'
   */
  agencyEmailDomainsWhitelist?: string[]
}

interface ApiProps {
  api: HttpApi
  dbSecret: ISecret
  mySqlLayer: ILayerVersion
  gmLayer: ILayerVersion
  authorizer: CfnAuthorizer
}

interface BucketPermissions {
  includeRead?: boolean
  includeWrite?: boolean
  includeDelete?: boolean
  includeTagging?: boolean
}

interface SqsPermissions {
  includeWrite?: boolean
  includeDelete?: boolean
}

interface LogGroupPermissions {
  includeRead?: boolean
  includeWrite?: boolean
}

enum EnvironmentVariables {
  DOCUMENTS_BUCKET = 'DOCUMENTS_BUCKET',
  USERINFO_ENDPOINT = 'USERINFO_ENDPOINT',
  WEB_APP_DOMAIN = 'WEB_APP_DOMAIN',
  EMAIL_SENDER = 'EMAIL_SENDER',
  AGENCY_EMAIL_DOMAINS_WHITELIST = 'AGENCY_EMAIL_DOMAINS_WHITELIST',
  CREATE_COLLECTION_ZIP_FUNCTION_NAME = 'CREATE_COLLECTION_ZIP_FUNCTION_NAME',
  ACTIVITY_RECORD_SQS_QUEUE_URL = 'ACTIVITY_RECORD_SQS_QUEUE_URL',
  ACTIVITY_CLOUDWATCH_LOG_GROUP = 'ACTIVITY_CLOUDWATCH_LOG_GROUP',
  EMAIL_PROCESSOR_SQS_QUEUE_URL = 'EMAIL_PROCESSOR_SQS_QUEUE_URL',
}

const pathToApiServiceLambda = (name: string) =>
  path.join(__dirname, '..', '..', 'api-service', 'build', `${name}.zip`)

export class CityStack extends Stack {
  public bucketNames: { [index: string]: string }
  private static documentsBucketDocumentsPrefix = 'documents/'
  private static documentsBucketCollectionsPrefix = 'collections/'
  private lambdaVpc: IVpc
  private lambdaSecurityGroups: ISecurityGroup[]
  private rdsEndpoint: string
  private environmentVariables: { [key: string]: string }
  private uploadsBucket: Bucket
  private kmsKey: IKey
  private emailProcessorQueue: IQueue
  private auditLogQueue: IQueue
  private auditLogGroup: ILogGroup
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
      hostedZoneAttributes,
      jwtAuth,
      additionalCallbackUrls = [],
      emailSender,
      agencyEmailDomainsWhitelist = [],
    } = props

    // check auth stack is given if this stack expects it
    if (expectsAuthStack && !authStack) {
      throw new Error(
        'authStack must be provided when expectsAuthStack is true',
      )
    }

    // check auth stack is not given if this stack doesn't expect it
    if (!expectsAuthStack && authStack) {
      throw new Error(
        'authStack should not be provided when expectsAuthStack is false',
      )
    }
    // check jwt auth is given if auth stack is not
    if (!expectsAuthStack && !jwtAuth) {
      throw new Error('jwtAuth must be provided when expectsAuthStack is false')
    }

    // check data store stack is given - it is "optional" to allow for configuration
    // to be put together at runtime
    if (!dataStoreStack) {
      throw new Error('dataStoreStack must be provided')
    }

    // set VPC details for lambda access
    const { vpc, rdsAccessSecurityGroup, rdsEndpoint } = dataStoreStack
    this.lambdaVpc = vpc
    this.lambdaSecurityGroups = [rdsAccessSecurityGroup]
    this.rdsEndpoint = rdsEndpoint

    // check the cloudfront certificate is in north virginia
    if (
      webAppDomainConfig &&
      webAppDomainConfig.certificateArn &&
      !webAppDomainConfig.certificateArn.toLowerCase().includes('us-east-1')
    ) {
      throw new Error(
        'webAppDomainConfig.certificateArn must be a certificate in us-east-1',
      )
    }

    // reference hosted zone
    const hostedZone: IHostedZone | undefined = hostedZoneAttributes
      ? HostedZone.fromHostedZoneAttributes(
          this,
          `HostedZone`,
          hostedZoneAttributes,
        )
      : undefined

    // add hosting for the web app
    const { domain: webAppDomain } = this.addHosting(
      'WebApp',
      webAppDomainConfig,
      hostedZone,
    )

    // add auth stack integration
    const { jwtConfiguration } = this.addAuthIntegration(
      [`https://${webAppDomain}/authorize`, ...additionalCallbackUrls],
      authStack,
      apiDomainConfig,
      jwtAuth,
      `https://${webAppDomain}`,
    )

    // create the city key used for encryption of resources in this stack
    const { kmsKey } = this.addKmsKey()
    this.kmsKey = kmsKey

    // create the DB and access credentials for this city
    const { secret } = this.addDbAndCredentials(
      kmsKey,
      dataStoreStack.createDbUserFunction,
    )

    // create the mysql lambda layer
    const { layer: mySqlLayer } = this.addMysqlLayer()

    // create the graphics magick lambda layer
    const { layer: gmLayer } = this.addGraphicsMagickLayer()

    // add api
    const { api, authorizer, corsOrigins } = this.addApi(
      webAppDomain,
      jwtConfiguration,
      apiDomainConfig,
      hostedZone,
    )
    const apiProps: ApiProps = {
      api,
      authorizer,
      dbSecret: secret,
      mySqlLayer,
      gmLayer,
    }

    // create dead letter queue
    const { queue: deadLetterQueue } = this.createDeadLetterQueue(kmsKey)

    // create uploads bucket
    this.uploadsBucket = this.createUploadsBucket(kmsKey, corsOrigins).bucket

    // create audit log group and queue
    this.auditLogGroup = this.createAuditLogGroup(kmsKey).logGroup
    this.auditLogQueue = this.createAuditLogQueue(kmsKey, deadLetterQueue).queue

    // create email processing queue
    this.emailProcessorQueue = this.createEmailProcessorQueue(
      kmsKey,
      deadLetterQueue,
    ).queue

    this.environmentVariables = {
      [EnvironmentVariables.DOCUMENTS_BUCKET]: this.uploadsBucket.bucketName,
      [EnvironmentVariables.USERINFO_ENDPOINT]:
        jwtConfiguration.userInfoEndpoint,
      [EnvironmentVariables.WEB_APP_DOMAIN]: webAppDomain,
      [EnvironmentVariables.EMAIL_SENDER]: `${emailSender.name} <${emailSender.address}>`,
      [EnvironmentVariables.AGENCY_EMAIL_DOMAINS_WHITELIST]: agencyEmailDomainsWhitelist.join(
        ',',
      ),
      [EnvironmentVariables.ACTIVITY_CLOUDWATCH_LOG_GROUP]: this.auditLogGroup
        .logGroupName,
      [EnvironmentVariables.ACTIVITY_RECORD_SQS_QUEUE_URL]: this.auditLogQueue
        .queueUrl,
      [EnvironmentVariables.EMAIL_PROCESSOR_SQS_QUEUE_URL]: this
        .emailProcessorQueue.queueUrl,
    }

    this.createAuditLogQueueProcessor(this.auditLogQueue)
    this.createEmailQueueProcessor(this.emailProcessorQueue)

    // add user routes
    this.addUserRoutes(apiProps)

    // add document routes
    this.addDocumentRoutes(apiProps)

    // add collection routes
    this.addCollectionRoutes(apiProps)

    // add account delegate routes
    this.addAccountDelegateRoutes(apiProps)

    // run database migrations
    this.runMigrations(secret, mySqlLayer)
  }

  /**
   * Create the bucket for storing uploads
   * @param kmsKey The encryption key for the bucket
   * @param corsOrigins CORS origins for the bucket policy
   */
  private createUploadsBucket(kmsKey: IKey, corsOrigins: string[]) {
    const bucket = new Bucket(this, 'DocumentsBucket', {
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
      encryptionKey: kmsKey,
      removalPolicy: RemovalPolicy.RETAIN,
      cors: [
        {
          allowedMethods: [HttpMethods.POST, HttpMethods.GET],
          allowedOrigins: corsOrigins,
          maxAge: 3000,
          allowedHeaders: [
            'x-amz-*',
            'content-type',
            'content-disposition',
            'content-length',
          ],
        },
      ],
    })
    bucket.addLifecycleRule({
      expiration: Duration.days(14),
      prefix: CityStack.documentsBucketCollectionsPrefix,
    })
    return {
      bucket,
    }
  }

  /**
   * Create the audit log group for the stack. Predictably named for easier finding in the console.
   * @param kmsKey The encryption key for the log group
   */
  private createAuditLogGroup(kmsKey: IKey) {
    const logGroup = new LogGroup(this, 'AuditLogGroup', {
      logGroupName: this.stackName + '_AuditLogGroup',
      removalPolicy: RemovalPolicy.RETAIN,
      retention: RetentionDays.INFINITE,
    })
    const cfnLogGroup = logGroup.node.defaultChild as CfnLogGroup
    cfnLogGroup.addPropertyOverride('KmsKeyId', kmsKey.keyArn)
    return {
      logGroup,
    }
  }

  /**
   * Create the email processing queue for the stack.
   * @param kmsKey The encryption key for the log group
   * @param deadLetterQueue The dead letter queue to user
   */
  private createEmailProcessorQueue(kmsKey: IKey, deadLetterQueue: Queue) {
    const queue = new Queue(this, 'EmailProcessorQueue', {
      encryptionMasterKey: kmsKey,
      fifo: true,
      contentBasedDeduplication: true,
      retentionPeriod: Duration.days(10),
      visibilityTimeout: Duration.seconds(60),
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 50,
      },
    })

    return {
      queue,
    }
  }

  /**
   * Create the processor for the email queue
   * @param emailProcessorQueue The queue to read messages from
   */
  private createEmailQueueProcessor(emailProcessorQueue: IQueue) {
    const lambda = this.createLambda(
      'ProcessEmailSendRequest',
      pathToApiServiceLambda('emails/processSendRequest'),
      {
        extraEnvironmentVariables: [
          EnvironmentVariables.EMAIL_SENDER,
          EnvironmentVariables.WEB_APP_DOMAIN,
          EnvironmentVariables.EMAIL_PROCESSOR_SQS_QUEUE_URL,
        ],
        emailProcessorSqsPermissions: {
          includeDelete: true,
        },
      },
    )
    lambda.addEventSource(
      new SqsEventSource(emailProcessorQueue, {
        batchSize: 10,
      }),
    )
  }

  /**
   * Create the audit log queue for the stack.
   * @param kmsKey The encryption key for the log group
   * @param deadLetterQueue The dead letter queue to user
   */
  private createAuditLogQueue(kmsKey: IKey, deadLetterQueue: Queue) {
    const queue = new Queue(this, 'AuditLogQueue', {
      encryptionMasterKey: kmsKey,
      fifo: true,
      retentionPeriod: Duration.days(10),
      visibilityTimeout: Duration.seconds(60),
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 50,
      },
    })

    return {
      queue,
    }
  }

  /**
   * Create the processor for the audit log queue
   * @param auditLogQueue The queue to read messages from
   */
  private createAuditLogQueueProcessor(auditLogQueue: IQueue) {
    const lambda = this.createLambda(
      'ProcessActivity',
      pathToApiServiceLambda('activity/processActivity'),
      {
        auditLogGroupPermissions: {
          includeWrite: true,
        },
        auditLogSqsPermissions: {
          includeDelete: true,
        },
        extraEnvironmentVariables: [
          EnvironmentVariables.ACTIVITY_RECORD_SQS_QUEUE_URL,
          EnvironmentVariables.ACTIVITY_CLOUDWATCH_LOG_GROUP,
        ],
      },
    )
    lambda.addEventSource(
      new SqsEventSource(auditLogQueue, {
        batchSize: 10,
      }),
    )
  }

  /**
   * Create the audit log queue for the stack.
   * @param kmsKey The encryption key for the log group
   */
  private createDeadLetterQueue(kmsKey: IKey) {
    const queue = new Queue(this, 'DeadLetterQueue', {
      encryptionMasterKey: kmsKey,
      retentionPeriod: Duration.days(10),
      fifo: true,
    })
    return {
      queue,
    }
  }

  /**
   * Add any required auth integration for the stack
   * @param callbackUrls The allowed callback URLs for the auth integration
   * @param authStack The auth stack, if any
   * @param apiDomainConfig The API's domain configuration
   * @param jwtAuth The JWT Auth, if not using the auth stack
   */
  private addAuthIntegration(
    callbackUrls: string[],
    authStack?: AuthStack,
    apiDomainConfig?: HostedDomain,
    jwtAuth?: JwtConfiguration,
    appUrl?: string,
  ) {
    // if JWT Auth is given, shortcut out
    if (jwtAuth) {
      return { jwtConfiguration: jwtAuth }
    }

    // make sure auth stack is given - it should be as this has been checked already
    if (!authStack) {
      throw new Error('AuthStack should not be null at this point')
    }

    // add cognito specific integration
    const userPool = UserPool.fromUserPoolId(
      this,
      'UserPool',
      authStack.userPoolId,
    )
    const client = userPool.addClient('DataLockerClient', {
      authFlows: {
        userSrp: true,
      },
      preventUserExistenceErrors: true,
      oAuth: {
        callbackUrls,
        scopes: [OAuthScope.PROFILE, OAuthScope.OPENID, OAuthScope.EMAIL],
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
      },
    })
    const cfnUserPoolClient = client.node.defaultChild as CfnUserPoolClient
    cfnUserPoolClient.accessTokenValidity = 12
    cfnUserPoolClient.idTokenValidity = 12
    cfnUserPoolClient.tokenValidityUnits = {
      accessToken: 'hours',
      idToken: 'hours',
    }

    // add the resource server
    if (apiDomainConfig) {
      new CfnUserPoolResourceServer(this, 'UserPoolResourceServer', {
        identifier: 'https://' + apiDomainConfig.domain,
        name: this.stackName,
        userPoolId: authStack.userPoolId,
      })
    }

    if (appUrl) {
      // CSS for hosted login
      new CfnUserPoolUICustomizationAttachment(
        this,
        'UserPoolUICustomizationAttachment',
        {
          clientId: client.userPoolClientId,
          userPoolId: authStack.userPoolId,
          css: getCognitoHostedLoginCss(appUrl + '/images/city-logo.svg'),
        },
      )
    }

    return {
      jwtConfiguration: {
        audience: [client.userPoolClientId],
        issuer: `https://cognito-idp.${this.region}.amazonaws.com/${userPool.userPoolId}`,
        userInfoEndpoint: `${authStack.authUrl}/oauth2/userInfo`,
      },
    }
  }

  /**
   * Add hosting for a web app
   * @param appName The name of the web app
   * @param hostedDomainConfig The configuration for its hosting domain (optional)
   * @param hostedZone The hosted zone (optional)
   */
  private addHosting(
    appName: string,
    hostedDomainConfig?: HostedDomain,
    hostedZone?: IHostedZone,
  ) {
    //Create Certificate
    let viewerCertificate: ViewerCertificate | undefined
    if (hostedDomainConfig) {
      const certificate = Certificate.fromCertificateArn(
        this,
        `${appName}Certificate`,
        hostedDomainConfig.certificateArn,
      )
      viewerCertificate = ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: [hostedDomainConfig.domain],
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
        restrictPublicBuckets: true,
      },
      bucketName,
    })

    // Create App Origin Access Identity
    const originAccessIdentity = new OriginAccessIdentity(
      this,
      `${appName}OriginAccessIdentity`,
      {
        comment: appName,
      },
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
            responsePagePath: '/index.html',
          },
          {
            errorCode: 404,
            responseCode: 200,
            responsePagePath: '/index.html',
          },
        ],
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: originAccessIdentity,
            },
            behaviors: [
              ...['/index.html', '/sw.js'].map(
                (shortCachePathPattern) =>
                  ({
                    maxTtl: Duration.minutes(5),
                    minTtl: Duration.minutes(5),
                    defaultTtl: Duration.minutes(5),
                    pathPattern: shortCachePathPattern,
                    compress: true,
                  } as any),
              ),
              {
                isDefaultBehavior: true,
                compress: true,
              },
            ],
          },
        ],
        viewerCertificate,
      },
    )
    cloudFrontDistribution.node.addDependency(bucket, originAccessIdentity)

    // Create Domain Record
    if (hostedDomainConfig && hostedZone) {
      const { domain } = hostedDomainConfig
      const aliasRecord = new ARecord(this, `${appName}AliasRecord`, {
        zone: hostedZone,
        recordName: domain,
        target: RecordTarget.fromAlias(
          new CloudFrontTarget(cloudFrontDistribution),
        ),
      })
      aliasRecord.node.addDependency(cloudFrontDistribution)
    }

    return {
      domain: hostedDomainConfig
        ? hostedDomainConfig.domain
        : cloudFrontDistribution.distributionDomainName,
    }
  }

  /**
   * Add the KMS key for encrypting data for the City stack
   */
  private addKmsKey() {
    const kmsKey = new Key(this, 'Key', {
      description: `KMS Key for ${this.stackName} stack`,
      enableKeyRotation: true,
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
          'kms:DescribeKey',
        ],
        resources: ['*'],
        principals: [new AnyPrincipal()],
        conditions: {
          StringEquals: {
            'kms:ViaService': `secretsmanager.${this.region}.amazonaws.com`,
            'kms:CallerAccount': this.account,
          },
        },
      }),
    )

    // add permissions for decryption of documents in bucket
    kmsKey.addToResourcePolicy(
      new PolicyStatement({
        actions: ['kms:Decrypt', 'kms:GenerateDataKey*'],
        resources: ['*'],
        principals: [new AccountPrincipal(this.account)],
      }),
    )

    // add permissions required for logs
    kmsKey.addToResourcePolicy(
      new PolicyStatement({
        principals: [new ServicePrincipal(`logs.${this.region}.amazonaws.com`)],
        actions: [
          'kms:Encrypt*',
          'kms:Decrypt*',
          'kms:ReEncrypt*',
          'kms:GenerateDataKey*',
          'kms:Describe*',
        ],
        resources: ['*'],
        conditions: {
          ArnEquals: {
            'kms:EncryptionContext:aws:logs:arn': `arn:aws:logs:${this.region}:${this.account}:log-group:*`,
          },
        },
      }),
    )

    return {
      kmsKey,
    }
  }

  /**
   * Create credentials, a new DB and DB User in the DB Server for the city to use
   * @param kmsKey The KMS Key to encrypt the secrets
   * @param exportedCreateDbUserFunction The function exported from the data stack to use to create the DB User
   */
  private addDbAndCredentials(
    kmsKey: IKey,
    exportedCreateDbUserFunction: IFunction,
  ) {
    // import the function
    const createDbUserFunction = Function.fromFunctionArn(
      this,
      'CreateDbUserFunction',
      exportedCreateDbUserFunction.functionArn,
    )

    // check the exported role is accessible
    if (!exportedCreateDbUserFunction.role) {
      throw new Error(
        'dataStoreStack.createDbUserFunction.role should be accessible',
      )
    }

    // import the role
    const createDbUserFunctionRole = Role.fromRoleArn(
      this,
      'CreateDbUserFunctionRole',
      exportedCreateDbUserFunction.role.roleArn,
    )

    // create a custom resource provider
    const createDbUserCustomResourceProvider = new Provider(
      this,
      'CreateDbUserCustomResourceProvider',
      {
        onEventHandler: createDbUserFunction,
        logRetention: RetentionDays.ONE_DAY,
      },
    )

    // create the new DB user's credentials
    const dbCredentials = new Secret(this, 'DbCredentialsSecret', {
      secretName: `${this.stackName}-rds-db-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: this.stackName.toLowerCase().replace(/[\W_]+/g, ''),
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
        passwordLength: 30,
      },
      encryptionKey: kmsKey,
    })

    // allow the base function to access our new secret
    const secretAccessPolicy = new Policy(this, 'AllowAccessToDatabaseSecret', {
      roles: [createDbUserFunctionRole],
      statements: [
        new PolicyStatement({
          actions: ['secretsmanager:GetSecretValue'],
          resources: [dbCredentials.secretArn],
        }),
      ],
    })

    // execute the custom resource to connect to the DB Server and create the new DB and User
    const createDbUser = new CustomResource(
      this,
      'CreateDbUserCustomResource',
      {
        serviceToken: createDbUserCustomResourceProvider.serviceToken,
        properties: {
          NewUserSecretId: dbCredentials.secretArn,
        },
      },
    )
    createDbUser.node.addDependency(secretAccessPolicy)

    return { secret: dbCredentials }
  }

  /**
   * Adds and configures the API Gateway resource for this City
   * @param webAppDomain Domain for the web app, to allow CORS access from
   * @param jwtConfiguration JWT configuration for the authorizer
   * @param apiDomainConfig API Domain details (optional) for setting up the custom domain
   * @param hostedZone Hosted zone config (optional) for hooking up the custom domain
   */
  private addApi(
    webAppDomain: string,
    jwtConfiguration: JwtConfiguration,
    apiDomainConfig?: ApiHostedDomain,
    hostedZone?: IHostedZone,
  ) {
    // read out config
    const { corsAllowAnyHost = false, domain, certificateArn } =
      apiDomainConfig || {}
    apiDomainConfig || {}

    // register custom domain name if we can
    let defaultDomainMapping: DefaultDomainMappingOptions | undefined
    if (domain && certificateArn) {
      const certificate = Certificate.fromCertificateArn(
        this,
        'ApiDomainCertificate',
        certificateArn,
      )
      const domainMapping = new DomainName(this, 'ApiDomainName', {
        domainName: domain,
        certificate: certificate,
      })
      defaultDomainMapping = {
        domainName: domainMapping,
      }
      if (hostedZone) {
        new ARecord(this, `ApiAliasRecord`, {
          zone: hostedZone,
          recordName: domain,
          target: RecordTarget.fromAlias(
            new MinimalCloudFrontTarget(
              this,
              domainMapping.regionalDomainName,
              domainMapping.regionalHostedZoneId,
            ),
          ),
        })
      }
    }

    // create api
    const corsOrigins = [corsAllowAnyHost ? '*' : `https://${webAppDomain}`]
    const api = new HttpApi(this, 'Api', {
      apiName: `${this.stackName}Api`,
      corsPreflight: {
        allowMethods: [
          HttpMethod.GET,
          HttpMethod.DELETE,
          HttpMethod.OPTIONS,
          HttpMethod.POST,
          HttpMethod.PUT,
        ],
        allowOrigins: corsOrigins,
        allowHeaders: ['authorization', 'content-type'],
      },
      defaultDomainMapping,
    })

    // create authorizer
    const authorizer = new CfnAuthorizer(this, 'ApiJwtAuthorizer', {
      apiId: api.httpApiId,
      authorizerType: 'JWT',
      jwtConfiguration: jwtConfiguration,
      identitySource: ['$request.header.Authorization'],
      name: 'JwtAuthorizer',
    })

    return {
      api,
      authorizer,
      corsOrigins,
    }
  }

  private determineBucketPermissions(
    permissions: BucketPermissions,
  ): { bucketActions: string[]; keyActions: string[] } {
    const {
      includeRead,
      includeWrite,
      includeDelete,
      includeTagging,
    } = permissions
    const bucketActions = []
    const keyActions = []

    // determine read permissions needed
    if (includeRead) {
      bucketActions.push('s3:GetObject')
      keyActions.push('kms:Decrypt')
    }

    // determine write permissions needed
    if (includeWrite) {
      bucketActions.push('s3:PutObject')
      keyActions.push('kms:GenerateDataKey')
    }

    // determine tag permissions needed
    if (includeTagging) {
      bucketActions.push('s3:PutObjectTagging')
    }

    // determine delete permissions needed
    if (includeDelete) {
      bucketActions.push('s3:DeleteObject')
    }

    return {
      bucketActions,
      keyActions,
    }
  }

  private addSqsPermissions(
    lambdaFunction: IFunction,
    sqsQueue: IQueue,
    sqsPermissions?: SqsPermissions,
  ) {
    const sqsActions = []
    const keyActions = []
    if (sqsPermissions) {
      const { includeWrite, includeDelete } = sqsPermissions

      if (includeWrite) {
        keyActions.push('kms:GenerateDataKey', 'kms:Decrypt')
        sqsActions.push('sqs:SendMessage', 'sqs:SendMessageBatch')
      }

      if (includeDelete) {
        sqsActions.push('sqs:DeleteMessageBatch')
      }

      lambdaFunction.addToRolePolicy(
        new PolicyStatement({
          actions: sqsActions,
          resources: [sqsQueue.queueArn],
        }),
      )
    }
    return { sqsActions, keyActions }
  }

  /**
   * Adds Policy Statements to allow specified permissions to a lambda
   * @param lambdaFunction The function to apply the statements to
   * @param actions The actions to allow
   */
  private addPermissionsToLambda(
    lambdaFunction: IFunction,
    permissions: {
      documentBucketPermissions?: BucketPermissions
      collectionBucketPermissions?: BucketPermissions
      auditLogSqsPermissions?: SqsPermissions
      auditLogGroupPermissions?: LogGroupPermissions
      emailProcessorSqsPermissions?: SqsPermissions
    },
  ) {
    // set up constants
    const {
      documentBucketPermissions,
      collectionBucketPermissions,
      auditLogSqsPermissions,
      auditLogGroupPermissions,
      emailProcessorSqsPermissions,
    } = permissions
    const {
      bucketActions: documentBucketActions,
      keyActions: documentKeyActions,
    } = this.determineBucketPermissions(documentBucketPermissions ?? {})
    const {
      bucketActions: collectionBucketActions,
      keyActions: collectionKeyActions,
    } = this.determineBucketPermissions(collectionBucketPermissions ?? {})
    const keyActions = new Set([...documentKeyActions, ...collectionKeyActions])

    // add bucket permissions for documents
    if (documentBucketActions.length) {
      lambdaFunction.addToRolePolicy(
        new PolicyStatement({
          actions: documentBucketActions,
          resources: [
            this.uploadsBucket.arnForObjects(
              `${CityStack.documentsBucketDocumentsPrefix}*`,
            ),
          ],
        }),
      )
    }

    // add bucket permissions for collections
    if (collectionBucketActions.length) {
      lambdaFunction.addToRolePolicy(
        new PolicyStatement({
          actions: collectionBucketActions,
          resources: [
            this.uploadsBucket.arnForObjects(
              `${CityStack.documentsBucketCollectionsPrefix}*`,
            ),
          ],
        }),
      )
    }

    // add sqs permissions for audit log queue
    const { keyActions: auditLogKeyActions } = this.addSqsPermissions(
      lambdaFunction,
      this.auditLogQueue,
      auditLogSqsPermissions,
    )
    auditLogKeyActions.forEach((a) => keyActions.add(a))

    // add sqs permissions for email processor
    const { keyActions: emailProcessorKeyActions } = this.addSqsPermissions(
      lambdaFunction,
      this.emailProcessorQueue,
      emailProcessorSqsPermissions,
    )
    emailProcessorKeyActions.forEach((a) => keyActions.add(a))

    // add log group permissions
    if (auditLogGroupPermissions) {
      const { includeRead, includeWrite } = auditLogGroupPermissions
      const logGroupActions = []
      const logStreamActions = []

      if (includeRead) {
        logStreamActions.push('logs:GetLogEvents')
      }

      if (includeWrite) {
        keyActions.add('kms:GenerateDataKey')
        logGroupActions.push('logs:CreateLogStream')
        logGroupActions.push('logs:DescribeLogStreams')
        logStreamActions.push('logs:PutLogEvents')
      }

      if (logGroupActions.length) {
        lambdaFunction.addToRolePolicy(
          new PolicyStatement({
            actions: logGroupActions,
            resources: [this.auditLogGroup.logGroupArn],
          }),
        )
      }

      if (logStreamActions.length) {
        lambdaFunction.addToRolePolicy(
          new PolicyStatement({
            actions: logStreamActions,
            resources: [this.auditLogGroup.logGroupArn],
          }),
        )
      }
    }

    // add key permissions
    if (keyActions.size != 0) {
      lambdaFunction.addToRolePolicy(
        new PolicyStatement({
          actions: Array.from(keyActions),
          resources: [this.kmsKey.keyArn],
        }),
      )
    }
  }

  /**
   * Adds user specific routes to the API
   * @param apiProps Common properties for API functions
   */
  private addUserRoutes(apiProps: ApiProps) {
    const { api, dbSecret, mySqlLayer, authorizer } = apiProps

    // add route and lambda to list users documents
    this.addRoute(api, {
      name: 'GetUserDocuments',
      routeKey: 'GET /users/{userId}/documents',
      lambdaFunction: this.createLambda(
        'GetUserDocuments',
        pathToApiServiceLambda('documents/getByUserId'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [
            EnvironmentVariables.DOCUMENTS_BUCKET,
            EnvironmentVariables.USERINFO_ENDPOINT,
          ],
          // permission needed to create presigned urls for thumbnails
          documentBucketPermissions: {
            includeRead: true,
          },
        },
      ),
      authorizer,
    })

    // add lambda and route to submit a document
    this.addRoute(api, {
      name: 'PostUserDocuments',
      routeKey: 'POST /users/{userId}/documents',
      lambdaFunction: this.createLambda(
        'PostUserDocuments',
        pathToApiServiceLambda('documents/createDocumentForUser'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [
            EnvironmentVariables.DOCUMENTS_BUCKET,
            EnvironmentVariables.USERINFO_ENDPOINT,
            EnvironmentVariables.ACTIVITY_RECORD_SQS_QUEUE_URL,
          ],
          // permission needed to create presigned upload url
          documentBucketPermissions: {
            includeWrite: true,
          },
          auditLogSqsPermissions: {
            includeWrite: true,
          },
        },
      ),
      authorizer,
    })

    // add route and lambda to list users collections
    this.addRoute(api, {
      name: 'GetUserCollections',
      routeKey: 'GET /users/{userId}/collections',
      lambdaFunction: this.createLambda(
        'GetUserCollections',
        pathToApiServiceLambda('collections/getByUserId'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [EnvironmentVariables.USERINFO_ENDPOINT],
        },
      ),
      authorizer,
    })

    // add route and lambda to list collections shared to user
    this.addRoute(api, {
      name: 'GetSharedCollectionsToUser',
      routeKey: 'GET /users/{userId}/collections/shared',
      lambdaFunction: this.createLambda(
        'GetSharedCollectionsToUser',
        pathToApiServiceLambda('collections/getSharedToUserId'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [
            EnvironmentVariables.USERINFO_ENDPOINT,
            EnvironmentVariables.AGENCY_EMAIL_DOMAINS_WHITELIST,
          ],
        },
      ),
      authorizer,
    })

    // add route and lambda to submit a collection
    const createCollectionFunction = this.createLambda(
      'PostUserCollections',
      pathToApiServiceLambda('collections/createCollectionForUser'),
      {
        dbSecret,
        layers: [mySqlLayer],
        extraEnvironmentVariables: [
          EnvironmentVariables.USERINFO_ENDPOINT,
          EnvironmentVariables.WEB_APP_DOMAIN,
          EnvironmentVariables.AGENCY_EMAIL_DOMAINS_WHITELIST,
          EnvironmentVariables.ACTIVITY_RECORD_SQS_QUEUE_URL,
          EnvironmentVariables.EMAIL_PROCESSOR_SQS_QUEUE_URL,
        ],
        emailProcessorSqsPermissions: {
          includeWrite: true,
        },
        auditLogSqsPermissions: {
          includeWrite: true,
        },
      },
    )
    createCollectionFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['ses:SendEmail'],
        resources: ['*'],
      }),
    )
    this.addRoute(api, {
      name: 'PostUserCollections',
      routeKey: 'POST /users/{userId}/collections',
      lambdaFunction: createCollectionFunction,
      authorizer,
    })

    // add route and lambda to get users profile
    this.addRoute(api, {
      name: 'GetUser',
      routeKey: 'GET /users/{userId}',
      lambdaFunction: this.createLambda(
        'GetUser',
        pathToApiServiceLambda('users/getUser'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [EnvironmentVariables.USERINFO_ENDPOINT],
        },
      ),
      authorizer,
    })

    // add route and lambda to accept terms of use
    this.addRoute(api, {
      name: 'UserAcceptTerms',
      routeKey: 'POST /users/{userId}/accept-terms',
      lambdaFunction: this.createLambda(
        'UserAcceptTerms',
        pathToApiServiceLambda('users/acceptTerms'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [
            EnvironmentVariables.USERINFO_ENDPOINT,
            EnvironmentVariables.ACTIVITY_RECORD_SQS_QUEUE_URL,
          ],
          auditLogSqsPermissions: {
            includeWrite: true,
          },
        },
      ),
      authorizer,
    })

    // add route and lambda to list account delegates
    this.addRoute(api, {
      name: 'ListAccountActivity',
      routeKey: 'GET /users/{userId}/activity',
      lambdaFunction: this.createLambda(
        'ListAccountActivity',
        pathToApiServiceLambda('activity/listAccountActivity'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [
            EnvironmentVariables.USERINFO_ENDPOINT,
            EnvironmentVariables.ACTIVITY_CLOUDWATCH_LOG_GROUP,
          ],
          auditLogGroupPermissions: {
            includeRead: true,
          },
        },
      ),
      authorizer,
    })
  }

  /**
   * Adds document specific routes to the API
   * @param apiProps Common properties for API functions
   * @param uploadsBucket The bucket with document uploads
   */
  private addDocumentRoutes(apiProps: ApiProps) {
    const { api, dbSecret, mySqlLayer, authorizer, gmLayer } = apiProps

    // add lambda and route to fetch a document
    this.addRoute(api, {
      name: 'GetDocumentById',
      routeKey: 'GET /documents/{documentId}',
      lambdaFunction: this.createLambda(
        'GetDocumentById',
        pathToApiServiceLambda('documents/getById'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [
            EnvironmentVariables.DOCUMENTS_BUCKET,
            EnvironmentVariables.USERINFO_ENDPOINT,
            EnvironmentVariables.AGENCY_EMAIL_DOMAINS_WHITELIST,
          ],
          documentBucketPermissions: {
            includeRead: true,
            includeWrite: true,
          },
        },
      ),
      authorizer,
    })

    // add lambda and route to get a file download link
    this.addRoute(api, {
      name: 'DownloadDocumentFileById',
      routeKey: 'GET /documents/{documentId}/files/{fileId}/download',
      lambdaFunction: this.createLambda(
        'DownloadDocumentFileById',
        pathToApiServiceLambda('documents/getFileDownloadLinkById'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [
            EnvironmentVariables.DOCUMENTS_BUCKET,
            EnvironmentVariables.USERINFO_ENDPOINT,
            EnvironmentVariables.AGENCY_EMAIL_DOMAINS_WHITELIST,
            EnvironmentVariables.ACTIVITY_RECORD_SQS_QUEUE_URL,
          ],
          // permission needed to create presigned urls (for get)
          documentBucketPermissions: {
            includeRead: true,
          },
          auditLogSqsPermissions: {
            includeWrite: true,
          },
        },
      ),
      authorizer,
    })

    // update thumbnail path for document
    const attachThumbnailToDocument = this.createLambda(
      'AttachThumbnailToDocument',
      pathToApiServiceLambda('documents/attachThumbnailToDocument'),
      {
        dbSecret,
        layers: [mySqlLayer],
      },
    )

    // create lambda to create thumbnail for document
    const createDocumentThumbnail = this.createLambda(
      'CreateDocumentThumbnail',
      pathToApiServiceLambda('documents/createThumbnail'),
      {
        layers: [gmLayer],
        extraEnvironmentVariables: [EnvironmentVariables.DOCUMENTS_BUCKET],
        extraFunctionProps: {
          onSuccess: new LambdaDestination(attachThumbnailToDocument, {
            responseOnly: true,
          }),
        },
        // permission needed to upload and download files
        documentBucketPermissions: {
          includeRead: true,
          includeWrite: true,
        },
      },
    )

    // create lambda to mark document as received
    const markFileAsReceived = this.createLambda(
      'MarkFileAsReceived',
      pathToApiServiceLambda('documents/markFileReceived'),
      {
        dbSecret,
        layers: [mySqlLayer],
        extraFunctionProps: {
          onSuccess: new LambdaDestination(createDocumentThumbnail, {
            responseOnly: true,
          }),
        },
      },
    )
    markFileAsReceived.addEventSource(
      new S3EventSource(this.uploadsBucket, {
        events: [EventType.OBJECT_CREATED],
        filters: [
          {
            prefix: CityStack.documentsBucketDocumentsPrefix,
          },
        ],
      }),
    )

    // add route to update document by ID
    this.addRoute(api, {
      name: 'PutDocumentById',
      routeKey: 'PUT /documents/{documentId}',
      lambdaFunction: this.createLambda(
        'PutDocumentById',
        pathToApiServiceLambda('documents/putDocumentById'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [
            EnvironmentVariables.USERINFO_ENDPOINT,
            EnvironmentVariables.ACTIVITY_RECORD_SQS_QUEUE_URL,
          ],
          auditLogSqsPermissions: {
            includeWrite: true,
          },
        },
      ),
      authorizer,
    })

    // create lambda to delete a document
    const deleteDocumentByIdLambda = this.createLambda(
      'DeleteDocumentById',
      pathToApiServiceLambda('documents/deleteDocumentById'),
      {
        dbSecret,
        layers: [mySqlLayer],
        extraEnvironmentVariables: [
          EnvironmentVariables.DOCUMENTS_BUCKET,
          EnvironmentVariables.USERINFO_ENDPOINT,
          EnvironmentVariables.ACTIVITY_RECORD_SQS_QUEUE_URL,
        ],
        // permission needed to create presigned urls (for get and put)
        documentBucketPermissions: {
          includeDelete: true,
        },
        auditLogSqsPermissions: {
          includeWrite: true,
        },
      },
    )

    // add route
    this.addRoute(api, {
      name: 'DeleteDocumentById',
      routeKey: 'DELETE /documents/{documentId}',
      lambdaFunction: deleteDocumentByIdLambda,
      authorizer,
    })
  }

  /**
   * Adds collection specific routes to the API
   * @param apiProps Common properties for API functions
   */
  private addCollectionRoutes(apiProps: ApiProps) {
    const { api, dbSecret, mySqlLayer, authorizer } = apiProps

    // add route and lambda to list collections documents
    this.addRoute(api, {
      name: 'GetCollectionDocuments',
      routeKey: 'GET /collections/{collectionId}/documents',
      lambdaFunction: this.createLambda(
        'GetCollectionDocuments',
        pathToApiServiceLambda('collections/getDocumentsByCollectionId'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [
            EnvironmentVariables.USERINFO_ENDPOINT,
            EnvironmentVariables.DOCUMENTS_BUCKET,
            EnvironmentVariables.AGENCY_EMAIL_DOMAINS_WHITELIST,
          ],
          // permission needed to create presigned urls for thumbnails
          documentBucketPermissions: {
            includeRead: true,
          },
        },
      ),
      authorizer,
    })

    // add route and lambda to list collections grants
    this.addRoute(api, {
      name: 'GetCollectionGrants',
      routeKey: 'GET /collections/{collectionId}/grants',
      lambdaFunction: this.createLambda(
        'GetCollectionGrants',
        pathToApiServiceLambda('collections/getGrantsByCollectionId'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [EnvironmentVariables.USERINFO_ENDPOINT],
        },
      ),
      authorizer,
    })

    // add lambda to create a zip of collection documents
    const createCollectionZip = this.createLambda(
      'CreateCollectionZip',
      pathToApiServiceLambda('collections/createCollectionZip'),
      {
        dbSecret,
        layers: [mySqlLayer],
        extraEnvironmentVariables: [EnvironmentVariables.DOCUMENTS_BUCKET],
        extraFunctionProps: {
          timeout: Duration.seconds(900),
        },
        documentBucketPermissions: {
          // can read documents
          includeRead: true,
        },
        collectionBucketPermissions: {
          // can read and write collections
          includeRead: true,
          includeWrite: true,
          includeTagging: true,
        },
      },
    )
    this.environmentVariables[
      EnvironmentVariables.CREATE_COLLECTION_ZIP_FUNCTION_NAME
    ] = createCollectionZip.functionName

    // add lambda to create a collection download
    const downloadCollectionDocuments = this.createLambda(
      'DownloadCollectionDocuments',
      pathToApiServiceLambda('collections/downloadCollectionDocuments'),
      {
        dbSecret,
        layers: [mySqlLayer],
        extraEnvironmentVariables: [
          EnvironmentVariables.USERINFO_ENDPOINT,
          EnvironmentVariables.DOCUMENTS_BUCKET,
          EnvironmentVariables.CREATE_COLLECTION_ZIP_FUNCTION_NAME,
          EnvironmentVariables.AGENCY_EMAIL_DOMAINS_WHITELIST,
          EnvironmentVariables.ACTIVITY_RECORD_SQS_QUEUE_URL,
        ],
        collectionBucketPermissions: {
          // can read collections
          includeRead: true,
        },
        auditLogSqsPermissions: {
          includeWrite: true,
        },
      },
    )

    createCollectionZip.grantInvoke(downloadCollectionDocuments)
    // add route to create a collection download
    this.addRoute(api, {
      name: 'DownloadCollectionDocuments',
      routeKey: 'POST /collections/{collectionId}/documents/downloads',
      lambdaFunction: downloadCollectionDocuments,
      authorizer,
    })

    // add route and lambda to fetch a collection download
    this.addRoute(api, {
      name: 'GetDownloadForCollectionDocuments',
      routeKey:
        'GET /collections/{collectionId}/documents/downloads/{downloadId}',
      lambdaFunction: this.createLambda(
        'GetDownloadForCollectionDocuments',
        pathToApiServiceLambda('collections/getDownloadForCollectionDocuments'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [
            EnvironmentVariables.USERINFO_ENDPOINT,
            EnvironmentVariables.DOCUMENTS_BUCKET,
            EnvironmentVariables.AGENCY_EMAIL_DOMAINS_WHITELIST,
            EnvironmentVariables.ACTIVITY_RECORD_SQS_QUEUE_URL,
          ],
          collectionBucketPermissions: {
            // can read collections
            includeRead: true,
          },
          auditLogSqsPermissions: {
            includeWrite: true,
          },
        },
      ),
      authorizer,
    })
  }

  /**
   * Adds account delegate specific routes to the API
   * @param apiProps Common properties for API functions
   */
  private addAccountDelegateRoutes(apiProps: ApiProps) {
    const { api, dbSecret, mySqlLayer, authorizer } = apiProps

    // add route and lambda to list account delegates
    this.addRoute(api, {
      name: 'ListAccountDelegates',
      routeKey: 'GET /users/{userId}/delegates',
      lambdaFunction: this.createLambda(
        'ListAccountDelegates',
        pathToApiServiceLambda('accountDelegates/listAccountDelegates'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [EnvironmentVariables.USERINFO_ENDPOINT],
        },
      ),
      authorizer,
    })

    // add route and lambda to add account delegate
    this.addRoute(api, {
      name: 'AddAccountDelegate',
      routeKey: 'POST /users/{userId}/delegates',
      lambdaFunction: this.createLambda(
        'AddAccountDelegate',
        pathToApiServiceLambda('accountDelegates/addAccountDelegate'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [
            EnvironmentVariables.USERINFO_ENDPOINT,
            EnvironmentVariables.ACTIVITY_RECORD_SQS_QUEUE_URL,
            EnvironmentVariables.WEB_APP_DOMAIN,
            EnvironmentVariables.EMAIL_PROCESSOR_SQS_QUEUE_URL,
          ],
          auditLogSqsPermissions: {
            includeWrite: true,
          },
          emailProcessorSqsPermissions: {
            includeWrite: true,
          },
        },
      ),
      authorizer,
    })

    // add route and lambda to delete account delegate
    this.addRoute(api, {
      name: 'DeleteAccountDelegate',
      routeKey: 'DELETE /delegates/{delegateId}',
      lambdaFunction: this.createLambda(
        'DeleteAccountDelegate',
        pathToApiServiceLambda('accountDelegates/deleteAccountDelegate'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [
            EnvironmentVariables.USERINFO_ENDPOINT,
            EnvironmentVariables.ACTIVITY_RECORD_SQS_QUEUE_URL,
          ],
          auditLogSqsPermissions: {
            includeWrite: true,
          },
        },
      ),
      authorizer,
    })

    // add route and lambda to accept account delegate invitation
    this.addRoute(api, {
      name: 'AcceptDelegatedAccount',
      routeKey: 'POST /delegates/{delegateId}/accept',
      lambdaFunction: this.createLambda(
        'AcceptDelegatedAccount',
        pathToApiServiceLambda('accountDelegates/acceptDelegatedAccount'),
        {
          dbSecret,
          layers: [mySqlLayer],
          extraEnvironmentVariables: [
            EnvironmentVariables.USERINFO_ENDPOINT,
            EnvironmentVariables.ACTIVITY_RECORD_SQS_QUEUE_URL,
          ],
          auditLogSqsPermissions: {
            includeWrite: true,
          },
        },
      ),
      authorizer,
    })
  }

  /**
   * Adds a route to the API
   * @param api The API to register the route with
   * @param props The props for the route
   */
  private addRoute(
    api: HttpApi,
    props: {
      name: string
      routeKey: string
      lambdaFunction: IFunction
      authorizer?: CfnAuthorizer
    },
  ) {
    const { name, routeKey, lambdaFunction, authorizer } = props
    const grant = lambdaFunction.grantInvoke(
      new ServicePrincipal('apigateway.amazonaws.com'),
    )
    if (grant.principalStatement) {
      grant.principalStatement.addCondition('ArnLike', {
        'AWS:SourceArn': `arn:${this.partition}:execute-api:${this.region}:${this.account}:${api.httpApiId}/*/*`,
      })
    }

    const integration = new CfnIntegration(this, `${name}Integration`, {
      apiId: api.httpApiId,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:${this.partition}:apigateway:${this.region}:lambda:path/2015-03-31/functions/${lambdaFunction.functionArn}/invocations`,
      payloadFormatVersion: '2.0',
    })
    grant.applyBefore(integration)

    new CfnRoute(this, `${name}Route`, {
      apiId: api.httpApiId,
      routeKey: routeKey,
      target: `integrations/${integration.ref}`,
      authorizerId: authorizer ? authorizer.ref : undefined,
      authorizationType: authorizer ? authorizer.authorizerType : undefined,
    })
  }

  /**
   * Create a lambda function with a standard configuration
   * @param name The name for constructs
   * @param path The path to the entrypoint
   * @param props Extra properties for the function
   */
  private createLambda(
    name: string,
    path: string,
    props: {
      handler?: string
      dbSecret?: ISecret
      extraEnvironmentVariables?: EnvironmentVariables[]
      layers?: ILayerVersion[]
      extraFunctionProps?: Partial<FunctionProps>
      documentBucketPermissions?: BucketPermissions
      collectionBucketPermissions?: BucketPermissions
      auditLogSqsPermissions?: SqsPermissions
      emailProcessorSqsPermissions?: SqsPermissions
      auditLogGroupPermissions?: LogGroupPermissions
    },
  ) {
    const {
      handler = 'index.handler',
      dbSecret,
      extraEnvironmentVariables = [],
      extraFunctionProps = {},
      layers,
    } = props
    const requiresDbConnectivity = !!dbSecret
    const dbParams: { [key: string]: string } = dbSecret
      ? {
          DB_HOST: this.rdsEndpoint,
          DB_USER: dbSecret.secretValueFromJson('username').toString(),
          DB_PASSWORD: dbSecret.secretValueFromJson('password').toString(),
          DB_NAME: dbSecret.secretValueFromJson('username').toString(),
        }
      : {}
    const environment: {
      [key: string]: string
    } = {
      NODE_ENV: 'production',
      ...dbParams,
    }
    extraEnvironmentVariables.forEach((e) => {
      environment[e] = this.environmentVariables[e]
    })
    const lambda = new Function(this, name, {
      ...extraFunctionProps,
      code: Code.fromAsset(path),
      handler,
      environment,
      memorySize: 512,
      timeout: Duration.seconds(60),
      layers,
      runtime: Runtime.NODEJS_12_X,
      vpc: requiresDbConnectivity ? this.lambdaVpc : undefined,
      securityGroups: requiresDbConnectivity
        ? this.lambdaSecurityGroups
        : undefined,
    })
    this.addPermissionsToLambda(lambda, props)
    return lambda
  }

  /**
   * Adds the mysql lambda layer to the stack
   */
  private addMysqlLayer() {
    return {
      layer: new LayerVersion(this, 'MysqlLayer', {
        code: Code.fromAsset(
          path.join(__dirname, 'lambdas', 'sql-layer', 'layer.zip'),
        ),
        compatibleRuntimes: [Runtime.NODEJS_12_X],
      }),
    }
  }

  /**
   * Adds the graphics magick lambda layer to the stack
   */
  private addGraphicsMagickLayer() {
    return {
      layer: new LayerVersion(this, 'GraphicsMagickLayer', {
        code: Code.fromAsset(
          path.join(__dirname, 'lambdas', 'gm-layer', 'layer.zip'),
        ),
        compatibleRuntimes: [Runtime.NODEJS_12_X],
      }),
    }
  }

  /**
   * Runs DB migrations using Knex
   * @param dbSecret The DB secret for accessing the database
   * @param mysqlLayer The mysql layer
   */
  private runMigrations(dbSecret: ISecret, mysqlLayer: ILayerVersion) {
    const runMigrationsFunction = new Function(this, 'RunMigrationsFunction', {
      code: Code.fromAsset(
        path.join(__dirname, '..', '..', 'api-service', 'dist', 'migrator'),
      ),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_12_X,
      vpc: this.lambdaVpc,
      securityGroups: this.lambdaSecurityGroups,
      layers: [mysqlLayer],
      timeout: Duration.seconds(60),
      memorySize: 512,
      environment: {
        DB_HOST: this.rdsEndpoint,
        DB_USER: dbSecret.secretValueFromJson('username').toString(),
        DB_PASSWORD: dbSecret.secretValueFromJson('password').toString(),
        DB_NAME: dbSecret.secretValueFromJson('username').toString(),
      },
    })

    // create a custom resource provider
    const runMigrationsResourceProvider = new Provider(
      this,
      'RunMigrationsCustomResourceProvider',
      {
        onEventHandler: runMigrationsFunction,
        logRetention: RetentionDays.ONE_DAY,
      },
    )

    new CustomResource(this, 'RunMigrationsCustomResource', {
      serviceToken: runMigrationsResourceProvider.serviceToken,
      properties: {
        // Dynamic prop to force execution each time
        Execution: Math.random().toString(36).substr(2),
      },
    })
  }
}
