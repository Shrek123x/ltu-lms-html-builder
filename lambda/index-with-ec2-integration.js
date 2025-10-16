/**
 * AWS Lambda Function - HTML Generator with EC2 Database Integration
 * Fetches messages from EC2 API endpoint and generates HTML
 */

exports.handler = async (event) => {
    console.log('Lambda invoked with event:', JSON.stringify(event));

    try {
        // Option 1: Use messages from event (manual invocation)
        let messages = event.messages || [];
        let theme = event.theme || 'light';

        // Option 2: Fetch from EC2 API if no messages provided
        if (messages.length === 0 && event.fetchFromEC2) {
            const ec2ApiUrl = event.ec2ApiUrl || process.env.EC2_API_URL || 'http://52.63.56.25:3000/api/messages';
            
            console.log('Fetching messages from EC2:', ec2ApiUrl);
            
            try {
                const response = await fetch(ec2ApiUrl);
                if (!response.ok) {
                    throw new Error(`EC2 API returned ${response.status}`);
                }
                messages = await response.json();
                console.log(`Fetched ${messages.length} messages from EC2`);
            } catch (fetchError) {
                console.error('Error fetching from EC2:', fetchError);
                return {
                    statusCode: 500,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: 'Failed to fetch messages from EC2',
                        details: fetchError.message 
                    })
                };
            }
        }

        // Validate messages
        if (!messages || messages.length === 0) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: 'No messages provided',
                    hint: 'Either provide messages in event.messages or set event.fetchFromEC2 = true'
                })
            };
        }

        // Generate HTML
        const html = generateHTML(messages, theme);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*'
            },
            body: html
        };

    } catch (error) {
        console.error('Error in Lambda handler:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            })
        };
    }
};

/**
 * Generate HTML from messages
 */
function generateHTML(messages, theme = 'light') {
    // Calculate statistics
    const stats = {
        total: messages.length,
        info: messages.filter(m => m.level === 'info').length,
        warning: messages.filter(m => m.level === 'warning').length,
        error: messages.filter(m => m.level === 'error').length,
        success: messages.filter(m => m.level === 'success').length,
        resolved: messages.filter(m => m.resolved).length,
        unresolved: messages.filter(m => !m.resolved).length
    };

    // Group by sender
    const bySender = {};
    messages.forEach(m => {
        bySender[m.from] = (bySender[m.from] || 0) + 1;
    });

    // Colors based on theme
    const isDark = theme === 'dark';
    const colors = {
        bg: isDark ? '#1a1a1a' : '#ffffff',
        text: isDark ? '#ffffff' : '#000000',
        card: isDark ? '#2d2d2d' : '#f5f5f5',
        border: isDark ? '#404040' : '#e0e0e0',
        info: '#3b82f6',
        warning: '#f59e0b',
        error: '#ef4444',
        success: '#10b981'
    };

    // Generate message cards HTML
    const messageCards = messages.map(msg => {
        const levelColor = colors[msg.level] || colors.info;
        const date = new Date(msg.timestamp);
        
        return `
        <div class="message-card" data-level="${msg.level}">
            <div class="message-header">
                <span class="message-level" style="background-color: ${levelColor}">
                    ${msg.level.toUpperCase()}
                </span>
                <span class="message-from">${escapeHtml(msg.from)}</span>
                ${msg.resolved ? '<span class="message-resolved">✓ Resolved</span>' : ''}
            </div>
            <div class="message-text">${escapeHtml(msg.text)}</div>
            <div class="message-footer">
                <span class="message-id">ID: ${msg.id}</span>
                <span class="message-time">${date.toLocaleString()}</span>
            </div>
        </div>`;
    }).join('');

    // Generate sender stats HTML
    const senderStats = Object.entries(bySender)
        .map(([sender, count]) => `<li>${escapeHtml(sender)}: ${count} messages</li>`)
        .join('');

    // Complete HTML document
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CourtRoom Messages Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: ${colors.bg};
            color: ${colors.text};
            padding: 20px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background-color: ${colors.card};
            border-radius: 10px;
            border: 2px solid ${colors.border};
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            color: ${isDark ? '#aaa' : '#666'};
            font-size: 0.9rem;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background-color: ${colors.card};
            padding: 20px;
            border-radius: 8px;
            border: 2px solid ${colors.border};
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: ${isDark ? '#aaa' : '#666'};
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .stat-info { color: ${colors.info}; }
        .stat-warning { color: ${colors.warning}; }
        .stat-error { color: ${colors.error}; }
        .stat-success { color: ${colors.success}; }
        
        .filters {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .filter-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: transform 0.2s;
        }
        
        .filter-btn:hover {
            transform: scale(1.05);
        }
        
        .filter-btn.active {
            box-shadow: 0 0 0 3px ${colors.border};
        }
        
        .messages {
            display: grid;
            gap: 15px;
        }
        
        .message-card {
            background-color: ${colors.card};
            border-left: 4px solid ${colors.info};
            padding: 20px;
            border-radius: 8px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .message-card:hover {
            transform: translateX(5px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .message-card[data-level="info"] { border-left-color: ${colors.info}; }
        .message-card[data-level="warning"] { border-left-color: ${colors.warning}; }
        .message-card[data-level="error"] { border-left-color: ${colors.error}; }
        .message-card[data-level="success"] { border-left-color: ${colors.success}; }
        
        .message-header {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 10px;
            flex-wrap: wrap;
        }
        
        .message-level {
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: bold;
            color: white;
        }
        
        .message-from {
            font-weight: 600;
            color: ${isDark ? '#aaa' : '#555'};
        }
        
        .message-resolved {
            margin-left: auto;
            padding: 4px 12px;
            background-color: ${colors.success};
            color: white;
            border-radius: 4px;
            font-size: 0.75rem;
        }
        
        .message-text {
            font-size: 1.1rem;
            margin-bottom: 10px;
        }
        
        .message-footer {
            display: flex;
            justify-content: space-between;
            color: ${isDark ? '#777' : '#999'};
            font-size: 0.85rem;
        }
        
        .sender-stats {
            margin-top: 30px;
            padding: 20px;
            background-color: ${colors.card};
            border-radius: 8px;
            border: 2px solid ${colors.border};
        }
        
        .sender-stats h3 {
            margin-bottom: 15px;
        }
        
        .sender-stats ul {
            list-style-position: inside;
        }
        
        .sender-stats li {
            padding: 5px 0;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            color: ${isDark ? '#777' : '#999'};
            font-size: 0.85rem;
            padding: 20px;
            border-top: 2px solid ${colors.border};
        }
        
        .no-messages {
            text-align: center;
            padding: 60px 20px;
            color: ${isDark ? '#777' : '#999'};
            font-size: 1.2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to CourtRoom Simulator</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">Total Messages</div>
            </div>
            <div class="stat-card">
                <div class="stat-number stat-info">${stats.info}</div>
                <div class="stat-label">Info</div>
            </div>
            <div class="stat-card">
                <div class="stat-number stat-warning">${stats.warning}</div>
                <div class="stat-label">Warnings</div>
            </div>
            <div class="stat-card">
                <div class="stat-number stat-error">${stats.error}</div>
                <div class="stat-label">Urgent</div>
            </div>
            <div class="stat-card">
                <div class="stat-number stat-success">${stats.success}</div>
                <div class="stat-label">Success</div>
            </div>
        </div>
        
        <div class="filters">
            <button class="filter-btn active" onclick="filterMessages('all')" style="background-color: ${colors.border}; color: ${colors.text};">
                All (${stats.total})
            </button>
            <button class="filter-btn" onclick="filterMessages('info')" style="background-color: ${colors.info}; color: white;">
                Info (${stats.info})
            </button>
            <button class="filter-btn" onclick="filterMessages('warning')" style="background-color: ${colors.warning}; color: white;">
                Warnings (${stats.warning})
            </button>
            <button class="filter-btn" onclick="filterMessages('error')" style="background-color: ${colors.error}; color: white;">
                Urgent (${stats.error})
            </button>
            <button class="filter-btn" onclick="filterMessages('success')" style="background-color: ${colors.success}; color: white;">
                Success (${stats.success})
            </button>
        </div>
        
        <div class="messages" id="messages">
            ${messages.length > 0 ? messageCards : '<div class="no-messages">No messages to display</div>'}
        </div>
        
        ${messages.length > 0 ? `
        <div class="sender-stats">
            <h3>Messages by Sender</h3>
            <ul>${senderStats}</ul>
        </div>
        ` : ''}
        
        <div class="footer">
            <p><strong>Generated by AWS Lambda</strong> | LTU LMS HTML Builder</p>
            <p>Theme: ${theme} | Total Messages: ${stats.total}</p>
        </div>
    </div>
    
    <script>
        function filterMessages(level) {
            const cards = document.querySelectorAll('.message-card');
            const buttons = document.querySelectorAll('.filter-btn');
            
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            cards.forEach(card => {
                if (level === 'all' || card.dataset.level === level) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>`;
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
