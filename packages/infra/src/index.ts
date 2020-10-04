#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { CiCdStack, Props as CiCdStackProps } from './cicd-stack'
import fs = require('fs')

const app = new cdk.App()

// read in config - could do with some validation
const cicdProps = JSON.parse(
  fs.readFileSync('cdk.pipeline.json', 'utf8'),
) as CiCdStackProps
new CiCdStack(app, 'CiCd', cicdProps)

// optionally, add all the same stacks to the current app for direct deployment
CiCdStack.buildApp(cicdProps, app)
