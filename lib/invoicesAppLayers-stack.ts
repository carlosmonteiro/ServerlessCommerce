import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as ssm from 'aws-cdk-lib/aws-ssm'

export class InvoicesAppLayersStack extends cdk.Stack {
   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props)

      //Invoice Transaction Layer
      const invoiceTransactionLayer = new lambda.LayerVersion(this, 'InvoiceTransactionLayer', {
         code: lambda.Code.fromAsset('src/invoices/layers/invoiceTransaction'),
         //CHANGE
         compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
         layerVersionName: 'InvoiceTransactionLayer',
         removalPolicy: cdk.RemovalPolicy.RETAIN
      })

      new ssm.StringParameter(this, 'InvoiceTransactionLayerVersionArn', {
         parameterName: 'InvoiceTransactionLayerVersionArn',
         stringValue: invoiceTransactionLayer.layerVersionArn
      })

      //Invoice Layer
      const invoiceLayer = new lambda.LayerVersion(this, 'InvoiceLayer', {
         code: lambda.Code.fromAsset('src/invoices/layers/invoiceRepository'),
         //CHANGE
         compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
         layerVersionName: 'InvoiceRepository',
         removalPolicy: cdk.RemovalPolicy.RETAIN
      })

      new ssm.StringParameter(this, 'InvoiceRepositoryLayerVersionArn', {
         parameterName: 'InvoiceRepositoryLayerVersionArn',
         stringValue: invoiceLayer.layerVersionArn
      })

      //Invoice WebSocket API Layer
      const invoiceWSConnectionLayer = new lambda.LayerVersion(this, 'InvoiceWSConnectionLayer', {
         code: lambda.Code.fromAsset('src/invoices/layers/invoiceWSConnection'),
         //CHANGE
         compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
         layerVersionName: 'InvoiceWSConnection',
         removalPolicy: cdk.RemovalPolicy.RETAIN
      })

      new ssm.StringParameter(this, 'InvoiceWSConnectionLayerVersionArn', {
         parameterName: 'InvoiceWSConnectionLayerVersionArn',
         stringValue: invoiceWSConnectionLayer.layerVersionArn
      })
   }
}