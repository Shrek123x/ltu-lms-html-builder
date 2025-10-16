/**
 * AWS Lambda Function - Dynamic HTML Generator
 * 
 * This Lambda function generates dynamic HTML pages based on input data.
 * It can be triggered by API Gateway, S3 events, or other AWS services.
 * 
 * REQUIREMENT: Add a Lambda function that creates dynamic pages of your HTML output
 * 
 * DEPLOYMENT:
 * 1. Install dependencies: npm install
 * 2. Zip the function: zip -r function.zip index.js node_modules
 * 3. Create Lambda via AWS CLI:
 *    aws lambda create-function \
 *      --function-name ltu-html-generator \
 *      --runtime nodejs20.x \
 *      --handler index.handler \
 *      --zip-file fileb://function.zip \
 *      --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role
 */

// Lambda handler function
exports.handler = async (event) => {
  console.log('Lambda function invoked:', JSON.stringify(event, null, 2));

  try {
    // Extract data from event
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    
    const {
      title = 'LTU LMS HTML Builder',
      heading = 'Welcome to CourtRoom Simulator',
      messages = [],
      theme = 'light',
    } = body || {};

    // Generate dynamic HTML
    const html = generateHTML({
      title,
      heading,
      messages,
      theme,
      timestamp: new Date().toISOString(),
    });

    // Return response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*', // Enable CORS
        'Cache-Control': 'no-cache',
      },
      body: html,
    };
  } catch (error) {
    console.error('Error generating HTML:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to generate HTML',
        message: error.message,
      }),
    };
  }
};

/**
 * Generate dynamic HTML page
 * 
 * @param {Object} data - Page data
 * @param {string} data.title - Page title
 * @param {string} data.heading - Main heading
 * @param {Array} data.messages - Array of message objects
 * @param {string} data.theme - Theme (light/dark)
 * @param {string} data.timestamp - Generation timestamp
 * @returns {string} HTML string
 */
function generateHTML({ title, heading, messages, theme, timestamp }) {
  const isDark = theme === 'dark';
  
  const styles = `
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background: ${isDark ? '#1a1a1a' : '#f5f5f5'};
      color: ${isDark ? '#e0e0e0' : '#333'};
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: ${isDark ? '#2a2a2a' : 'white'};
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, ${isDark ? '0.5' : '0.1'});
    }
    
    h1 {
      color: ${isDark ? '#4a9eff' : '#2563eb'};
      border-bottom: 3px solid ${isDark ? '#4a9eff' : '#2563eb'};
      padding-bottom: 15px;
      margin-top: 0;
    }
    
    .timestamp {
      color: ${isDark ? '#888' : '#666'};
      font-size: 14px;
      margin-bottom: 30px;
    }
    
    .messages {
      margin-top: 30px;
    }
    
    .message {
      background: ${isDark ? '#363636' : '#f9f9f9'};
      padding: 15px 20px;
      margin-bottom: 15px;
      border-radius: 8px;
      border-left: 4px solid ${isDark ? '#4a9eff' : '#2563eb'};
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .message:hover {
      transform: translateX(5px);
      box-shadow: 0 2px 10px rgba(0, 0, 0, ${isDark ? '0.3' : '0.1'});
    }
    
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .message-from {
      font-weight: 600;
      color: ${isDark ? '#4a9eff' : '#2563eb'};
      text-transform: capitalize;
    }
    
    .message-level {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .level-info {
      background: #3b82f6;
      color: white;
    }
    
    .level-warning {
      background: #f59e0b;
      color: white;
    }
    
    .level-urgent {
      background: #ef4444;
      color: white;
    }
    
    .message-text {
      font-size: 16px;
    }
    
    .message-time {
      font-size: 13px;
      color: ${isDark ? '#888' : '#666'};
      margin-top: 5px;
    }
    
    .no-messages {
      text-align: center;
      padding: 50px 20px;
      color: ${isDark ? '#888' : '#666'};
      font-style: italic;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid ${isDark ? '#444' : '#e0e0e0'};
      text-align: center;
      color: ${isDark ? '#888' : '#666'};
      font-size: 14px;
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: ${isDark ? '#363636' : '#f0f7ff'};
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: ${isDark ? '#4a9eff' : '#2563eb'};
    }
    
    .stat-label {
      font-size: 14px;
      color: ${isDark ? '#888' : '#666'};
      margin-top: 5px;
    }
  `;

  const messagesByLevel = {
    info: messages.filter(m => m.level === 'info').length,
    warning: messages.filter(m => m.level === 'warning').length,
    urgent: messages.filter(m => m.level === 'urgent').length,
  };

  const messagesHTML = messages.length > 0
    ? messages.map(msg => `
        <div class="message">
          <div class="message-header">
            <span class="message-from">${escapeHtml(msg.from || 'System')}</span>
            <span class="message-level level-${msg.level || 'info'}">${msg.level || 'info'}</span>
          </div>
          <div class="message-text">${escapeHtml(msg.text)}</div>
          <div class="message-time">
            ${msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Just now'}
          </div>
        </div>
      `).join('')
    : '<div class="no-messages">No messages to display</div>';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(heading)}</h1>
    <div class="timestamp">Generated: ${new Date(timestamp).toLocaleString()}</div>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${messages.length}</div>
        <div class="stat-label">Total Messages</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${messagesByLevel.info}</div>
        <div class="stat-label">Info</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${messagesByLevel.warning}</div>
        <div class="stat-label">Warnings</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${messagesByLevel.urgent}</div>
        <div class="stat-label">Urgent</div>
      </div>
    </div>
    
    <div class="messages">
      ${messagesHTML}
    </div>
    
    <div class="footer">
      <p>Generated by AWS Lambda | LTU LMS HTML Builder</p>
      <p>Theme: ${theme} | Total Messages: ${messages.length}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return String(text).replace(/[&<>"']/g, char => map[char]);
}

/**
 * Example test event for local testing:
 * 
 * {
 *   "body": {
 *     "title": "CourtRoom Messages",
 *     "heading": "Debug Session Report",
 *     "theme": "dark",
 *     "messages": [
 *       {
 *         "text": "Fix alt in img1",
 *         "from": "agile",
 *         "level": "info",
 *         "timestamp": "2025-10-15T10:00:00Z"
 *       },
 *       {
 *         "text": "Fix input validation",
 *         "from": "security",
 *         "level": "warning",
 *         "timestamp": "2025-10-15T10:05:00Z"
 *       },
 *       {
 *         "text": "Fix User login - CRITICAL",
 *         "from": "payment",
 *         "level": "urgent",
 *         "timestamp": "2025-10-15T10:10:00Z"
 *       }
 *     ]
 *   }
 * }
 */
