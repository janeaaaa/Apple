const fs = require('fs');

let content = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/blog/generate-blog.js', 'utf8');

// Fix the thinking button - line 92
content = content.replace(/data-category="thinking">[^<]+</, 'data-category="thinking">思考记录</button>');

fs.writeFileSync('C:/Users/Administrator/.openclaw/workspace/blog/generate-blog.js', content);
console.log('Fixed!');