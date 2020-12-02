import { App, Construct, Stack, StackProps } from '@aws-cdk/core'
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
import { PolicyStatement, User } from '@aws-cdk/aws-iam'
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

interface Stage1Configuration {
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
   * Deployment Stage 1 configuration.
   * This stage will include the "base" stacks (Data Store and Auth if required), a "Develop" City stack, and any QA related tasks.
   * We keep these to a single stage so that the base stacks cannot change until the QA tasks are completed (passed/failed)
   */
  stage1Configuration: Stage1Configuration

  /**
   * Deployment Stage 2 configuration.
   * This stage only includes further City stages that can be deployed sequentially after Deployment Stage 1 is completed
   */
  stage2Configuration?: CityStageActions
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
    } = this.createCodePipeline(buildsBucket)

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
  private createCodePipeline(bucket: IBucket) {
    // create artifacts
    const sourceArtifact = new Artifact()
    const cloudAssemblyArtifact = new Artifact('cloudAssembly')

    // create base pipeline
    const codePipeline = new Pipeline(this, 'Pipeline', {
      restartExecutionOnUpdate: true,
    })

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
    const { stage1Configuration, stage2Configuration } = props
    const {
      authStackProps,
      dataStoreStackProps,
      cityStacksProps: stage1CityStacksProps = [],
    } = stage1Configuration

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
    const stage1 = cdkPipeline.addStage('DeploymentStage1')
    const baseStackOptions = this.addStack(
      stage1,
      this.getStack(cloudAssembly, dataStoreStackProps),
    )
    if (authStackProps) {
      this.addStack(
        stage1,
        this.getStack(cloudAssembly, authStackProps),
        baseStackOptions,
      )
    }
    const numberOfBaseActions = stage1.nextSequentialRunOrder()
    stage1CityStacksProps.forEach((cityStackProps) =>
      addCityStackToStage(stage1, cityStackProps),
    )

    // Add and configure deployment stage 2
    // this is generally "higher" environments such as Staging (for non-production) or Production
    if (stage2Configuration) {
      // read out stage 2 config
      const { cityStacksProps: stage2CityStacksProps } = stage2Configuration

      // create stage 2
      const stage2 = cdkPipeline.addStage('DeploymentStage2')
      let currentRunOrder = stage2.nextSequentialRunOrder()
      while (currentRunOrder < numberOfBaseActions) {
        currentRunOrder = stage2.nextSequentialRunOrder()
      }

      // add manual approval
      stage2.addActions(
        new ManualApprovalAction({
          actionName: `ApproveDeploymentStage2`,
          additionalInformation: `Approve to continue deployment to stage 2 environments.`,
          runOrder: stage2.nextSequentialRunOrder(),
        }),
      )

      // calculate options to execute deployments in parallel
      const runOrder = stage2.nextSequentialRunOrder()
      const approvalOrder = stage2.nextSequentialRunOrder()
      const executeRunOrder = stage2.nextSequentialRunOrder()
      const parallelOptions: AddStackOptions = {
        runOrder,
        executeRunOrder,
      }

      // add each city to the current stage
      stage2CityStacksProps.forEach((cityStackProps) => {
        addCityStackToStage(stage2, cityStackProps, parallelOptions)
      })

      // add manual approval action in change set calculation and execution
      stage2.addActions(
        new ManualApprovalAction({
          actionName: `ApproveChangeSetsStage2`,
          additionalInformation: `Approve to execute change sets for stage 2 environments.`,
          runOrder: approvalOrder,
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
      stage1Configuration,
      stage2Configuration = { cityStacksProps: [] },
    } = props
    const { cityStacksProps: stage1CityStacks = [] } = stage1Configuration
    const { cityStacksProps: stage2CityStacks } = stage2Configuration
    return [...stage1CityStacks, ...stage2CityStacks]
  }

  /**
   * Create a CDK app from a pipeline config by dynamically adding stacks to it
   * @param props The pipeline config which determines stacks that are in the app
   * @param app The CDK app to use (optional - will create a new one if not provided)
   */
  public static buildApp(props: Props, app = new App()) {
    // read out configuration
    const { stage1Configuration } = props
    const { authStackProps, dataStoreStackProps } = stage1Configuration
    const cityStacksProps = CiCdStack.getCityStacksProps(props)
    const createdStacks: { name: string; stack: Stack }[] = []

    // add auth stack
    let authStack: AuthStack | undefined = undefined
    if (authStackProps) {
      authStack = new AuthStack(app, authStackProps.name, authStackProps.props)
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

    // add all city stacks
    cityStacksProps.map((stackProps) => {
      const { name, props } = stackProps
      const stack = new CityStack(app, name, {
        authStack: props.expectsAuthStack ? authStack : undefined,
        ...props,
        dataStoreStack,
      })
      createdStacks.push({ name, stack })
    })

    return { app, createdStacks }
  }
}
