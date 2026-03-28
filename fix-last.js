const fs = require('fs');

let html = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/blog/index.html', 'utf8');

// Fix the last remaining corrupted button
html = html.replace(/鍐呭甯杈撳嚭/g, '内容输出');

fs.writeFileSync('C:/Users/Administrator/.openclaw/workspace/blog/index.html', html);
console.log('Fixed!');