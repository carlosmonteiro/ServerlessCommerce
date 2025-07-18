import { Callback, Context, PreAuthenticationTriggerEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface BlockedUser {
   email: string;
   reason: string;
   blockedAt: string;
   isActive: boolean;
}

export async function handler(event: PreAuthenticationTriggerEvent, context: Context,
      callback: Callback): Promise<void> {
      
   // Sanitized logging
   console.log('Pre-authentication trigger invoked', {
      userPoolId: event.userPoolId,
      userName: event.userName,
      triggerSource: event.triggerSource
   });

   try {
      const userEmail = event.request.userAttributes.email?.toLowerCase();
      
      if (!userEmail) {
         console.error('No email found in user attributes');
         callback("Invalid user data.", event);
         return;
      }

      // Check if user is blocked in DynamoDB
      const isBlocked = await checkBlockedUser(userEmail);
      
      if (isBlocked) {
         console.warn('Authentication blocked for user', { 
            userName: event.userName, 
            reason: 'USER_BLOCKED' 
         });
         callback("Your account has been temporarily suspended. Please contact support.", event);
         return;
      }

      // Allow authentication
      callback(null, event);
      
   } catch (error) {
      console.error('Error in pre-authentication function:', error);
      callback("Authentication service temporarily unavailable.", event);
   }
}

async function checkBlockedUser(email: string): Promise<boolean> {
   try {
      const tableName = process.env.BLOCKED_USERS_TABLE;
      
      if (!tableName) {
         console.warn('BLOCKED_USERS_TABLE environment variable not set');
         return false;
      }

      const command = new GetCommand({
         TableName: tableName,
         Key: {
            email: email
         }
      });

      const result = await docClient.send(command);
      
      // Check if user exists and is actively blocked
      if (result.Item) {
         const blockedUser = result.Item as BlockedUser;
         return blockedUser.isActive === true;
      }
      
      return false;
      
   } catch (error) {
      console.error('Error checking blocked user:', error);
      // Fail open - don't block authentication if we can't check the table
      return false;
   }
}
