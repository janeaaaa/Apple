const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Replace the broken regex in showPost function
html = html.replace(
    /\.replace\(\/\*\*\(.*?\)\*\*\/g, '<strong>\$1<\/strong>'\)/,
    ".replace(/####TEMP_BOLD_START([\\s\\S]*?)####TEMP_BOLD_END/g, '<strong>$1</strong>')"
);

// Replace ** in content data with placeholders
html = html.replace(/\*\*/g, '####TEMP_BOLD_START').replace(/\*\*/g, '####TEMP_BOLD_END');

fs.writeFileSync(indexPath, html);
console.log('Fixed!');
