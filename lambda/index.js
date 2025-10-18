const http = require('http');

exports.handler = async (event) => {
    console.log('Lambda invoked. Raw event:', JSON.stringify(event, null, 2));
    
    try {
        let parsedEvent = event;
        if (event.body && typeof event.body === 'string') {
            console.log('Parsing event.body from Function URL');
            parsedEvent = JSON.parse(event.body);
        }
        
        let messages = parsedEvent.messages || [];
        const theme = parsedEvent.theme || 'light';
        
        if (parsedEvent.fetchFromEC2) {
            const ec2ApiUrl = parsedEvent.ec2ApiUrl || 'http://52.63.56.25:3000/api/messages';
            console.log('Fetching from EC2:', ec2ApiUrl);
            messages = await fetchFromEC2(ec2ApiUrl);
        }
        
        if (!messages || messages.length === 0) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'No messages provided' })
            };
        }
        
        const html = generateHTML(messages, theme);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: html
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function fetchFromEC2(url) {
    return new Promise((resolve, reject) => {
        http.get(url, { timeout: 25000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
    });
}

function generateHTML(messages, theme) {
    const dark = theme === 'dark';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>LTU Messages</title><style>body{font-family:Arial;background:${dark?'#1a1a1a':'#fff'};color:${dark?'#e0e0e0':'#333'};padding:20px}.header{background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;padding:30px;border-radius:10px;margin-bottom:20px}.message{background:${dark?'#2d2d2d':'#f8f9fa'};border-left:4px solid #3b82f6;padding:15px;margin:10px 0;border-radius:5px}.badge{padding:3px 10px;border-radius:10px;font-size:0.85em;margin:5px}.success{background:#d4edda;color:#155724}.info{background:#d1ecf1;color:#0c5460}.warning{background:#fff3cd;color:#856404}.error{background:#f8d7da;color:#721c24}</style></head><body><div class="header"><h1> LTU LMS Messages</h1><p>Generated: ${new Date().toLocaleString()} | Theme: ${theme}</p></div>${messages.map(m=>`<div class="message"><div><strong>Message #${m.id}</strong> <span class="badge ${m.level}">${m.level}</span> <span class="badge">${m.resolved?' Resolved':' Open'}</span></div><p>${m.text}</p><small>From: ${m.from} | ${new Date(m.timestamp).toLocaleString()}</small></div>`).join('')}</body></html>`;
}
