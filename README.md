# Serverless E-Commerce Platform

[![AWS CDK](https://img.shields.io/badge/AWS_CDK-2.0+-blue.svg)](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
[![Serverless](https://img.shields.io/badge/Serverless-Architecture-FF9900.svg)](https://aws.amazon.com/serverless/)

## Project Overview
A cloud-native e-commerce platform built with AWS Serverless services, featuring:
- Microservices architecture with independent Lambda functions
- Real-time order processing with EventBridge & SNS
- JWT-based authentication using Cognito
- Multi-layered security architecture
- Audit trails with CloudWatch Logs

## Architecture Diagram
```
[Client] → [CloudFront] → [API Gateway] → [Lambda Microservices]
                ↓               ↳ [Cognito User Pool]
          [S3 Static Hosting]   ↳ [DynamoDB Tables]
                                 ↳ [EventBridge/SNS Events]
```

## Key AWS Services
- **Compute**: AWS Lambda, Lambda Layers
- **Databases**: DynamoDB (Orders, Products, Invoices)
- **Auth**: Cognito User Pools, IAM Roles
- **Messaging**: EventBridge, SNS, SQS
- **Storage**: S3, EFS
- **Monitoring**: CloudWatch, X-Ray

## Getting Started
```bash
npm install
cp .env.example .env  # Configure environment variables
cdk deploy
```

## Main Features
1. **Auth Service**
   - User registration/authentication
   - JWT token validation middleware
   - Fine-grained IAM permissions

2. **Product Service**
   - CRUD operations for products
   - Inventory management
   - Product change events via SNS

3. **Order Service**
   - Order processing pipeline
   - Payment integration (Stripe/PayPal)
   - Real-time status updates

4. **Invoice Service**
   - PDF generation
   - S3 pre-signed URLs
   - Audit trails for compliance

## API Endpoints
| Service     | Endpoint          | Method | Description            |
|-------------|-------------------|--------|------------------------|
| Auth        | /auth/register    | POST   | User registration      |
| Products    | /products/{id}    | GET    | Get product details    |
| Orders      | /orders           | POST   | Create new order       |
| Invoices    | /invoices/{id}/url| GET    | Get invoice download URL |

## Environment Variables
```env
USER_POOL_ID=us-east-1_XXXXXXXXX
IDENTITY_POOL_ID=us-east-1:XXXXXXXX-XXXX-...
ORDERS_TABLE=ServerlessEcommerce-Orders
EVENT_BUS_NAME=ServerlessEcommerce-EventBus
```

## Deployment
```bash
# Synthesize CloudFormation template
cdk synth

# Deploy with approval prompts
cdk deploy --require-approval never

# Run integration tests
npm run test
```

## Monitoring & Debugging
- CloudWatch Dashboards for:
  - Lambda invocation metrics
  - DynamoDB throttling events
  - API Gateway 4XX/5XX errors
- X-Ray tracing for service mapping
- CloudTrail for audit logs

## Contributing
1. Fork repository
2. Create feature branch
3. Submit PR with:
   - Updated tests
   - Documentation changes
   - Terraform/CDK changes (if applicable)
```
