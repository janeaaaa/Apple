const fs = require('fs');

const html = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/blog/index.html', 'utf8');
const lines = html.split('\n');

// Fix line 68 (index 67) - the thinking button
lines[67] = '<button class="nav-btn" data-category="thinking">思考记录</button>';

const newHtml = lines.join('\n');
fs.writeFileSync('C:/Users/Administrator/.openclaw/workspace/blog/index.html', newHtml);
console.log('Done - fixed thinking button');