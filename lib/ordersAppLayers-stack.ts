import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as ssm from 'aws-cdk-lib/aws-ssm'

export class OrdersAppLayersStack extends cdk.Stack {
   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props)

      const ordersLayer = new lambda.LayerVersion(this, 'OrdersLayer', {
         code: lambda.Code.fromAsset('src/orders/layers/ordersLayer'),
         //CHANGE
         compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
         layerVersionName: 'OrdersLayer',
         removalPolicy: cdk.RemovalPolicy.RETAIN
      })

      new ssm.StringParameter(this, 'OrdersLayerVersionArn', {
         parameterName: 'OrdersLayerVersionArn',
         stringValue: ordersLayer.layerVersionArn
      })

      const ordersApiLayer = new lambda.LayerVersion(this, 'OrdersApiLayer', {
         code: lambda.Code.fromAsset('src/orders/layers/ordersApiLayer'),
         //CHANGE
         compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
         layerVersionName: 'OrdersApiLayer',
         removalPolicy: cdk.RemovalPolicy.RETAIN
      })

      new ssm.StringParameter(this, 'OrdersApiLayerVersionArn', {
         parameterName: 'OrdersApiLayerVersionArn',
         stringValue: ordersApiLayer.layerVersionArn
      })

      const orderEventsLayer = new lambda.LayerVersion(this, 'OrderEventsLayer', {
         code: lambda.Code.fromAsset('src/orders/layers/orderEventsLayer'),
         //CHANGE
         compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
         layerVersionName: 'OrderEventsLayer',
         removalPolicy: cdk.RemovalPolicy.RETAIN
      })

      new ssm.StringParameter(this, 'OrderEventsLayerVersionArn', {
         parameterName: 'OrderEventsLayerVersionArn',
         stringValue: orderEventsLayer.layerVersionArn
      })

      const orderEventsRepositoryLayer = new lambda.LayerVersion(this, 'OrderEventsRepositoryLayer', {
         code: lambda.Code.fromAsset('src/orders/layers/orderEventsRepositoryLayer'),
         //CHANGE
         compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
         layerVersionName: 'OrderEventsRepositoryLayer',
         removalPolicy: cdk.RemovalPolicy.RETAIN
      })

      new ssm.StringParameter(this, 'OrderEventsRepositoryLayerVersionArn', {
         parameterName: 'OrderEventsRepositoryLayerVersionArn',
         stringValue: orderEventsRepositoryLayer.layerVersionArn
      })

   }
}