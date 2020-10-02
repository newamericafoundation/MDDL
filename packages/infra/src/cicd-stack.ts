import { App, Construct, Stack, StackProps } from '@aws-cdk/core'
import {
  DataStoreStack,
  Props as DataStoreStackProps
} from './data-store-stack'
import { AuthStack, Props as AuthStackProps } from './auth-stack'
import { CityStack, Props as CityStackProps } from './city-stack'
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline'
import {
  CodeBuildAction,
  ManualApprovalAction,
  S3DeployAction,
  S3SourceAction
} from '@aws-cdk/aws-codepipeline-actions'
import { AddStackOptions, CdkPipeline, CdkStage } from '@aws-cdk/pipelines'
import { CloudAssembly, CloudFormationStackArtifact } from '@aws-cdk/cx-api'
import {
  Bucket,
  BucketEncryption,
  EventType,
  IBucket,
  BlockPublicAccess
} from '@aws-cdk/aws-s3'
import { LambdaDestination } from '@aws-cdk/aws-s3-notifications'
import { BuildSpec, Project } from '@aws-cdk/aws-codebuild'
import { Runtime } from '@aws-cdk/aws-lambda'
import { PolicyStatement, User } from '@aws-cdk/aws-iam'
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'
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
    const { bucket } = this.createBuildsBucket()

    // create user that has access to upload a build
    this.createCiCdUser(bucket)

    // create the base code pipeline
    const {
      cloudAssemblyArtifact,
      codePipeline,
      cityBuildArtifacts
    } = this.createCodePipeline(props, bucket)

    // create the CDK pipeline components
    this.createCdkPipeline(
      props,
      cloudAssemblyArtifact,
      codePipeline,
      cityBuildArtifacts
    )
  }

  /**
   * Create the user record that is used to upload builds to the builds bucket
   * @param bucket The builds bucket
   */
  private createCiCdUser(bucket: Bucket) {
    // create user record
    const cicdUser = new User(this, 'CiCdUser', {
      userName: 'cicd'
    })

    // add permissions
    cicdUser.addToPolicy(
      new PolicyStatement({
        resources: [bucket.arnForObjects('builds/*.zip')],
        actions: ['s3:PutObject']
      })
    )

    return { cicdUser }
  }

  /**
   * Create the bucket for housing builds that trigger the pipeline
   */
  private createBuildsBucket() {
    // create the bucket
    const buildsBucket = new Bucket(this, 'BuildBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      encryption: BucketEncryption.S3_MANAGED
    })

    // create the notification handler for when a new build is put in the "/builds" bucket
    const handler = new NodejsFunction(this, 'BuildBucketNotificationLambda', {
      entry: path.join(__dirname, 'lambdas', 'builds-bucket-event.ts'),
      minify: true,
      runtime: Runtime.NODEJS_12_X
    })

    // allow handler to execute a copy within S3
    handler.addToRolePolicy(
      new PolicyStatement({
        actions: [
          's3:GetObject',
          's3:GetObjectTagging',
          's3:PutObject',
          's3:PutObjectTagging'
        ],
        resources: [`${buildsBucket.bucketArn}/*`]
      })
    )

    // allow handler to list the bucket
    handler.addToRolePolicy(
      new PolicyStatement({
        actions: ['s3:ListBucket'],
        resources: [buildsBucket.bucketArn]
      })
    )

    // subscribe to files that look like 'builds/*.zip'
    buildsBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(handler),
      {
        suffix: '.zip',
        prefix: 'builds/'
      }
    )

    return {
      bucket: buildsBucket
    }
  }

  /**
   * Create the Code Build project to build the CDK assets and create FE builds
   * @param config The pipeline config which determines stacks to be deployed
   */
  private createBuildSourceProject(
    cloudAssemblyArtifact: Artifact,
    cityBuildArgs: CityStackArtifactBuildConfiguration[]
  ) {
    // as we're using secondary artifacts, require a name
    if (!cloudAssemblyArtifact.artifactName) {
      throw new Error('cloudAssemblyArtifact must be named')
    }

    // declare the artifact config
    const artifactConfig: {
      [index: string]: {
        files: string[] | string
        name: string
        'discard-paths'?: 'no' | 'yes'
        'base-directory'?: string
      }
    } = {
      // add cloud assembly artifact
      [cloudAssemblyArtifact.artifactName]: {
        files: '**/*',
        name: cloudAssemblyArtifact.artifactName,
        'base-directory': 'packages/infra/cdk.out'
      }
    }

    // initialise our build commands with the CDK build
    const buildCommands = ['yarn infra cdk synth']

    // for each city stack
    cityBuildArgs.forEach((cba, index) => {
      // create the secondary artifact config
      const artifactName = this.getFrontendArtifactName(cba.name)
      artifactConfig[artifactName] = {
        files: '**/*',
        name: artifactName,
        'base-directory': `packages/frontend/dist/${cba.name}`
      }

      // build the .env file contents
      const envFileContents = Object.entries(cba.env)
        .map((entry) => `${entry[0]}=${entry[1]}`)
        .join('\n')
        .replace(/[\\"']/g, '\\$&')

      // write the .env file and package the build for the environment
      buildCommands.push(
        `echo "${envFileContents}" > packages/frontend/.env`,
        `OUTPUT_DIR=${cba.name} yarn fe generate${
          index !== 0 ? ' --no-build' : ''
        }`
      )
    })

    // create the project
    const project = new Project(this, 'BuildSourceProject', {
      buildSpec: BuildSpec.fromObject({
        version: 0.2,
        env: {
          'exported-variables': ['BUILD_NUMBER']
        },
        phases: {
          install: {
            'runtime-versions': {
              python: 3.7,
              nodejs: 12
            },
            commands: ['yarn']
          },
          build: {
            commands: [
              'BUILD_NUMBER=$(cat build-details.json | python -c "import sys, json; print(json.load(sys.stdin)[\'buildNumber\'])")',
              ...buildCommands
            ]
          }
        },
        artifacts: {
          files: '**/*',
          'secondary-artifacts': artifactConfig
        }
      })
    })

    // permissions to fetch context, e.g. AZ's for VPC
    project.addToRolePolicy(
      new PolicyStatement({
        actions: ['ec2:Describe*', 'ec2:Get*'],
        resources: ['*']
      })
    )

    return { project }
  }

  /**
   * Create the CodePipeline pipeline and add base stages and actions
   * @param props The pipeline config which determines stacks to be deployed
   * @param bucket The builds source bucket
   */
  private createCodePipeline(props: Props, bucket: IBucket) {
    // create artifacts
    const sourceArtifact = new Artifact()
    const cloudAssemblyArtifact = new Artifact('cloudAssembly')

    // create base pipeline
    const codePipeline = new Pipeline(this, 'Pipeline', {
      restartExecutionOnUpdate: true
    })

    // determine city stacks that will need to be built, and their args
    const cityStacks = this.getCityStacksProps(props)
    const cityBuildArgs = cityStacks.map((cs) => ({
      name: cs.name,
      env: cs.props.webAppBuildVariables || {}
    }))

    // create artifacts for each one
    const cityBuildArtifacts = cityStacks.map(
      (cs) => new Artifact(this.getFrontendArtifactName(cs.name))
    )

    // create the CodeBuild project that will run the build jobs
    // we do this in a single project so that all dependencies are the same across outputs
    const { project } = this.createBuildSourceProject(
      cloudAssemblyArtifact,
      cityBuildArgs
    )

    // add the source stage with s3 source action
    codePipeline.addStage({
      stageName: 'Source',
      actions: [
        new S3SourceAction({
          bucket,
          bucketKey: 'source.zip',
          actionName: 'Source',
          output: sourceArtifact
        })
      ]
    })

    // add the build stage with codebuild project and all artifacts
    codePipeline.addStage({
      stageName: 'Build',
      actions: [
        new CodeBuildAction({
          actionName: 'Build',
          project: project,
          input: sourceArtifact,
          outputs: [cloudAssemblyArtifact, ...cityBuildArtifacts]
        })
      ]
    })

    return {
      codePipeline,
      cloudAssemblyArtifact,
      cityBuildArtifacts
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
   */
  private createCdkPipeline(
    props: Props,
    cloudAssemblyArtifact: Artifact,
    codePipeline: Pipeline,
    cityBuildArtifacts: Artifact[]
  ) {
    // synthesize the cloud assembly
    const { app, createdStacks } = this.buildApp(props)
    const cloudAssembly = app.synth()

    // read out configuration to consts
    const { stage1Configuration, stage2Configuration } = props
    const {
      authStackProps,
      dataStoreStackProps,
      cityStacksProps: stage1CityStacksProps = []
    } = stage1Configuration

    // create lambda function to add city stack to the stage
    // this is a lambda rather than a function so we can use the consts defined above
    const addCityStackToStage = (
      stage: CdkStage,
      cityStackProps: StackConfiguration<CityStackProps>,
      options?: AddStackOptions | undefined
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
        (cba) => cba.artifactName == this.getFrontendArtifactName(name)
      )
      if (!artifact) {
        throw new Error(
          'Artifact for frontend build of ' + name + ' not found!'
        )
      }

      // add the stack to the stage
      this.addStack(stage, cityStack, options)

      // add action to deploy the frontend web app to its bucket
      stage.addActions(
        new S3DeployAction({
          actionName: `${name}.WebAppDeploy`,
          input: artifact,
          bucket: Bucket.fromBucketName(
            this,
            name + 'WebAppBucket',
            synthesizedStack.bucketNames['WebApp']
          ),
          runOrder: stage.nextSequentialRunOrder()
        })
      )
    }

    // create CDK pipeline
    const cdkPipeline = new CdkPipeline(this, 'CdkPipeline', {
      cloudAssemblyArtifact,
      codePipeline
    })

    // Add and configure deployment stage 1
    // Data Store Stack, Auth Stack and any "lower" environments such as DEV
    const stage1 = cdkPipeline.addStage('DeploymentStage1')
    const baseStackOptions = this.addStack(
      stage1,
      this.getStack(cloudAssembly, dataStoreStackProps)
    )
    if (authStackProps) {
      this.addStack(
        stage1,
        this.getStack(cloudAssembly, authStackProps),
        baseStackOptions
      )
    }
    stage1CityStacksProps.forEach((cityStackProps) =>
      addCityStackToStage(stage1, cityStackProps)
    )

    // Add and configure deployment stage 2
    // this is generally "higher" environments such as Staging (for non-production) or Production
    if (stage2Configuration) {
      // read out stage 2 config
      const { cityStacksProps: stage2CityStacksProps } = stage2Configuration

      // create stage 2
      const stage2 = cdkPipeline.addStage('DeploymentStage2')

      // add manual approval
      stage2.addActions(
        new ManualApprovalAction({
          actionName: `ApproveDeploymentStage2`,
          additionalInformation: `Approve to continue deployment to stage 2 environments.`,
          runOrder: stage2.nextSequentialRunOrder()
        })
      )

      // calculate options to execute deployments in parallel
      const runOrder = stage2.nextSequentialRunOrder()
      const approvalOrder = stage2.nextSequentialRunOrder()
      const executeRunOrder = stage2.nextSequentialRunOrder()
      const parallelOptions: AddStackOptions = {
        runOrder,
        executeRunOrder
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
          runOrder: approvalOrder
        })
      )
    }

    return {
      cdkPipeline
    }
  }

  /**
   * Gets a stack in the given cloud assembly
   * @param cloudAssembly The cloud assembly to get the stack from
   * @param configuration The Stack Configuration to determine the stack name from
   */
  private getStack(
    cloudAssembly: CloudAssembly,
    configuration: StackConfiguration<StackProps>
  ): CloudFormationStackArtifact {
    return cloudAssembly.getStackByName(
      configuration.props.stackName || configuration.name
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
    options?: AddStackOptions
  ) {
    if (!options) {
      options = {
        runOrder: stage.nextSequentialRunOrder(),
        executeRunOrder: stage.nextSequentialRunOrder()
      }
    }
    stage.addStackArtifactDeployment(stackArtifact, options)
    return options
  }

  /**
   * Gets all the city stacks (which contain app projects that need to be built) from the pipeline configuration
   * @param props The pipeline config which determines stacks that are in the app
   */
  private getCityStacksProps(props: Props) {
    const {
      stage1Configuration,
      stage2Configuration = { cityStacksProps: [] }
    } = props
    const { cityStacksProps: stage1CityStacks = [] } = stage1Configuration
    const { cityStacksProps: stage2CityStacks } = stage2Configuration
    return [...stage1CityStacks, ...stage2CityStacks]
  }

  /**
   * Create a CDK app from a pipeline config by dynamically adding stacks to it
   * @param props The pipeline config which determines stacks that are in the app
   */
  private buildApp(props: Props) {
    // read out configuration
    const { stage1Configuration } = props
    const { authStackProps, dataStoreStackProps } = stage1Configuration
    const cityStacksProps = this.getCityStacksProps(props)
    const createdStacks: { name: string; stack: Stack }[] = []

    // create new app
    const app = new App()

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
      dataStoreStackProps.props
    )
    createdStacks.push({
      name: dataStoreStackProps.name,
      stack: dataStoreStack
    })

    // add all city stacks
    cityStacksProps.map((stackProps) => {
      const { name, props } = stackProps
      const stack = new CityStack(app, name, {
        authStack: props.expectsAuthStack ? authStack : undefined,
        ...props,
        dataStoreStack
      })
      createdStacks.push({ name, stack })
    })

    return { app, createdStacks }
  }
}
