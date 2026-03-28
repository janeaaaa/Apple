const fs = require('fs');
const html = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/blog/index.html', 'utf8');

// Find renderPosts function and check output
const match = html.match(/function renderPosts[\s\S]*?\{[\s\S]*?\}/);
if (match) {
    console.log('renderPosts function found');
    console.log('Sample output:', match[0].substring(0, 300));
}

// Check actual post items in HTML
const postItems = html.match(/class="post-item"[^>]*>/g);
console.log('Post items count:', postItems ? postItems.length : 0);
if (postItems && postItems.length > 0) {
    console.log('First post item:', postItems[0]);
}