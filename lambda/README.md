# AWS Lambda Deployment Guide

This guide explains how to deploy the HTML generator Lambda function to AWS.

## Overview

This Lambda function generates dynamic HTML pages based on input data. It can be triggered via:
- API Gateway (HTTP requests)
- Direct Lambda invocation
- S3 events
- EventBridge rules

## Prerequisites

- AWS CLI configured (`aws configure`)
- AWS account with Lambda permissions
- Node.js installed (for local testing)

---

## Local Testing

Before deploying, test the function locally:

```bash
cd lambda
node test-local.js
```

This will:
1. Run the Lambda handler with test data
2. Generate an HTML file (`test-output.html`)
3. Display the output in your browser

---

## Deployment Steps

### Option 1: AWS CLI (Recommended)

#### Step 1: Create IAM Role for Lambda

Create `lambda-trust-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Create the role:

```bash
aws iam create-role \
  --role-name ltu-lambda-execution-role \
  --assume-role-policy-document file://lambda-trust-policy.json
```

Attach basic execution policy:

```bash
aws iam attach-role-policy \
  --role-name ltu-lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

#### Step 2: Package the Function

```bash
cd lambda
zip -r function.zip index.js package.json
```

On Windows (PowerShell):
```powershell
Compress-Archive -Path index.js,package.json -DestinationPath function.zip -Force
```

#### Step 3: Create Lambda Function

```bash
aws lambda create-function \
  --function-name ltu-html-generator \
  --runtime nodejs20.x \
  --role arn:aws:iam::<AWS_ACCOUNT_ID>:role/ltu-lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 10 \
  --memory-size 256 \
  --description "Generates dynamic HTML pages for LTU LMS"
```

#### Step 4: Test the Function

```bash
aws lambda invoke \
  --function-name ltu-html-generator \
  --payload file://test-payload.json \
  --cli-binary-format raw-in-base64-out \
  response.json

cat response.json
```

Create `test-payload.json`:

```json
{
  "body": "{\"title\":\"Test Page\",\"heading\":\"Hello from Lambda\",\"theme\":\"dark\",\"messages\":[{\"text\":\"Test message\",\"from\":\"system\",\"level\":\"info\",\"timestamp\":\"2025-10-15T10:00:00Z\"}]}"
}
```

---

### Option 2: AWS Management Console

1. **Navigate to Lambda Console**
   - Go to https://console.aws.amazon.com/lambda/

2. **Create Function**
   - Click "Create function"
   - Choose "Author from scratch"
   - Function name: `ltu-html-generator`
   - Runtime: Node.js 20.x
   - Create a new role with basic Lambda permissions

3. **Upload Code**
   - In the Code source section, click "Upload from" > ".zip file"
   - Upload your `function.zip`

4. **Configure**
   - Timeout: 10 seconds
   - Memory: 256 MB

5. **Test**
   - Click "Test" tab
   - Create new test event with sample data
   - Click "Test" to run

---

## Integrate with API Gateway

To make the Lambda function accessible via HTTP:

### Step 1: Create API Gateway

```bash
aws apigatewayv2 create-api \
  --name ltu-html-generator-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:us-east-1:<ACCOUNT_ID>:function:ltu-html-generator
```

### Step 2: Grant API Gateway Permission to Invoke Lambda

```bash
aws lambda add-permission \
  --function-name ltu-html-generator \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com
```

### Step 3: Test the API

```bash
curl -X POST https://<API_ID>.execute-api.us-east-1.amazonaws.com/default/ltu-html-generator \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Report",
    "heading": "CourtRoom Session",
    "theme": "light",
    "messages": [
      {
        "text": "Fix alt in img1",
        "from": "agile",
        "level": "info",
        "timestamp": "2025-10-15T10:00:00Z"
      }
    ]
  }'
```

---

## Integration with Next.js App

Add a route in your Next.js app to call the Lambda function:

Create `app/api/generate-html/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const LAMBDA_ENDPOINT = process.env.LAMBDA_API_ENDPOINT || 
  'https://<API_ID>.execute-api.us-east-1.amazonaws.com/default/ltu-html-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const html = await response.text();

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate HTML' },
      { status: 500 }
    );
  }
}
```

---

## Update Lambda Function

After making changes to the code:

```bash
# Re-package
cd lambda
zip -r function.zip index.js package.json

# Update function
aws lambda update-function-code \
  --function-name ltu-html-generator \
  --zip-file fileb://function.zip
```

---

## Monitoring

### View Logs

```bash
aws logs tail /aws/lambda/ltu-html-generator --follow
```

### View Metrics

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=ltu-html-generator \
  --start-time 2025-10-15T00:00:00Z \
  --end-time 2025-10-15T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

---

## Cost Optimization

Lambda pricing:
- **Free Tier**: 1 million requests/month + 400,000 GB-seconds compute
- **After Free Tier**: $0.20 per 1M requests + $0.0000166667 per GB-second

Example cost for 100,000 requests/month with 256MB, 1s average:
- Requests: $0.02
- Compute: $0.42
- **Total: ~$0.44/month**

---

## Security Best Practices

1. **Use IAM roles** - Never hardcode credentials
2. **Enable encryption** - Encrypt environment variables
3. **Validate input** - Always sanitize user input (XSS protection)
4. **Use VPC** - If accessing private resources
5. **Enable CloudTrail** - Audit Lambda invocations
6. **Set resource limits** - Configure timeout and memory appropriately

---

## Troubleshooting

### Function times out
- Increase timeout in Lambda configuration
- Check for infinite loops or blocking operations

### Permission denied
- Verify IAM role has necessary permissions
- Check API Gateway permissions

### Module not found
- Ensure all dependencies are in function.zip
- Check Node.js version compatibility

---

## Advanced: Serverless Framework

For easier management, use Serverless Framework:

```yaml
# serverless.yml
service: ltu-html-generator

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1

functions:
  generateHtml:
    handler: index.handler
    events:
      - http:
          path: generate
          method: post
          cors: true
```

Deploy with:
```bash
npm install -g serverless
serverless deploy
```

---

## Next Steps

1. Add authentication (API keys or Cognito)
2. Implement caching (CloudFront)
3. Add more HTML templates
4. Store generated HTML in S3
5. Create scheduled reports with EventBridge

---

For more information:
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
