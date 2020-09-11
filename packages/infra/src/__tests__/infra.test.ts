import {
  expect as expectCDK,
  haveResource,
  ResourcePart,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as Infra from "../infra-stack";

test("Default Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Infra.InfraStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(haveResource("AWS::IAM::Role"));
  expectCDK(stack).to(
    haveResource("AWS::Lambda::Function", {
      Handler: "index.handler",
      Role: {
        "Fn::GetAtt": ["HelloWorldFunctionServiceRole8E0BD458", "Arn"],
      },
      Runtime: "nodejs10.x",
    })
  );
});
