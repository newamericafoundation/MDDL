import { Stack, Construct, StackProps } from "@aws-cdk/core";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import path = require("path");

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    new NodejsFunction(this, "HelloWorldFunction", {
      entry: path.join(__dirname, "../../hello-world-lambda/src/index.ts"),
    });
  }
}
