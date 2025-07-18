import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class BlockedUsersStack extends cdk.Stack {
   readonly blockedUsersTable: dynamodb.Table;

   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

      // DynamoDB table for blocked users
      this.blockedUsersTable = new dynamodb.Table(this, "BlockedUsersTable", {
         tableName: "ServerlessEcommerce-BlockedUsers",
         partitionKey: {
            name: "email",
            type: dynamodb.AttributeType.STRING
         },
         billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
         encryption: dynamodb.TableEncryption.AWS_MANAGED,
         pointInTimeRecovery: true,
         removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep data on stack deletion
         
         // Add TTL for automatic cleanup of temporary blocks
         timeToLiveAttribute: "expiresAt"
      });

      // Add GSI for querying by block reason (optional)
      this.blockedUsersTable.addGlobalSecondaryIndex({
         indexName: "ReasonIndex",
         partitionKey: {
            name: "reason",
            type: dynamodb.AttributeType.STRING
         },
         sortKey: {
            name: "blockedAt",
            type: dynamodb.AttributeType.STRING
         }
      });

      // Output the table name
      new cdk.CfnOutput(this, "BlockedUsersTableName", {
         value: this.blockedUsersTable.tableName,
         description: "Name of the blocked users DynamoDB table"
      });
   }
}
