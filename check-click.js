const fs = require('fs');
const html = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/blog/index.html', 'utf8');

// Check for onclick patterns
const hasOnclick = html.includes('onclick');
const hasShowPost = html.includes('function showPost');

// Find all onclick attributes
const regex = /onclick="[^"]*"/g;
const matches = html.match(regex);

console.log('Has onclick:', hasOnclick);
console.log('Has showPost function:', hasShowPost);
console.log('onclick count:', matches ? matches.length : 0);
console.log('First few onclick:', matches ? matches.slice(0, 3) : 'none');