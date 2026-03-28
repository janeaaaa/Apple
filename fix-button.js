const fs = require('fs');

let html = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/blog/index.html', 'utf8');

// Find and replace the corrupt character in the thinking button
const lines = html.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('data-category="thinking"')) {
        // Replace any non-ASCII character after 思考记录 with nothing
        lines[i] = lines[i].replace(/思考记录[^\u0000-\u007F]*<\/button>/g, '思考记录</button>');
        console.log('Fixed line:', lines[i].trim());
    }
}

html = lines.join('\n');
fs.writeFileSync('./index.html', html);
console.log('Done!');