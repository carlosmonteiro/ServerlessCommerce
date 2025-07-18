# Blocked Users Management

This document explains how to manage blocked users in the Serverless E-Commerce platform.

## Overview

The system provides two approaches for blocking users:

1. **Environment Variables** (Quick fix) - Simple comma-separated list
2. **DynamoDB Table** (Recommended) - Full-featured blocking system with expiration and audit trail

## Option 1: Environment Variables Approach

### Setup
1. Set the `BLOCKED_EMAILS` environment variable in your Lambda function:
   ```
   BLOCKED_EMAILS=user1@example.com,user2@example.com,user3@example.com
   ```

### Pros
- Simple to implement
- No additional AWS resources needed
- Quick deployment

### Cons
- Requires Lambda redeployment to update blocked users
- No audit trail
- No expiration mechanism
- Limited metadata

## Option 2: DynamoDB Approach (Recommended)

### Setup
1. Deploy the BlockedUsersStack:
   ```bash
   cdk deploy BlockedUsersStack
   ```

2. Update your authentication Lambda to use the DynamoDB version:
   ```bash
   # Replace the current preAuthenticationFunction.ts with preAuthenticationFunction-dynamodb.ts
   cp src/auth/preAuthenticationFunction-dynamodb.ts src/auth/preAuthenticationFunction.ts
   ```

3. Set the environment variable in your Lambda:
   ```
   BLOCKED_USERS_TABLE=ServerlessEcommerce-BlockedUsers
   ```

### Usage

#### Block a user
```bash
# Block permanently
npm run block-user user@example.com PAYMENT_ISSUE admin@company.com

# Block for 30 days
npm run block-user user@example.com TEMPORARY_SUSPENSION admin@company.com 30
```

#### Unblock a user
```bash
npm run unblock-user user@example.com
```

#### Check if user is blocked
```bash
npm run check-user user@example.com
```

#### List all blocked users
```bash
npm run list-blocked
```

### Programmatic Usage

```typescript
import { BlockedUserManager } from './src/auth/blockedUserManager';

const manager = new BlockedUserManager('ServerlessEcommerce-BlockedUsers');

// Block a user
await manager.blockUser(
   'user@example.com', 
   'PAYMENT_ISSUE', 
   'admin@company.com',
   30, // expires in 30 days
   'Customer has outstanding payment'
);

// Check if blocked
const isBlocked = await manager.isUserBlocked('user@example.com');

// Get block details
const blockInfo = await manager.getBlockedUser('user@example.com');
```

## DynamoDB Table Schema

```json
{
   "email": "user@example.com",           // Partition key
   "reason": "PAYMENT_ISSUE",             // Block reason
   "blockedAt": "2024-01-15T10:30:00Z",   // ISO timestamp
   "blockedBy": "admin@company.com",      // Who blocked the user
   "isActive": true,                      // Whether block is active
   "expiresAt": 1705392600,              // Unix timestamp for TTL (optional)
   "notes": "Customer has outstanding payment" // Additional notes (optional)
}
```

## Block Reasons (Suggested)

- `PAYMENT_ISSUE` - Outstanding payments or payment failures
- `FRAUD_SUSPECTED` - Suspicious activity detected
- `POLICY_VIOLATION` - Terms of service violation
- `TEMPORARY_SUSPENSION` - Temporary account suspension
- `MANUAL_BLOCK` - Manual administrative block
- `SECURITY_BREACH` - Account security compromise

## Security Considerations

1. **Audit Trail**: All blocks are logged with timestamp and admin info
2. **Automatic Expiration**: Use TTL for temporary blocks
3. **Fail Open**: If DynamoDB is unavailable, authentication proceeds (configurable)
4. **Sanitized Logging**: No sensitive user data in logs
5. **Case Insensitive**: Email comparisons are case-insensitive

## Monitoring

Monitor the following CloudWatch metrics:
- `BlockedUsersTable` read/write capacity
- Lambda function errors in pre-authentication
- Authentication failure rates

## Migration from Hardcoded Approach

1. Deploy the new DynamoDB table
2. Add any currently hardcoded blocked emails to the table
3. Update the Lambda function code
4. Test the new system
5. Remove hardcoded emails from the code
6. Deploy the updated Lambda function

## Troubleshooting

### Common Issues

1. **Lambda timeout**: Increase timeout if DynamoDB calls are slow
2. **Permission errors**: Ensure Lambda has DynamoDB read permissions
3. **Table not found**: Verify `BLOCKED_USERS_TABLE` environment variable

### Debug Commands

```bash
# Check table exists
aws dynamodb describe-table --table-name ServerlessEcommerce-BlockedUsers

# List items in table
aws dynamodb scan --table-name ServerlessEcommerce-BlockedUsers

# Check Lambda environment variables
aws lambda get-function-configuration --function-name YourPreAuthFunction
```
