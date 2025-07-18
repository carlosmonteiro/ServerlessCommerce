# Deployment Guide

## Prerequisites

### Required Tools
- Node.js 18+ and npm
- AWS CLI v2
- AWS CDK CLI (`npm install -g aws-cdk`)
- Git

### AWS Account Setup
1. **Configure AWS CLI**:
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, and default region
   ```

2. **Verify AWS credentials**:
   ```bash
   aws sts get-caller-identity
   ```

3. **Required AWS permissions**:
   - CloudFormation (full access)
   - Lambda (full access)
   - API Gateway (full access)
   - DynamoDB (full access)
   - Cognito (full access)
   - IAM (create/manage roles and policies)
   - S3 (create/manage buckets)
   - EventBridge (full access)
   - SNS (full access)

## Step-by-Step Deployment

### 1. Project Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd ServerlessCommerce

# Install dependencies
npm install

# Build TypeScript code
npm run build
```

### 2. CDK Bootstrap (One-time setup)
```bash
# Bootstrap CDK in your AWS account/region
cdk bootstrap

# Verify bootstrap
aws cloudformation describe-stacks --stack-name CDKToolkit
```

### 3. Deploy Infrastructure
```bash
# Deploy all stacks
cdk deploy --all --require-approval never

# Or deploy stacks individually in order:
cdk deploy AuditEvents
cdk deploy AuthLayers
cdk deploy ProductsAppLayers
cdk deploy EventsDdb
cdk deploy ProductsApp
cdk deploy OrdersAppLayers
cdk deploy OrdersApp
cdk deploy ECommerceApi
cdk deploy InvoicesAppLayer
cdk deploy InvoiceApi
```

### 4. Post-Deployment Configuration

#### Get Deployment Information
```bash
# List all deployed stacks
cdk list

# Get API Gateway URL
aws apigateway get-rest-apis --query 'items[?name==`ECommerceApi`].{id:id,name:name}'

# Get Cognito User Pool details
aws cognito-idp list-user-pools --max-results 10
```

#### Create Test Users
```bash
# Get User Pool ID from deployment output
USER_POOL_ID="us-east-1_XXXXXXXXX"
CLIENT_ID="XXXXXXXXXXXXXXXXXXXXXXXXXX"

# Create customer test user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com Name=email_verified,Value=true Name=name,Value="Test Customer" \
  --temporary-password TempPass123! \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username test@example.com \
  --password "TestPass123!" \
  --permanent
```

## Environment-Specific Deployments

### Development Environment
```bash
# Use development profile
export AWS_PROFILE=development
cdk deploy --all --require-approval never
```

### Production Environment
```bash
# Use production profile
export AWS_PROFILE=production

# Deploy with additional safeguards
cdk deploy --all --require-approval broadening

# Enable termination protection
aws cloudformation update-termination-protection \
  --enable-termination-protection \
  --stack-name ECommerceApi
```

## Monitoring Deployment

### Check Stack Status
```bash
# List all stacks and their status
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# Get detailed stack information
aws cloudformation describe-stacks --stack-name ECommerceApi
```

### Verify Services
```bash
# Test API Gateway
curl -X GET "https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/products" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `Products`)].FunctionName'

# Verify DynamoDB tables
aws dynamodb list-tables --query 'TableNames[?contains(@, `ServerlessEcommerce`)]'
```

## Troubleshooting Deployment Issues

### Common Issues

**1. CDK Bootstrap Issues**
```bash
# Error: "This stack uses assets, so the toolkit stack must be deployed"
cdk bootstrap --force

# Check bootstrap stack
aws cloudformation describe-stacks --stack-name CDKToolkit
```

**2. Permission Errors**
```bash
# Error: "User is not authorized to perform..."
# Ensure your AWS user/role has the required permissions listed above
aws iam get-user
aws sts get-caller-identity
```

**3. Resource Conflicts**
```bash
# Error: "Resource already exists"
# Clean up conflicting resources or use different names
aws cognito-idp list-user-pool-domains
aws dynamodb list-tables
```

**4. Lambda Deployment Failures**
```bash
# Check Lambda function logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/"

# View specific function logs
aws logs filter-log-events --log-group-name "/aws/lambda/ProductsFetchFunction"
```

### Recovery Commands
```bash
# Rollback failed deployment
cdk deploy --rollback

# Force redeploy specific stack
cdk deploy ProductsApp --force

# Clean up and redeploy
cdk destroy ProductsApp
cdk deploy ProductsApp
```

## Cleanup

### Destroy Infrastructure
```bash
# Destroy all stacks (⚠️ This will delete all data)
cdk destroy --all --force

# Destroy specific stack
cdk destroy ECommerceApi

# Clean up CDK bootstrap (optional)
aws cloudformation delete-stack --stack-name CDKToolkit
```

### Manual Cleanup (if needed)
```bash
# Remove S3 buckets (if not empty)
aws s3 rm s3://your-bucket-name --recursive
aws s3 rb s3://your-bucket-name

# Delete CloudWatch log groups
aws logs delete-log-group --log-group-name "/aws/lambda/ProductsFetchFunction"

# Remove Cognito domains (if conflicts occur)
aws cognito-idp delete-user-pool-domain --domain your-domain-name
```

## Best Practices

### Security
- Use separate AWS accounts for dev/staging/production
- Enable CloudTrail for audit logging
- Regularly rotate access keys
- Use IAM roles instead of access keys where possible

### Cost Management
- Monitor AWS costs with Cost Explorer
- Set up billing alerts
- Use appropriate DynamoDB billing modes
- Clean up unused resources regularly

### Monitoring
- Set up CloudWatch alarms for critical metrics
- Enable X-Ray tracing for debugging
- Configure SNS notifications for alerts
- Regular health checks of API endpoints
