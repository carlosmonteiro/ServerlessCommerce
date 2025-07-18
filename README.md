# Serverless E-Commerce Platform

[![AWS CDK](https://img.shields.io/badge/AWS_CDK-2.0+-blue.svg)](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
[![Serverless](https://img.shields.io/badge/Serverless-Architecture-FF9900.svg)](https://aws.amazon.com/serverless/)
[![Security](https://img.shields.io/badge/Security-Hardened-green.svg)](https://aws.amazon.com/security/)

## Project Overview
A production-ready, cloud-native e-commerce platform built with AWS Serverless services, featuring:
- **Microservices Architecture**: Independent Lambda functions with proper separation of concerns
- **Real-time Processing**: EventBridge & SNS for order processing and notifications
- **Secure Authentication**: Cognito User Pools with OAuth 2.0 and JWT tokens
- **Multi-layered Security**: Environment variables, user blocking system, and audit trails
- **Scalable Infrastructure**: Auto-scaling serverless components with cost optimization
- **Comprehensive Monitoring**: CloudWatch Logs, X-Ray tracing, and audit events

## 🏗️ Architecture Diagram
```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   Client    │───▶│  CloudFront  │───▶│   API Gateway   │───▶│ Lambda Functions │
│ (Web/Mobile)│    │   (CDN)      │    │ (REST API)      │    │  (Microservices) │
└─────────────┘    └──────────────┘    └─────────────────┘    └──────────────────┘
                                                │                        │
                                                ▼                        ▼
                                        ┌─────────────────┐    ┌──────────────────┐
                                        │ Cognito User    │    │   DynamoDB       │
                                        │ Pools (Auth)    │    │   Tables         │
                                        └─────────────────┘    └──────────────────┘
                                                                        │
                                                                        ▼
                                                                ┌──────────────────┐
                                                                │ EventBridge/SNS  │
                                                                │ (Event Processing)│
                                                                └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- AWS CLI configured with appropriate permissions
- AWS CDK CLI installed (`npm install -g aws-cdk`)

### Installation & Deployment
```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd ServerlessCommerce
npm install

# 2. Build the TypeScript project
npm run build

# 3. Bootstrap CDK (one-time setup per AWS account/region)
cdk bootstrap

# 4. Deploy all infrastructure stacks
cdk deploy --all --require-approval never

# 5. Note the API Gateway URL from the deployment output
# Example: https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod/
```

## 🔐 Authentication & Testing

### Setting Up Test Users

After deployment, create test users for API testing:

```bash
# Create a customer user
aws cognito-idp admin-create-user \
  --user-pool-id <CUSTOMER_POOL_ID> \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com Name=email_verified,Value=true Name=name,Value="Test Customer" \
  --temporary-password TempPass123! \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id <CUSTOMER_POOL_ID> \
  --username test@example.com \
  --password "TestPass123!" \
  --permanent
```

### Getting Authentication Tokens

**Method 1: Browser OAuth Flow (Recommended)**
1. Open the authentication URL in your browser:
```
https://<COGNITO_DOMAIN>.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=<CLIENT_ID>&response_type=token&scope=customer/web&redirect_uri=https://example.com
```

2. Login with your test credentials
3. Extract the access token from the redirect URL

**Method 2: Use the Test HTML Page**
Open `test-auth.html` in your browser for a guided authentication flow.

### API Testing Examples

```bash
# List all products
curl -X GET "https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/products" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json"

# Get specific product
curl -X GET "https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/products/{id}" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json"

# Create new product
curl -X POST "https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/products" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Test Product",
    "code": "TEST001",
    "price": 29.99,
    "model": "Standard"
  }'

# List orders
curl -X GET "https://<API_ID>.execute-api.us-east-1.amazonaws.com/prod/orders" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json"
```

## 🏢 Infrastructure Components

### CDK Stacks Deployed
1. **AuditEvents** - Event logging and monitoring infrastructure
2. **AuthLayers** - Authentication Lambda layers and utilities
3. **ProductsAppLayers** - Product service Lambda layers
4. **EventsDdb** - DynamoDB tables for event storage
5. **ProductsApp** - Product management microservice
6. **OrdersAppLayers** - Order service Lambda layers
7. **OrdersApp** - Order processing microservice
8. **ECommerceApi** - Main API Gateway with Cognito authorization
9. **InvoicesAppLayer** - Invoice service Lambda layers
10. **InvoiceApi** - Invoice generation and management service

### Key AWS Services
- **Compute**: AWS Lambda (Node.js 20.x), Lambda Layers
- **API**: API Gateway REST API with Cognito User Pool authorization
- **Authentication**: Cognito User Pools (Customer & Admin), OAuth 2.0
- **Database**: DynamoDB tables (Products, Orders, Invoices, Events, BlockedUsers)
- **Messaging**: EventBridge custom bus, SNS topics, SQS queues
- **Storage**: S3 buckets for static assets and file storage
- **Monitoring**: CloudWatch Logs, X-Ray distributed tracing
- **Security**: IAM roles with least privilege, environment variables

## 📊 API Endpoints

| Service | Endpoint | Method | Auth Scope | Description |
|---------|----------|--------|------------|-------------|
| Products | `/products` | GET | `customer/web`, `customer/mobile`, `admin/web` | List all products |
| Products | `/products/{id}` | GET | `customer/web`, `customer/mobile`, `admin/web` | Get product by ID |
| Products | `/products` | POST | `admin/web` | Create new product |
| Products | `/products/{id}` | PUT | `admin/web` | Update product |
| Products | `/products/{id}` | DELETE | `admin/web` | Delete product |
| Orders | `/orders` | GET | `customer/web`, `customer/mobile`, `admin/web` | List user orders |
| Orders | `/orders` | POST | `customer/web`, `customer/mobile` | Create new order |
| Orders | `/orders/{id}` | DELETE | `customer/web`, `customer/mobile` | Cancel order |
| Orders | `/orders/events` | GET | `admin/web` | Get order events |

## 🔒 Security Features

### Implemented Security Measures
- **Environment Variables**: All sensitive data (emails, API keys) stored as environment variables
- **User Blocking System**: DynamoDB-based system to block malicious users
- **Cognito Authentication**: JWT tokens with proper scopes and expiration
- **IAM Least Privilege**: Each Lambda has minimal required permissions
- **Input Validation**: Request validation at API Gateway level
- **Audit Logging**: Comprehensive logging of all user actions

### Security Configuration Files
- `docs/SECURITY.md` - Security implementation details
- `scripts/user-management.js` - User blocking/unblocking utilities
- Environment variables configuration in Lambda functions

## 🔧 Environment Variables

Required environment variables (automatically set during deployment):

```env
# Cognito Configuration
USER_POOL_ID=us-east-1_XXXXXXXXX
CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
COGNITO_DOMAIN=your-domain-prefix

# DynamoDB Tables
PRODUCTS_TABLE=ServerlessEcommerce-Products
ORDERS_TABLE=ServerlessEcommerce-Orders
INVOICES_TABLE=ServerlessEcommerce-Invoices
EVENTS_TABLE=ServerlessEcommerce-Events
BLOCKED_USERS_TABLE=ServerlessEcommerce-BlockedUsers

# EventBridge
EVENT_BUS_NAME=ServerlessEcommerce-EventBus

# Email Configuration (SES)
SES_FROM_EMAIL=noreply@yourdomain.com
SES_REPLY_EMAIL=support@yourdomain.com
ALERT_EMAIL=admin@yourdomain.com
```

## 📈 Monitoring & Observability

### CloudWatch Dashboards
- Lambda function invocation metrics and error rates
- DynamoDB read/write capacity and throttling events
- API Gateway request counts and 4XX/5XX error rates
- Cognito authentication success/failure rates

### X-Ray Tracing
- End-to-end request tracing across all microservices
- Performance bottleneck identification
- Service dependency mapping

### Audit Trails
- All user actions logged to CloudWatch Logs
- Event-driven audit system with DynamoDB storage
- Compliance-ready audit reports

## 🛠️ Development & Deployment

### Local Development
```bash
# Install dependencies
npm install

# Run TypeScript compilation in watch mode
npm run watch

# Run tests
npm test

# Lint code
npm run lint
```

### Deployment Commands
```bash
# Deploy specific stack
cdk deploy ProductsApp

# Deploy with specific profile
cdk deploy --all --profile production

# View deployment diff
cdk diff

# Synthesize CloudFormation templates
cdk synth

# List all stacks
cdk list

# Destroy all infrastructure (⚠️ Use with caution)
cdk destroy --all --force
```

### Useful Scripts
```bash
# Check deployment status
./scripts/check-deployment.sh

# Create test users
./scripts/create-test-users.sh

# Monitor API health
./scripts/health-check.sh

# Export environment variables
./scripts/export-env.sh
```

## 🔍 Troubleshooting

### Common Issues

**Authentication Errors**
- Ensure you're using the correct OAuth scopes (`customer/web`, `customer/mobile`, `admin/web`)
- Check that the access token hasn't expired (default: 60 minutes)
- Verify the Cognito domain and client ID are correct

**API Gateway 403 Errors**
- Confirm the Authorization header format: `Bearer <access_token>`
- Check that the user has the required scope for the endpoint
- Verify the user isn't in the blocked users table

**DynamoDB Throttling**
- Monitor CloudWatch metrics for read/write capacity
- Consider enabling auto-scaling for high-traffic tables
- Review access patterns and optimize queries

**Lambda Cold Starts**
- Monitor X-Ray traces for initialization times
- Consider provisioned concurrency for critical functions
- Optimize Lambda package sizes and dependencies

### Debugging Commands
```bash
# View CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/"

# Check API Gateway logs
aws logs filter-log-events --log-group-name "API-Gateway-Execution-Logs"

# Monitor DynamoDB metrics
aws cloudwatch get-metric-statistics --namespace AWS/DynamoDB

# Test Cognito authentication
aws cognito-idp admin-initiate-auth --user-pool-id <POOL_ID> --client-id <CLIENT_ID>
```

## 💰 Cost Optimization

### Cost-Effective Configuration
- **Lambda**: Pay-per-request pricing with automatic scaling
- **DynamoDB**: On-demand billing for variable workloads
- **API Gateway**: Pay-per-API call with caching enabled
- **Cognito**: Free tier covers up to 50,000 MAUs
- **CloudWatch**: Basic monitoring included, detailed monitoring optional

### Estimated Monthly Costs (Low Traffic)
- Lambda: $0-5 (first 1M requests free)
- DynamoDB: $0-10 (25GB storage free)
- API Gateway: $0-5 (first 1M API calls free)
- Cognito: $0 (under 50K MAUs)
- **Total**: ~$0-20/month for development/testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add unit tests for new features
- Update documentation for API changes
- Ensure security best practices
- Test with multiple user scenarios

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` directory for detailed guides
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Security**: Report security vulnerabilities privately to the maintainers
- **Community**: Join our discussions for questions and best practices

---

**⚠️ Important Security Notes:**
- Never commit AWS credentials or sensitive data to version control
- Regularly rotate access keys and review IAM permissions
- Monitor CloudTrail logs for suspicious activities
- Keep dependencies updated and scan for vulnerabilities
- Use environment-specific configurations for different deployment stages
