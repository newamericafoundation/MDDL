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
  CfnUserPoolUICustomizationAttachment,
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
import path = require('path')
import fs = require('fs')
import { EmailSender } from './email-sender'
import { getCognitoHostedLoginCss } from './utils'

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

export interface Props extends StackProps {
  /**
   * The name of the user pool
   */
  userPoolName: string
  /**
   * Details for how to send emails - this will resolve to an SES identity and must be preconfigured
   */
  emailSender?: EmailSender
  /**
   * Configuration for the custom domain for Cognito Hosted UI
   */
  customDomain?: CustomHostedDomain
}

export class AuthStack extends Stack {
  /**
   * The ID of the User Pool
   */
  public userPoolId: string

  /**
   * The URL of the hosted authentication pages
   */
  public authUrl: string
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)
    const { userPoolName, emailSender, customDomain } = props

    // create the user pool
    const { userPool } = this.addUserPool(userPoolName, emailSender)
    this.userPoolId = userPool.userPoolId

    // attach the custom domain
    if (customDomain) {
      this.addCustomDomain(userPool, customDomain)
      this.authUrl = `https://${customDomain.domain}`
    } else {
      this.authUrl = userPool.userPoolProviderUrl
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
  private addUserPool(userPoolName: string, emailSender?: EmailSender) {
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
        emailStyle: VerificationEmailStyle.LINK,
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
      const { address } = emailSender
      cfnUserPool.addPropertyOverride(
        'EmailConfiguration.EmailSendingAccount',
        'DEVELOPER',
      )
      cfnUserPool.addPropertyOverride(
        'EmailConfiguration.SourceArn',
        `arn:aws:ses:${this.region}:${this.account}:identity/${address}`,
      )
    }

    // CSS for hosted login
    new CfnUserPoolUICustomizationAttachment(
      this,
      'UserPoolUICustomizationAttachment',
      {
        clientId: 'ALL',
        userPoolId: userPool.userPoolId,
        css: getCognitoHostedLoginCss(),
      },
    )

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
