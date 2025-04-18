import * as cdk from "aws-cdk-lib"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as ssm from "aws-cdk-lib/aws-ssm"
import { Construct } from "constructs"

export class AuthLayersStack extends cdk.Stack {
   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props)

      const authUserInfoLayer = new lambda.LayerVersion(this, "AuthUserInfoLayer", {
         code: lambda.Code.fromAsset('src/auth/layers/authUserInfo'),
         //CHANGE
         compatibleRuntimes: [ lambda.Runtime.NODEJS_20_X],
         layerVersionName: "AuthUserInfo",
         removalPolicy: cdk.RemovalPolicy.RETAIN
      })
      new ssm.StringParameter(this, "AuthUserInfoLayerVersionArn", {
         parameterName: "AuthUserInfoLayerVersionArn",
         stringValue: authUserInfoLayer.layerVersionArn
      })
   }
}