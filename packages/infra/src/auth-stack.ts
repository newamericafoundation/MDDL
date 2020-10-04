import {
  Construct,
  IDependable,
  RemovalPolicy,
  Stack,
  StackProps,
} from '@aws-cdk/core'
import {
  AccountRecovery,
  CfnUserPool,
  StringAttribute,
  UserPool,
  VerificationEmailStyle,
} from '@aws-cdk/aws-cognito'
import { Topic } from '@aws-cdk/aws-sns'
import { Certificate } from '@aws-cdk/aws-certificatemanager'
import { HostedDomain } from './hosted-domain'
import {
  ARecord,
  HostedZone,
  RecordTarget,
  HostedZoneAttributes,
} from '@aws-cdk/aws-route53'
import { Bucket, RedirectProtocol } from '@aws-cdk/aws-s3'
import { BucketWebsiteTarget } from '@aws-cdk/aws-route53-targets'
import { MinimalCloudFrontTarget } from './minimal-cloudfront-target'

interface CustomHostedDomain extends HostedDomain {
  /**
   * Whether an A Record should be created for the "root" domain
   */
  shouldCreateRootARecord: boolean
  /**
   * Hosted zone attributes for adding record sets to
   */
  hostedZoneAttributes: HostedZoneAttributes
}

interface EmailSenderProps {
  /**
   * The name of the email sender, e.g "Data Locker"
   */
  name: string
  /**
   * The address of the email sender, e.g "notifications@datalocker.com"
   */
  address: string
  /**
   * The account the SES identity is located in, e.g. "111111111111"
   * Defaults to current account
   */
  accountId?: string
  /**
   * The region the SES identity is located in, e.g. "us-east-1"
   * Defaults to current region
   */
  region?: string
}

export interface Props extends StackProps {
  /**
   * The name of the user pool
   */
  userPoolName: string
  /**
   * Details for how to send emails - this will resolve to an SES identity and must be preconfigured
   */
  emailSender?: EmailSenderProps
  /**
   * Configuration for the custom domain for Cognito Hosted UI
   */
  customDomain?: CustomHostedDomain
}

export class AuthStack extends Stack {
  public userPoolId: string
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)
    const { userPoolName, emailSender, customDomain } = props

    // create the user pool
    const { userPool } = this.addUserPool(userPoolName, emailSender)
    this.userPoolId = userPool.userPoolId

    // attach the custom domain
    if (customDomain) {
      this.addCustomDomain(userPool, customDomain)
    }

    // SNS Topics for SES Bounce Event
    new Topic(this, 'SesBounceTopic', {
      displayName: 'Bounce notifications topic',
    })

    // SNS Topics for SES Complaint Event
    new Topic(this, 'SesComplaintsTopic', {
      displayName: 'Complaints notifications topic',
    })

    // SNS Topics for SES Delivery Event
    new Topic(this, 'SesDeliveryTopic', {
      displayName: 'Delivery Notifications topic',
    })
  }

  /**
   * Configure and add the user pool resource
   * @param userPoolName The name of the user pool
   * @param emailSender Details on how to send emails (optional)
   */
  private addUserPool(userPoolName: string, emailSender?: EmailSenderProps) {
    const userPool = new UserPool(this, 'UserPool', {
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      signInAliases: {
        email: true,
      },
      emailSettings: emailSender
        ? {
            from: `${emailSender.name} <${emailSender.address}>`,
          }
        : undefined,
      userVerification: {
        emailStyle: VerificationEmailStyle.CODE,
        emailSubject: 'Data Locker - Please verify your email',
      },
      selfSignUpEnabled: true,
      passwordPolicy: {
        minLength: 6,
        requireDigits: true,
        requireLowercase: false,
        requireUppercase: true,
        requireSymbols: true,
      },
      standardAttributes: {
        email: {
          mutable: true,
          required: true,
        },
        givenName: {
          mutable: true,
          required: true,
        },
        familyName: {
          mutable: true,
          required: true,
        },
        locale: {
          mutable: true,
          required: false,
        },
        timezone: {
          mutable: true,
          required: false,
        },
      },
      customAttributes: {
        features: new StringAttribute({
          maxLen: 255,
          mutable: true,
          minLen: 0,
        }),
      },
      signInCaseSensitive: false,
      userPoolName,
    })

    // manual override to retain the user pool
    const cfnUserPool = userPool.node.defaultChild as CfnUserPool
    cfnUserPool.applyRemovalPolicy(RemovalPolicy.RETAIN)

    // manual overrides to set the config to use a specific identity for sending emails
    if (emailSender) {
      const {
        region = this.region,
        address,
        accountId = this.account,
      } = emailSender
      cfnUserPool.addPropertyOverride(
        'EmailConfiguration.EmailSendingAccount',
        'DEVELOPER',
      )
      cfnUserPool.addPropertyOverride(
        'EmailConfiguration.SourceArn',
        `arn:aws:ses:${region}:${accountId}:identity/${address}`,
      )
    }

    return {
      userPool,
    }
  }

  /**
   * Set the Hosted UI custom domain for a user pool
   * @param userPool The user pool to configure
   * @param customDomain Details on the custom domain to configure
   */
  private addCustomDomain(
    userPool: UserPool,
    customDomain: CustomHostedDomain,
  ) {
    // read out configuration
    const {
      domain,
      certificateArn,
      shouldCreateRootARecord,
      hostedZoneAttributes,
    } = customDomain
    const dependencies: IDependable[] = []

    // create reference to hosted zone
    const hostedZone = HostedZone.fromHostedZoneAttributes(
      this,
      `HostedZone`,
      hostedZoneAttributes,
    )

    // add root A record if needed
    if (shouldCreateRootARecord) {
      const rootDomain = domain.split('.', 1)[1]
      const rootDomainBucket = new Bucket(this, 'RootHostingBucket', {
        bucketName: rootDomain,
        publicReadAccess: true,
        websiteRedirect: {
          hostName: domain,
          protocol: RedirectProtocol.HTTPS,
        },
      })
      const rootAliasRecord = new ARecord(this, `RootAliasRecord`, {
        zone: hostedZone,
        recordName: rootDomain,
        target: RecordTarget.fromAlias(
          new BucketWebsiteTarget(rootDomainBucket),
        ),
      })
      rootAliasRecord.node.addDependency(rootDomainBucket)
      dependencies.push(rootAliasRecord)
    }

    // get reference to cerificate
    const certificate = Certificate.fromCertificateArn(
      this,
      `UserPoolCertificate`,
      certificateArn,
    )

    // add domain to user pool
    const userPoolDomain = userPool.addDomain('HostedDomain', {
      customDomain: {
        certificate,
        domainName: domain,
      },
    })
    userPoolDomain.node.addDependency(...dependencies)

    // create A record for custom domain
    new ARecord(this, `CustomDomainAliasRecord`, {
      zone: hostedZone,
      recordName: domain,
      target: RecordTarget.fromAlias(
        new MinimalCloudFrontTarget(this, userPoolDomain.cloudFrontDomainName),
      ),
    })
  }
}