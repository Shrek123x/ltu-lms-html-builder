/**
 * Local Testing Script for Lambda Function
 * 
 * Run this to test the Lambda function locally before deploying to AWS
 * Usage: node test-local.js
 */

const { handler } = require('./index');

// Test event with sample data
const testEvent = {
  body: JSON.stringify({
    title: 'CourtRoom Debug Session',
    heading: 'Message Report - Test Environment',
    theme: 'dark',
    messages: [
      {
        text: 'Fix alt in img1',
        from: 'agile',
        level: 'info',
        timestamp: '2025-10-15T10:00:00Z'
      },
      {
        text: 'Fix input validation',
        from: 'security',
        level: 'warning',
        timestamp: '2025-10-15T10:05:00Z'
      },
      {
        text: 'Fix User login - CRITICAL',
        from: 'payment',
        level: 'urgent',
        timestamp: '2025-10-15T10:10:00Z'
      },
      {
        text: 'Are you done with sprint 1?',
        from: 'boss',
        level: 'info',
        timestamp: '2025-10-15T10:15:00Z'
      },
      {
        text: 'Fix Secure Database',
        from: 'ops',
        level: 'urgent',
        timestamp: '2025-10-15T10:20:00Z'
      }
    ]
  })
};

// Test the handler
(async () => {
  console.log('🧪 Testing Lambda function locally...\n');
  
  try {
    const result = await handler(testEvent);
    
    console.log('✅ Function executed successfully!\n');
    console.log('Status Code:', result.statusCode);
    console.log('Headers:', JSON.stringify(result.headers, null, 2));
    console.log('\n📄 Generated HTML Preview (first 500 chars):');
    console.log(result.body.substring(0, 500) + '...\n');
    
    // Optionally save to file
    const fs = require('fs');
    fs.writeFileSync('test-output.html', result.body);
    console.log('💾 Full HTML saved to test-output.html');
    console.log('🌐 Open test-output.html in your browser to see the result!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
