import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as cwlogs from "aws-cdk-lib/aws-logs"
import { Construct } from "constructs"

interface EcommerceApiStackProps extends cdk.StackProps{
    productsFetchHandler: lambdaNodeJS.NodejsFunction
    productsAdminHandler: lambdaNodeJS.NodejsFunction
}

export class EcommerceApiStack extends cdk.Stack{

    constructor(scope: Construct, id: string, props: EcommerceApiStackProps){
        super(scope, id, props)

        //Create Cloudwatch log group
        const logGroup = new cwlogs.LogGroup(this, "ECommerceAPILogs")

        const api = new apigateway.RestApi(this, "EcommerceApi", {
            restApiName: "EcommerceAPI",
            cloudWatchRole: true,
            deployOptions: {
                accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
                accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
                    httpMethod: true, 
                    ip: true,
                    protocol: true,
                    requestTime: true,
                    resourcePath: true,
                    responseLength: true,
                    status: true, 
                    caller: true,
                    user: true
                })
            }
        })

        const productsFetchIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler)
        
        //GET /products
        const productsResource = api.root.addResource("products")
        productsResource.addMethod("GET", productsFetchIntegration)

        //GET /products/{id}
        const productIdResource = productsResource.addResource("{id}")
        productIdResource.addMethod("GET", productsFetchIntegration)

        const productsAdminIntegration = new apigateway.LambdaIntegration(props.productsAdminHandler)

        //POST /products
        productsResource.addMethod("POST", productsAdminIntegration)

        //PUT /products/{id}
        productIdResource.addMethod("PUT", productsAdminIntegration)

        //DELETE /products/{id}
        productIdResource.addMethod("DELETE", productsAdminIntegration)
    }
}