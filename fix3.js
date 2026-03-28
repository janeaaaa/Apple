const fs = require('fs');

let html = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/blog/index.html', 'utf8');
const lines = html.split('\n');

// Find and fix line 92 - thinking button
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('data-category="thinking"')) {
        lines[i] = '<button class="nav-btn" data-category="thinking">思考记录</button>';
        console.log('Fixed line', i+1);
    }
}

html = lines.join('\n');
fs.writeFileSync('C:/Users/Administrator/.openclaw/workspace/blog/index.html', html);
console.log('Done!');