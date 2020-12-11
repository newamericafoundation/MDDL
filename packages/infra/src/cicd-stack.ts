import {
  App,
  Construct,
  DefaultStackSynthesizer,
  Stack,
  StackProps,
} from '@aws-cdk/core'
import {
  DataStoreStack,
  Props as DataStoreStackProps,
} from './data-store-stack'
import { AuthStack, Props as AuthStackProps } from './auth-stack'
import { CityStack, Props as CityStackProps } from './city-stack'
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline'
import {
  CodeBuildAction,
  ManualApprovalAction,
  S3DeployAction,
  S3SourceAction,
} from '@aws-cdk/aws-codepipeline-actions'
import { AddStackOptions, CdkPipeline, CdkStage } from '@aws-cdk/pipelines'
import { CloudAssembly, CloudFormationStackArtifact } from '@aws-cdk/cx-api'
import {
  Bucket,
  BucketEncryption,
  EventType,
  IBucket,
  BlockPublicAccess,
} from '@aws-cdk/aws-s3'
import { LambdaDestination } from '@aws-cdk/aws-s3-notifications'
import { BuildSpec, Project } from '@aws-cdk/aws-codebuild'
import { Runtime, Function, Code } from '@aws-cdk/aws-lambda'
import { PolicyStatement, Role, User } from '@aws-cdk/aws-iam'
import { CfnNotificationRule } from '@aws-cdk/aws-codestarnotifications'
import path = require('path')

interface StackConfiguration<T extends StackProps> {
  /**
   * The local name for the stack configuration. If `props.stackName` is not supplied, this is used as the stack name
   */
  name: string

  /**
   * The props for the stack
   */
  props: T
}

interface CityStageActions {
  /**
   * An array of city stacks to be deployed. Array order enforces deployment order.
   */
  cityStacksProps: StackConfiguration<CityStackProps>[]
}

interface IntegratedStageConfiguration {
  /**
   * The configuration for the Auth Stack
   */
  authStackProps?: StackConfiguration<AuthStackProps>

  /**
   * The configuration for the Data Store Stack
   */
  dataStoreStackProps: StackConfiguration<DataStoreStackProps>

  /**
   * An array of city stacks to be deployed. Array order enforces deployment order.
   */
  cityStacksProps?: StackConfiguration<CityStackProps>[]
}

interface CityStackArtifactBuildConfiguration {
  /**
   * The name of the artifact
   */
  name: string

  /**
   * Environment variables to build the artifact with
   */
  env: {
    [index: string]: string
  }

  /**
   * The path in the static assets bucket to transfer files such as the logo from during build time
   */
  staticAssetsPath?: string
}

export interface Props extends StackProps {
  /**
   * The SNS topic to deliver pipeline notifications to
   */
  pipelineNotificationsSnsTopicArn?: string
  /**
   * Development Deployment configuration.
   * This stage will include the "base" stacks for develop (Data Store and Auth), a "Develop" City stack, and any QA related tasks.
   * We keep these to a single stage so that the base stacks cannot change until the QA tasks are completed (passed/failed)
   */
  developStageConfiguration: IntegratedStageConfiguration

  /**
   * Staging Deployment configuration.
   * This stage only includes further City stages that can be deployed after Development Deployment Stage is completed
   */
  stagingStageConfiguration?: CityStageActions

  /**
   * Production Deployment configuration.
   * This stage will include the "base" stacks for production (Data Store and Auth if required), and all Production City stacks.
   */
  prodStageConfiguration?: IntegratedStageConfiguration
}

const getCrossAccountDeployRoleArn = (
  partition: string,
  accountId: string,
  region: string,
) => {
  return `arn:${partition}:iam::${accountId}:role/cdk-${DefaultStackSynthesizer.DEFAULT_QUALIFIER}-deploy-role-${accountId}-${region}`
}

export class CiCdStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    // create bucket that hosts builds uploaded from source control
    const { bucket: buildsBucket } = this.createBuildsBucket()

    // create bucket to hold city specific static assets that will be loaded to '/static' at build time
    const { bucket: staticAssetsBucket } = this.createStaticAssetsBucket()

    // create user that has access to upload a build
    this.createCiCdUser(buildsBucket)

    // create the base code pipeline
    const {
      cloudAssemblyArtifact,
      codePipeline,
      sourceArtifact,
    } = this.createCodePipeline(
      buildsBucket,
      props.pipelineNotificationsSnsTopicArn,
    )

    // create the CDK pipeline components
    this.createCdkPipeline(
      props,
      cloudAssemblyArtifact,
      codePipeline,
      sourceArtifact,
      staticAssetsBucket,
    )
  }

  /**
   * Create the user record that is used to upload builds to the builds bucket
   * @param bucket The builds bucket
   */
  private createCiCdUser(bucket: Bucket) {
    // create user record
    const cicdUser = new User(this, 'CiCdUser', {
      userName: 'cicd',
    })

    // add permissions
    cicdUser.addToPolicy(
      new PolicyStatement({
        resources: [bucket.arnForObjects('builds/*.zip')],
        actions: ['s3:PutObject'],
      }),
    )

    return { cicdUser }
  }

  private createStaticAssetsBucket() {
    // create the bucket
    return {
      bucket: new Bucket(this, 'StaticAssetsBucket', {
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        versioned: true,
        encryption: BucketEncryption.S3_MANAGED,
      }),
    }
  }

  /**
   * Create the bucket for housing builds that trigger the pipeline
   */
  private createBuildsBucket() {
    // create the bucket
    const buildsBucket = new Bucket(this, 'BuildBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      encryption: BucketEncryption.S3_MANAGED,
    })

    // create the notification handler for when a new build is put in the "/builds" bucket
    const handler = new Function(this, 'BuildBucketNotificationLambda', {
      code: Code.fromAsset(path.join('build', 'builds-bucket-event.zip')),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_12_X,
    })

    // allow handler to execute a copy within S3
    handler.addToRolePolicy(
      new PolicyStatement({
        actions: [
          's3:GetObject',
          's3:GetObjectTagging',
          's3:PutObject',
          's3:PutObjectTagging',
        ],
        resources: [`${buildsBucket.bucketArn}/*`],
      }),
    )

    // allow handler to list the bucket
    handler.addToRolePolicy(
      new PolicyStatement({
        actions: ['s3:ListBucket'],
        resources: [buildsBucket.bucketArn],
      }),
    )

    // subscribe to files that look like 'builds/*.zip'
    buildsBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(handler),
      {
        suffix: '.zip',
        prefix: 'builds/',
      },
    )

    return {
      bucket: buildsBucket,
    }
  }

  /**
   * Create the Code Build project to build the CDK assets
   */
  private createBuildCloudAssemblyProject() {
    // create the project
    const project = new Project(this, 'BuildCloudAssemblyProject', {
      buildSpec: BuildSpec.fromObject({
        version: 0.2,
        env: {
          'exported-variables': ['BUILD_NUMBER'],
        },
        phases: {
          install: {
            'runtime-versions': {
              python: 3.7,
              nodejs: 12,
            },
            commands: ['yarn install --frozen-lockfile'],
          },
          build: {
            commands: [
              'BUILD_NUMBER=$(cat build-details.json | python -c "import sys, json; print(json.load(sys.stdin)[\'buildNumber\'])")',
              'yarn build',
              'yarn infra cdk synth',
            ],
          },
        },
        artifacts: {
          files: '**/*',
          'base-directory': 'packages/infra/cdk.out',
        },
      }),
    })

    // permissions to fetch context, e.g. AZ's for VPC
    project.addToRolePolicy(
      new PolicyStatement({
        actions: ['ec2:Describe*', 'ec2:Get*'],
        resources: ['*'],
      }),
    )

    return { project }
  }

  /**
   * Create the Code Build project to create FE builds
   * @param cityBuildArgs Array of city builds to run
   */
  private createBuildWebAppsProject(
    cityBuildArgs: CityStackArtifactBuildConfiguration[],
    staticAssetsBucket: Bucket,
  ) {
    // declare the artifact config
    const artifactConfig: {
      [index: string]: {
        files: string[] | string
        name: string
        'discard-paths'?: 'no' | 'yes'
        'base-directory'?: string
      }
    } = {}

    // initialise our build commands
    const buildCommands: string[] = []

    // for each city stack
    cityBuildArgs.forEach((cba, index) => {
      // create the secondary artifact config
      const artifactName = this.getFrontendArtifactName(cba.name)
      artifactConfig[artifactName] = {
        files: '**/*',
        name: artifactName,
        'base-directory': `packages/frontend/dist/${cba.name}`,
      }

      // build the .env file contents
      const envFileContents = Object.entries(cba.env)
        .map((entry) => `${entry[0]}=${entry[1]}`)
        .join('\n')
        .replace(/[\\"']/g, '\\$&')

      // write the .env file and package the build for the environment
      buildCommands.push(
        'BUILD_NUMBER=$(cat build-details.json | python -c "import sys, json; print(json.load(sys.stdin)[\'buildNumber\'])")',
        `echo "${envFileContents}\nBUILD_NUMBER=$BUILD_NUMBER\nBUILD_TIME=$CODEBUILD_START_TIME\nBUILD_ENVIRONMENT=${cba.name}" > packages/frontend/.env`,
      )
      if (cba.staticAssetsPath) {
        buildCommands.push(
          `aws s3 sync s3://$STATIC_ASSETS_BUCKET/${cba.staticAssetsPath} packages/frontend/static`,
        )
      }
      buildCommands.push(
        `OUTPUT_DIR=${cba.name} yarn fe generate${
          index !== 0 ? ' --no-build' : ''
        }`,
      )
    })

    // create the project
    const project = new Project(this, 'BuildWebAppsProject', {
      environmentVariables: {
        STATIC_ASSETS_BUCKET: {
          value: staticAssetsBucket.bucketName,
        },
      },
      buildSpec: BuildSpec.fromObject({
        version: 0.2,
        phases: {
          install: {
            'runtime-versions': {
              python: 3.7,
              nodejs: 12,
            },
            commands: ['yarn install --frozen-lockfile'],
          },
          build: {
            commands: buildCommands,
          },
        },
        artifacts: {
          files: '**/*',
          'secondary-artifacts': artifactConfig,
        },
      }),
    })
    project.addToRolePolicy(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [staticAssetsBucket.arnForObjects('*')],
      }),
    )
    project.addToRolePolicy(
      new PolicyStatement({
        actions: ['s3:ListBucket'],
        resources: [staticAssetsBucket.bucketArn],
      }),
    )

    return { project }
  }

  /**
   * Create the CodePipeline pipeline and add base stages and actions
   * @param bucket The builds source bucket
   */
  private createCodePipeline(
    bucket: IBucket,
    pipelineNotificationsSnsTopicArn: string | undefined,
  ) {
    // create artifacts
    const sourceArtifact = new Artifact()
    const cloudAssemblyArtifact = new Artifact('cloudAssembly')

    // create base pipeline
    const codePipeline = new Pipeline(this, 'Pipeline', {
      restartExecutionOnUpdate: true,
    })

    // add notifications
    if (pipelineNotificationsSnsTopicArn) {
      new CfnNotificationRule(this, 'NotificationRule', {
        name: `${this.stackName}PipelineNotifications`,
        detailType: 'FULL',
        resource: codePipeline.pipelineArn,
        eventTypeIds: [
          'codepipeline-pipeline-pipeline-execution-failed',
          'codepipeline-pipeline-pipeline-execution-canceled',
          'codepipeline-pipeline-pipeline-execution-started',
          'codepipeline-pipeline-pipeline-execution-resumed',
          'codepipeline-pipeline-pipeline-execution-succeeded',
          'codepipeline-pipeline-manual-approval-needed',
        ],
        targets: [
          {
            targetType: 'SNS',
            targetAddress: pipelineNotificationsSnsTopicArn,
          },
        ],
      })
    }

    // create the CodeBuild project that will run the build job
    const { project } = this.createBuildCloudAssemblyProject()

    // add the source stage with s3 source action
    codePipeline.addStage({
      stageName: 'Source',
      actions: [
        new S3SourceAction({
          bucket,
          bucketKey: 'source.zip',
          actionName: 'Source',
          output: sourceArtifact,
        }),
      ],
    })

    // add the build stage with codebuild project and CDK artifact
    codePipeline.addStage({
      stageName: 'Build',
      actions: [
        new CodeBuildAction({
          actionName: 'Build',
          project: project,
          variablesNamespace: 'Build',
          input: sourceArtifact,
          outputs: [cloudAssemblyArtifact],
        }),
      ],
    })

    return {
      codePipeline,
      cloudAssemblyArtifact,
      sourceArtifact,
    }
  }

  /**
   * Calculate the frontend build name for a city stack
   * @param cityName The city name
   */
  private getFrontendArtifactName(cityName: string) {
    return cityName + '_frontend'
  }

  /**
   * Create the CDK Pipeline on top of the existing codePipeline and add the stacks outlined in config
   * @param props The pipeline config which determines stacks to be deployed
   * @param cloudAssemblyArtifact The artifact which contains the cloud assembly to be deployed
   * @param codePipeline The CodePipeline pipeline
   * @param sourceArtifact The source code artifact
   */
  private createCdkPipeline(
    props: Props,
    cloudAssemblyArtifact: Artifact,
    codePipeline: Pipeline,
    sourceArtifact: Artifact,
    staticAssetsBucket: Bucket,
  ) {
    // synthesize the cloud assembly
    const { app, createdStacks } = CiCdStack.buildApp(props)
    const cloudAssembly = app.synth()

    // read out configuration to consts
    const {
      developStageConfiguration,
      stagingStageConfiguration,
      prodStageConfiguration,
    } = props
    const {
      authStackProps: nonProdAuthStackProps,
      dataStoreStackProps: nonProdDataStoreStackProps,
      cityStacksProps: developStageCityStacksProps = [],
    } = developStageConfiguration

    // determine city stacks that will need to be built, and their args
    const cityStacks = CiCdStack.getCityStacksProps(props)
    const cityBuildArgs = cityStacks.map(
      (cs): CityStackArtifactBuildConfiguration => ({
        name: cs.name,
        staticAssetsPath: cs.props.staticAssetsPath,
        env: {
          ...cs.props.webAppBuildVariables,
          AGENCY_EMAIL_DOMAINS_WHITELIST:
            cs.props.agencyEmailDomainsWhitelist?.join(',') ?? '',
        },
      }),
    )

    // create artifacts for each one
    const cityBuildArtifacts = cityStacks.map(
      (cs) => new Artifact(this.getFrontendArtifactName(cs.name)),
    )

    // create lambda function to add city stack to the stage
    // this is a lambda rather than a function so we can use the consts defined above
    const addCityStackToStage = (
      stage: CdkStage,
      cityStackProps: StackConfiguration<CityStackProps>,
      options?: AddStackOptions | undefined,
    ) => {
      // read out config and find city's CloudFormationStackArtifact
      const { name } = cityStackProps
      const cityStack = this.getStack(cloudAssembly, cityStackProps)

      // find the synthesized stack for the city
      const stack = createdStacks.find((s) => s.name == name)
      if (!stack) {
        throw new Error('Stack for ' + name + ' not found!')
      }
      const synthesizedStack = stack.stack as CityStack

      // get the frontend build artifact for the city
      const artifact = cityBuildArtifacts.find(
        (cba) => cba.artifactName == this.getFrontendArtifactName(name),
      )
      if (!artifact) {
        throw new Error(
          'Artifact for frontend build of ' + name + ' not found!',
        )
      }

      // add the stack to the stage
      this.addStack(stage, cityStack, options)
      const s3DeployRunOrder =
        options && options.executeRunOrder
          ? options.executeRunOrder + 1
          : stage.nextSequentialRunOrder()

      // add action to deploy the frontend web app to its bucket
      stage.addActions(
        new S3DeployAction({
          actionName: `${name}.WebAppDeploy`,
          input: artifact,
          bucket: Bucket.fromBucketName(
            this,
            name + 'WebAppBucket',
            synthesizedStack.bucketNames['WebApp'],
          ),
          runOrder: s3DeployRunOrder,
          role: Role.fromRoleArn(
            this,
            `${name}.WebAppDeployRole`,
            getCrossAccountDeployRoleArn(
              this.partition,
              cityStack.environment.account,
              cityStack.environment.region,
            ),
          ),
        }),
      )
    }

    // create CDK pipeline
    const cdkPipeline = new CdkPipeline(this, 'CdkPipeline', {
      cloudAssemblyArtifact,
      codePipeline,
    })

    // create the CodeBuild project that will build the web apps
    // we do this in a single project so that all dependencies are the same across outputs
    const { project } = this.createBuildWebAppsProject(
      cityBuildArgs,
      staticAssetsBucket,
    )

    // add the build stage with codebuild project and all artifacts
    codePipeline.addStage({
      stageName: 'BuildWebApps',
      actions: [
        new CodeBuildAction({
          actionName: 'Build',
          project: project,
          input: sourceArtifact,
          outputs: cityBuildArtifacts,
        }),
      ],
    })

    // Add and configure deployment stage 1
    // Data Store Stack, Auth Stack and any "lower" environments such as DEV
    const developStage = cdkPipeline.addStage('DevelopDeploymentStage')
    const developBaseStackOptions = this.addStack(
      developStage,
      this.getStack(cloudAssembly, nonProdDataStoreStackProps),
    )
    if (nonProdAuthStackProps) {
      this.addStack(
        developStage,
        this.getStack(cloudAssembly, nonProdAuthStackProps),
        developBaseStackOptions,
      )
    }
    const numberOfBaseActions = developStage.nextSequentialRunOrder()
    developStageCityStacksProps.forEach((cityStackProps) =>
      addCityStackToStage(developStage, cityStackProps),
    )

    // Add and configure deployment stage 2
    // this is generally "higher" environments such as Staging (for non-production) or Production
    if (stagingStageConfiguration) {
      // read out stage 2 config
      const {
        cityStacksProps: stage2CityStacksProps,
      } = stagingStageConfiguration

      // create stage 2
      const stagingStage = cdkPipeline.addStage('StagingDeploymentStage')
      let currentRunOrder = stagingStage.nextSequentialRunOrder()
      while (currentRunOrder < numberOfBaseActions) {
        currentRunOrder = stagingStage.nextSequentialRunOrder()
      }

      // add manual approval
      stagingStage.addActions(
        new ManualApprovalAction({
          actionName: `ApproveStagingDeploymentStage`,
          additionalInformation: `Approve to continue deployment of Build #{Build.BUILD_NUMBER} to staging environments.`,
          runOrder: stagingStage.nextSequentialRunOrder(),
        }),
      )

      // calculate options to execute deployments in parallel
      const runOrder = stagingStage.nextSequentialRunOrder()
      const approvalOrder = stagingStage.nextSequentialRunOrder()
      const executeRunOrder = stagingStage.nextSequentialRunOrder()
      const parallelOptions: AddStackOptions = {
        runOrder,
        executeRunOrder,
      }

      // add each city to the current stage
      stage2CityStacksProps.forEach((cityStackProps) => {
        addCityStackToStage(stagingStage, cityStackProps, parallelOptions)
      })

      // add manual approval action in change set calculation and execution
      stagingStage.addActions(
        new ManualApprovalAction({
          actionName: `ApproveStagingChangeSets`,
          additionalInformation: `Approve to execute change sets of Build #{Build.BUILD_NUMBER} in staging environments.`,
          runOrder: approvalOrder,
        }),
      )
    }

    if (prodStageConfiguration) {
      const {
        authStackProps: prodAuthStackProps,
        dataStoreStackProps: prodDataStoreStackProps,
        cityStacksProps: prodStageCityStacksProps = [],
      } = prodStageConfiguration

      // Add and configure production deployment stage
      const prodStage = cdkPipeline.addStage('ProductionDeploymentStage')
      // add manual approval
      prodStage.addActions(
        new ManualApprovalAction({
          actionName: `ApproveProductionDeploymentStage`,
          additionalInformation: `Approve to continue deployment of Build #{Build.BUILD_NUMBER} to production environments.`,
          runOrder: prodStage.nextSequentialRunOrder(),
        }),
      )

      // we're going to run the Data and Auth stack actions in parallel, so resolve action order now
      const preApplicationRunOrder = prodStage.nextSequentialRunOrder()
      const preApplicationApprovalOrder = prodStage.nextSequentialRunOrder()
      const preApplicationExecuteRunOrder = prodStage.nextSequentialRunOrder()
      const preApplicationParallelOptions: AddStackOptions = {
        runOrder: preApplicationRunOrder,
        executeRunOrder: preApplicationExecuteRunOrder,
      }

      // add data stack
      this.addStack(
        prodStage,
        this.getStack(cloudAssembly, prodDataStoreStackProps),
        preApplicationParallelOptions,
      )

      // add auth stack, if applicable
      if (prodAuthStackProps) {
        this.addStack(
          prodStage,
          this.getStack(cloudAssembly, prodAuthStackProps),
          preApplicationParallelOptions,
        )
      }

      // add manual approval of change sets
      prodStage.addActions(
        new ManualApprovalAction({
          actionName: `ApproveProductionDataAndAuthApplyStage`,
          additionalInformation: `Approve to apply Data Store and Auth Stack change sets from Build #{Build.BUILD_NUMBER} to production environments.`,
          runOrder: preApplicationApprovalOrder,
        }),
      )

      // we're going to run all the city stack actions in parallel, so resolve action order now
      const applicationRunOrder = prodStage.nextSequentialRunOrder()
      const applicationApprovalOrder = prodStage.nextSequentialRunOrder()
      const applicationExecuteRunOrder = prodStage.nextSequentialRunOrder()
      const applicationParallelOptions: AddStackOptions = {
        runOrder: applicationRunOrder,
        executeRunOrder: applicationExecuteRunOrder,
      }

      // add each city to the current stage
      prodStageCityStacksProps.forEach((cityStackProps) => {
        addCityStackToStage(
          prodStage,
          cityStackProps,
          applicationParallelOptions,
        )
      })

      // add manual approval action in change set calculation and execution
      prodStage.addActions(
        new ManualApprovalAction({
          actionName: `ApproveProductionCityApplyStage`,
          additionalInformation: `Approve to apply City change sets from Build #{Build.BUILD_NUMBER} in production environments.`,
          runOrder: applicationApprovalOrder,
        }),
      )
    }

    return {
      cdkPipeline,
    }
  }

  /**
   * Gets a stack in the given cloud assembly
   * @param cloudAssembly The cloud assembly to get the stack from
   * @param configuration The Stack Configuration to determine the stack name from
   */
  private getStack(
    cloudAssembly: CloudAssembly,
    configuration: StackConfiguration<StackProps>,
  ): CloudFormationStackArtifact {
    return cloudAssembly.getStackByName(
      configuration.props.stackName || configuration.name,
    )
  }

  /**
   * Adds a stack to be deployed to the given stage
   * @param stage The stage to add the actions to
   * @param stackArtifact The stack to deploy
   * @param options Options such as deployment order for the actions
   */
  private addStack(
    stage: CdkStage,
    stackArtifact: CloudFormationStackArtifact,
    options?: AddStackOptions,
  ) {
    if (!options) {
      options = {
        runOrder: stage.nextSequentialRunOrder(),
        executeRunOrder: stage.nextSequentialRunOrder(),
      }
    }
    stage.addStackArtifactDeployment(stackArtifact, options)
    return options
  }

  /**
   * Gets all the city stacks (which contain app projects that need to be built) from the pipeline configuration
   * @param props The pipeline config which determines stacks that are in the app
   */
  private static getCityStacksProps(props: Props) {
    const {
      developStageConfiguration,
      stagingStageConfiguration = { cityStacksProps: [] },
      prodStageConfiguration = { cityStacksProps: [] },
    } = props
    const {
      cityStacksProps: developStageCityStacks = [],
    } = developStageConfiguration
    const { cityStacksProps: stagingCityStacks } = stagingStageConfiguration
    const { cityStacksProps: prodCityStacks = [] } = prodStageConfiguration
    return [...developStageCityStacks, ...stagingCityStacks, ...prodCityStacks]
  }

  /**
   * Create a CDK app from a pipeline config by dynamically adding stacks to it
   * @param props The pipeline config which determines stacks that are in the app
   * @param app The CDK app to use (optional - will create a new one if not provided)
   */
  public static buildApp(props: Props, app = new App()) {
    // read out configuration
    const { developStageConfiguration, prodStageConfiguration } = props
    const cityStacksProps = CiCdStack.getCityStacksProps(props)
    const createdStacks: { name: string; stack: Stack }[] = []
    const integratedConfigs = [developStageConfiguration]
    if (prodStageConfiguration) {
      integratedConfigs.push(prodStageConfiguration)
    }

    for (const integratedConfig of integratedConfigs) {
      const { authStackProps, dataStoreStackProps } = integratedConfig

      // add auth stack
      if (authStackProps) {
        const authStack = new AuthStack(
          app,
          authStackProps.name,
          authStackProps.props,
        )
        createdStacks.push({ name: authStackProps.name, stack: authStack })
      }

      // add data store stack
      const dataStoreStack = new DataStoreStack(
        app,
        dataStoreStackProps.name,
        dataStoreStackProps.props,
      )
      createdStacks.push({
        name: dataStoreStackProps.name,
        stack: dataStoreStack,
      })
    }

    // add all city stacks
    cityStacksProps.map((stackProps) => {
      const { name, props } = stackProps

      // find auth stack, if any
      const authStack = props.authStackName
        ? (createdStacks.find((cs) => cs.name == props.authStackName)
            ?.stack as AuthStack)
        : undefined

      // find data store stack
      const dataStoreStack = createdStacks.find(
        (cs) => cs.name == props.dataStoreStackName,
      )?.stack as DataStoreStack

      // add stack
      const stack = new CityStack(app, name, {
        ...props,
        authStack,
        dataStoreStack,
      })
      createdStacks.push({ name, stack })
    })

    return { app, createdStacks }
  }
}
