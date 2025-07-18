import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

interface BlockedUser {
   email: string;
   reason: string;
   blockedAt: string;
   blockedBy: string;
   isActive: boolean;
   expiresAt?: number; // Unix timestamp for TTL
   notes?: string;
}

export class BlockedUserManager {
   private tableName: string;

   constructor(tableName: string) {
      this.tableName = tableName;
   }

   /**
    * Block a user with specified reason
    */
   async blockUser(email: string, reason: string, blockedBy: string, expirationDays?: number, notes?: string): Promise<void> {
      const blockedUser: BlockedUser = {
         email: email.toLowerCase(),
         reason,
         blockedAt: new Date().toISOString(),
         blockedBy,
         isActive: true,
         notes
      };

      // Add expiration if specified
      if (expirationDays && expirationDays > 0) {
         const expirationDate = new Date();
         expirationDate.setDate(expirationDate.getDate() + expirationDays);
         blockedUser.expiresAt = Math.floor(expirationDate.getTime() / 1000);
      }

      const command = new PutCommand({
         TableName: this.tableName,
         Item: blockedUser
      });

      await docClient.send(command);
      console.log(`User ${email} has been blocked. Reason: ${reason}`);
   }

   /**
    * Unblock a user
    */
   async unblockUser(email: string): Promise<void> {
      const command = new DeleteCommand({
         TableName: this.tableName,
         Key: {
            email: email.toLowerCase()
         }
      });

      await docClient.send(command);
      console.log(`User ${email} has been unblocked`);
   }

   /**
    * Check if a user is blocked
    */
   async isUserBlocked(email: string): Promise<boolean> {
      const command = new GetCommand({
         TableName: this.tableName,
         Key: {
            email: email.toLowerCase()
         }
      });

      const result = await docClient.send(command);
      
      if (result.Item) {
         const blockedUser = result.Item as BlockedUser;
         return blockedUser.isActive === true;
      }
      
      return false;
   }

   /**
    * Get blocked user details
    */
   async getBlockedUser(email: string): Promise<BlockedUser | null> {
      const command = new GetCommand({
         TableName: this.tableName,
         Key: {
            email: email.toLowerCase()
         }
      });

      const result = await docClient.send(command);
      return result.Item as BlockedUser || null;
   }

   /**
    * List all blocked users
    */
   async listBlockedUsers(): Promise<BlockedUser[]> {
      const command = new ScanCommand({
         TableName: this.tableName,
         FilterExpression: "isActive = :active",
         ExpressionAttributeValues: {
            ":active": true
         }
      });

      const result = await docClient.send(command);
      return result.Items as BlockedUser[] || [];
   }
}

// CLI usage example
if (require.main === module) {
   const tableName = process.env.BLOCKED_USERS_TABLE || "ServerlessEcommerce-BlockedUsers";
   const manager = new BlockedUserManager(tableName);

   const args = process.argv.slice(2);
   const action = args[0];

   switch (action) {
      case 'block':
         const email = args[1];
         const reason = args[2] || 'MANUAL_BLOCK';
         const blockedBy = args[3] || 'ADMIN';
         const days = args[4] ? parseInt(args[4]) : undefined;
         manager.blockUser(email, reason, blockedBy, days)
            .then(() => console.log('User blocked successfully'))
            .catch(console.error);
         break;
         
      case 'unblock':
         manager.unblockUser(args[1])
            .then(() => console.log('User unblocked successfully'))
            .catch(console.error);
         break;
         
      case 'check':
         manager.isUserBlocked(args[1])
            .then(blocked => console.log(`User is ${blocked ? 'blocked' : 'not blocked'}`))
            .catch(console.error);
         break;
         
      case 'list':
         manager.listBlockedUsers()
            .then(users => console.log('Blocked users:', users))
            .catch(console.error);
         break;
         
      default:
         console.log('Usage:');
         console.log('  node blockedUserManager.js block <email> [reason] [blockedBy] [days]');
         console.log('  node blockedUserManager.js unblock <email>');
         console.log('  node blockedUserManager.js check <email>');
         console.log('  node blockedUserManager.js list');
   }
}
