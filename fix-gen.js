const fs = require('fs');

let content = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/blog/generate-blog.js', 'utf8');

// Fix line 93 - missing <button tag
content = content.replace('思考记录</button>button class="nav-btn" data-category="analysis">项目分析</button>', '思考记录</button>\n                <button class="nav-btn" data-category="analysis">项目分析</button>');

// Fix corrupt characters
content = content.replace('最近动?', '最近动态');
content = content.replace('标签?', '标签');

fs.writeFileSync('C:/Users/Administrator/.openclaw/workspace/blog/generate-blog.js', content);
console.log('Fixed generate-blog.js');