const fs = require('fs');
const html = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/blog/index.html', 'utf8');

// Check allPosts data
const allPostsMatch = html.match(/var allPosts = (\[[\s\S]*?\]);/);
if (allPostsMatch) {
    console.log('allPosts data exists');
    try {
        const allPosts = JSON.parse(allPostsMatch[1]);
        console.log('Posts count:', allPosts.length);
        console.log('First post:', allPosts[0] ? allPosts[0].id + ' - ' + allPosts[0].title : 'none');
    } catch (e) {
        console.log('JSON parse error:', e.message);
    }
}

// Check if renderPosts is called at startup
const hasRenderPostsCall = html.includes('renderPosts(allPosts)');
console.log('renderPosts called:', hasRenderPostsCall);