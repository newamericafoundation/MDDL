import {
  ISecurityGroup,
  IVpc,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from '@aws-cdk/aws-ec2'
import {
  AccountRootPrincipal,
  AnyPrincipal,
  PolicyStatement,
} from '@aws-cdk/aws-iam'
import { IKey, Key } from '@aws-cdk/aws-kms'
import { CfnDBCluster, CfnDBSubnetGroup } from '@aws-cdk/aws-rds'
import {
  Construct,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from '@aws-cdk/core'
import { Secret } from '@aws-cdk/aws-secretsmanager'
import path = require('path')
import {
  Code,
  Function,
  IFunction,
  LayerVersion,
  Runtime,
} from '@aws-cdk/aws-lambda'
import { ProvidedKeyDetails } from './provided-key'

export interface Props extends StackProps {
  /**
   * VPC configuration
   */
  vpcConfig?: {
    /**
     * The CIDR block for the VPC
     * @default 10.0.0.0/16
     */
    cidrBlock?: string

    /**
     * The maximum AZ's the VPC should set up in
     * @default 2
     */
    maxAzs?: number

    /**
     * The number of NAT gateways to create for the VPC private subnets to use
     * @default 2
     */
    natGatewaysCount?: number
  }

  /**
   * Configuration for the RDS cluster
   */
  rdsConfig?: {
    /**
     * The number of days backups should be kept
     * @default 30
     */
    backupRetentionDays?: number

    /**
     * The minimum RDS Aurora Serverless capacity
     * @default 1
     */
    minCapacity?: number

    /**
     * The maximum RDS Aurora Serverless capacity
     * @default 8
     */
    maxCapacity?: number
  }

  /**
   * KMS key to use instead of generating a specific one for this stack.
   * Please see the readme for how to configure this key.
   */
  providedKmsKey?: ProvidedKeyDetails
}

export class DataStoreStack extends Stack {
  public vpc: IVpc
  public rdsAccessSecurityGroup: ISecurityGroup
  public createDbUserFunction: IFunction
  public rdsEndpoint: string

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    // read out config and set defaults
    const { vpcConfig = {}, rdsConfig = {}, providedKmsKey } = props
    const {
      cidrBlock = '10.0.0.0/16',
      maxAzs = 2,
      natGatewaysCount = 2,
    } = vpcConfig
    const {
      backupRetentionDays = 30,
      minCapacity = 1,
      maxCapacity = 8,
    } = rdsConfig

    let kmsKey: IKey
    if (providedKmsKey) {
      // import key
      kmsKey = Key.fromKeyArn(this, 'ProvidedKey', providedKmsKey.keyArn)
    } else {
      // create new KMS key for the data store to use
      kmsKey = new Key(this, 'Key', {
        description: `KMS Key for ${this.stackName} stack`,
        enableKeyRotation: true,
      })

      // allow RDS to use the KMS key
      // https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.Keys.html
      kmsKey.addToResourcePolicy(
        new PolicyStatement({
          actions: ['kms:Decrypt', 'kms:GenerateDataKey*'],
          resources: ['*'],
          principals: [new AnyPrincipal()],
          conditions: {
            StringEquals: {
              'kms:ViaService': `rds.${this.region}.amazonaws.com`,
              'kms:CallerAccount': this.account,
            },
          },
        }),
      )
    }

    // create the VPC
    this.vpc = new Vpc(this, 'Vpc', {
      cidr: cidrBlock,
      maxAzs: maxAzs,
      enableDnsHostnames: false,
      enableDnsSupport: true,
      natGateways: natGatewaysCount,
      subnetConfiguration: [
        {
          cidrMask: 28,
          name: 'isolated',
          subnetType: SubnetType.ISOLATED,
        },
        {
          cidrMask: 28,
          name: 'private',
          subnetType: SubnetType.PRIVATE,
        },
        {
          cidrMask: 28,
          name: 'public',
          subnetType: SubnetType.PUBLIC,
        },
      ],
    })

    // create the root DB credentials
    const rdsRootCredentialsSecret = new Secret(
      this,
      'RdsClusterCredentialsSecret',
      {
        secretName: `${this.stackName}-rds-root-credentials`,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
            username: 'root',
          }),
          excludePunctuation: true,
          includeSpace: false,
          generateStringKey: 'password',
          excludeCharacters: '"@/\\',
          passwordLength: 30,
        },
        encryptionKey: kmsKey,
      },
    )

    // configure RDS subnet group
    const rdsSubnetGroup = new CfnDBSubnetGroup(this, 'RdsSubnetGroup', {
      dbSubnetGroupDescription: `Subnet group for RDS ${this.stackName}`,
      subnetIds: this.vpc.isolatedSubnets.map((s) => s.subnetId),
    })

    // configure RDS security group
    const rdsSecurityGroup = new SecurityGroup(this, 'RdsSecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: false,
      description: `${this.stackName} security group for RDS`,
    })

    // create the DB cluster
    const rdsPort = 3306
    const databaseName = 'root'
    const rdsCluster = new CfnDBCluster(this, 'RdsCluster', {
      engineMode: 'serverless',
      engine: 'aurora-mysql',
      engineVersion: '5.7.mysql_aurora.2.07.1',
      enableHttpEndpoint: true,
      databaseName,
      kmsKeyId: kmsKey.keyId,
      masterUsername: rdsRootCredentialsSecret
        .secretValueFromJson('username')
        .toString(),
      masterUserPassword: rdsRootCredentialsSecret
        .secretValueFromJson('password')
        .toString(),
      backupRetentionPeriod: backupRetentionDays,
      scalingConfiguration: {
        maxCapacity,
        minCapacity,
        autoPause: false,
      },
      deletionProtection: true,
      dbSubnetGroupName: rdsSubnetGroup.ref,
      dbClusterParameterGroupName: 'default.aurora-mysql5.7',
      // The following three lines cause errors on updates, so they are commented out.
      //  If you need custom values for them, uncomment before first deployment.
      // preferredMaintenanceWindow: maintenanceWindowWeekly,
      // preferredBackupWindow: backupWindowDaily,
      // port: rdsPort,
      storageEncrypted: true,
      vpcSecurityGroupIds: [rdsSecurityGroup.securityGroupId],
    })
    rdsCluster.applyRemovalPolicy(RemovalPolicy.SNAPSHOT)
    rdsCluster.node.addDependency(this.vpc, kmsKey)
    this.rdsEndpoint = rdsCluster.attrEndpointAddress

    // add database networking
    this.rdsAccessSecurityGroup = new SecurityGroup(
      this,
      'RdsAccessSecurityGroup',
      {
        vpc: this.vpc,
        description: `${this.stackName} security group for RDS Access`,
      },
    )
    rdsSecurityGroup.addIngressRule(
      this.rdsAccessSecurityGroup,
      Port.tcp(rdsPort),
    )
    rdsSecurityGroup.addEgressRule(
      this.rdsAccessSecurityGroup,
      Port.tcp(rdsPort),
    )
    this.rdsAccessSecurityGroup.addIngressRule(
      rdsSecurityGroup,
      Port.tcp(rdsPort),
    )

    const { layer: mysqlLayer } = this.addMysqlLayer()

    // configure function used by the city stacks to create a new DB and user within this cluster
    this.createDbUserFunction = new Function(this, 'CreateDbUserFunction', {
      code: Code.fromAsset(path.join('build', 'create-db-and-user.zip')),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_12_X,
      vpc: this.vpc,
      timeout: Duration.seconds(60),
      securityGroups: [this.rdsAccessSecurityGroup],
      layers: [mysqlLayer],
      environment: {
        DB_HOST: rdsCluster.attrEndpointAddress,
        DB_USER: rdsRootCredentialsSecret
          .secretValueFromJson('username')
          .toString(),
        DB_PASSWORD: rdsRootCredentialsSecret
          .secretValueFromJson('password')
          .toString(),
        DB_DEFAULT_DATABASE: databaseName,
      },
    })
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
}
