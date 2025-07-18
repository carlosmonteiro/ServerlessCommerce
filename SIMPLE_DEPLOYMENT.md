# 🚀 Simple CDK Deployment Guide

## Prerequisites
- AWS CLI configured with admin permissions
- Node.js 18+ installed

## Deploy & Test in 4 Commands

### 1. Setup
```bash
npm install
npm run build
cdk bootstrap  # One-time setup per AWS account/region
```

### 2. Deploy Everything
```bash
cdk deploy --all --require-approval never
```
**Time**: ~15-20 minutes  
**Cost**: ~$5-10 for testing

### 3. Test Your Application
```bash
# Get your API Gateway URL from CDK output or:
aws apigateway get-rest-apis --query 'items[?name==`ECommerceApi`].id' --output text

# Test the API
curl https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/products
```

### 4. Clean Up
```bash
cdk destroy --all --force
```

## What Gets Deployed

CDK will create these stacks in order:
1. **AuditEvents** - Event bus for audit trails
2. **AuthLayers** - Authentication layers
3. **ProductsAppLayers** - Product service layers  
4. **EventsDdb** - DynamoDB for events
5. **ProductsApp** - Product management service
6. **OrdersAppLayers** - Order service layers
7. **OrdersApp** - Order management service
8. **ECommerceApi** - Main REST API Gateway
9. **InvoicesAppLayer** - Invoice service layers
10. **InvoiceApi** - WebSocket API for invoices

## Key Endpoints After Deployment

- **Products**: `GET /products`
- **Orders**: `POST /orders` (requires auth)
- **WebSocket**: For real-time invoice updates

## Monitoring

- **CloudWatch Logs**: `/aws/lambda/[FunctionName]`
- **CloudWatch Metrics**: Lambda, DynamoDB, API Gateway
- **X-Ray Tracing**: Enabled for all services

## Cost Management

- **Serverless**: Pay only for usage
- **Testing cost**: ~$5-10 for few hours
- **Always destroy when done**: `cdk destroy --all --force`

That's it! CDK handles all the complexity for you.
