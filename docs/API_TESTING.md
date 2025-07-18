# API Testing Guide

## Authentication Setup

### Step 1: Get Your Deployment Information

After deployment, collect these values:
```bash
# Get API Gateway URL
aws apigateway get-rest-apis --query 'items[?name==`ECommerceApi`].{id:id,name:name}'
# Result: API_ID = "89zvhwpmt1"
# API_URL = "https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod"

# Get Cognito User Pool details
aws cognito-idp list-user-pools --max-results 10
# Result: USER_POOL_ID = "us-east-1_e54TdlNbu"

# Get User Pool Client details
aws cognito-idp list-user-pool-clients --user-pool-id us-east-1_e54TdlNbu
# Result: CLIENT_ID = "14qeip4cvcrlds754flbgpbht3"

# Get Cognito Domain
aws cognito-idp describe-user-pool --user-pool-id us-east-1_e54TdlNbu --query 'UserPool.Domain'
# Result: COGNITO_DOMAIN = "pcs2-customer-service-1752868629472"
```

### Step 2: Create Test Users

```bash
# Customer user
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_e54TdlNbu \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com Name=email_verified,Value=true Name=name,Value="Test Customer" \
  --temporary-password TempPass123! \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id us-east-1_e54TdlNbu \
  --username test@example.com \
  --password "TestPass123!" \
  --permanent

# Admin user (if you have admin pool)
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_DJYloKVMZ \
  --username admin@example.com \
  --user-attributes Name=email,Value=admin@example.com Name=email_verified,Value=true Name=name,Value="Test Admin" \
  --temporary-password AdminPass123! \
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password \
  --user-pool-id us-east-1_DJYloKVMZ \
  --username admin@example.com \
  --password "AdminPass123!" \
  --permanent
```

## Getting Access Tokens

### Method 1: Browser OAuth Flow (Recommended)

1. **Open authentication URL in browser**:
   ```
   https://pcs2-customer-service-1752868629472.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=14qeip4cvcrlds754flbgpbht3&response_type=token&scope=customer/web&redirect_uri=https://example.com
   ```

2. **Login with credentials**:
   - Email: `test@example.com`
   - Password: `TestPass123!`

3. **Extract token from redirect URL**:
   ```
   https://example.com#access_token=eyJraWQiOiI0QktxYWJIcHBWOTFl...&expires_in=3600&token_type=Bearer
   ```

### Method 2: Using Test HTML Page

Open the `test-auth.html` file in your browser for a guided flow.

### Method 3: Programmatic (Node.js)

```javascript
const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

async function getAccessToken() {
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: '14qeip4cvcrlds754flbgpbht3',
        AuthParameters: {
            USERNAME: 'test@example.com',
            PASSWORD: 'TestPass123!'
        }
    };
    
    try {
        const result = await cognito.initiateAuth(params).promise();
        return result.AuthenticationResult.AccessToken;
    } catch (error) {
        console.error('Authentication failed:', error);
    }
}
```

## API Endpoint Testing

### Products API

#### List All Products
```bash
curl -X GET "https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod/products" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "products": [
    {
      "id": "product-123",
      "productName": "Sample Product",
      "code": "SAMPLE001",
      "price": 29.99,
      "model": "Standard"
    }
  ]
}
```

#### Get Specific Product
```bash
curl -X GET "https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod/products/product-123" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

#### Create New Product (Admin only)
```bash
curl -X POST "https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod/products" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "New Test Product",
    "code": "TEST001",
    "price": 49.99,
    "model": "Premium"
  }'
```

#### Update Product (Admin only)
```bash
curl -X PUT "https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod/products/product-123" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Updated Product Name",
    "price": 39.99
  }'
```

#### Delete Product (Admin only)
```bash
curl -X DELETE "https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod/products/product-123" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Orders API

#### List User Orders
```bash
curl -X GET "https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod/orders" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

#### Create New Order
```bash
curl -X POST "https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod/orders" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "productId": "product-123",
        "quantity": 2
      }
    ],
    "shipping": {
      "address": "123 Test St",
      "city": "Test City",
      "zipCode": "12345"
    }
  }'
```

#### Cancel Order
```bash
curl -X DELETE "https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod/orders/order-456" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get Order Events (Admin only)
```bash
curl -X GET "https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod/orders/events" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

## Testing with Different Scopes

### Customer Web Scope (`customer/web`)
- Can read products
- Can manage own orders
- Cannot access admin endpoints

### Customer Mobile Scope (`customer/mobile`)
- Same as customer/web
- Optimized for mobile responses

### Admin Web Scope (`admin/web`)
- Full access to all endpoints
- Can manage products
- Can view all orders and events

## Error Handling

### Common HTTP Status Codes

**401 Unauthorized**
```json
{
  "message": "Unauthorized"
}
```
- Check if access token is valid and not expired
- Verify Authorization header format: `Bearer <token>`

**403 Forbidden**
```json
{
  "message": "Forbidden"
}
```
- User doesn't have required scope for this endpoint
- Check if user is blocked in the system

**404 Not Found**
```json
{
  "message": "Not Found"
}
```
- Resource doesn't exist
- Check endpoint URL and resource ID

**500 Internal Server Error**
```json
{
  "message": "Internal server error"
}
```
- Check CloudWatch logs for Lambda function errors
- Verify DynamoDB table permissions

## Automated Testing Scripts

### Bash Script for API Testing
```bash
#!/bin/bash

# Configuration
API_URL="https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod"
ACCESS_TOKEN="YOUR_ACCESS_TOKEN_HERE"

# Test Products API
echo "Testing Products API..."
curl -s -X GET "$API_URL/products" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test Orders API
echo "Testing Orders API..."
curl -s -X GET "$API_URL/orders" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
```

### Python Test Script
```python
import requests
import json

class ECommerceAPITester:
    def __init__(self, api_url, access_token):
        self.api_url = api_url
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    
    def test_products(self):
        response = requests.get(f'{self.api_url}/products', headers=self.headers)
        print(f'Products API: {response.status_code}')
        return response.json()
    
    def test_orders(self):
        response = requests.get(f'{self.api_url}/orders', headers=self.headers)
        print(f'Orders API: {response.status_code}')
        return response.json()

# Usage
tester = ECommerceAPITester(
    'https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod',
    'YOUR_ACCESS_TOKEN'
)
tester.test_products()
tester.test_orders()
```

## Performance Testing

### Load Testing with Artillery
```yaml
# artillery-config.yml
config:
  target: 'https://89zvhwpmt1.execute-api.us-east-1.amazonaws.com/prod'
  phases:
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      Authorization: 'Bearer YOUR_ACCESS_TOKEN'
      Content-Type: 'application/json'

scenarios:
  - name: 'Get Products'
    requests:
      - get:
          url: '/products'
```

Run with: `artillery run artillery-config.yml`

### Monitoring During Tests
```bash
# Monitor Lambda metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=ProductsFetchFunction \
  --start-time 2025-07-18T20:00:00Z \
  --end-time 2025-07-18T21:00:00Z \
  --period 300 \
  --statistics Sum

# Monitor API Gateway metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=ECommerceApi \
  --start-time 2025-07-18T20:00:00Z \
  --end-time 2025-07-18T21:00:00Z \
  --period 300 \
  --statistics Sum
```
