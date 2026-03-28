const fs = require('fs');

const html = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/blog/index.html', 'utf8');
const lines = html.split('\n');

// Fix all the corrupted button labels
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('nav-btn') && lines[i].includes('data-category')) {
        lines[i] = lines[i]
            .replace(/鍏ㄩ儴/g, '全部')
            .replace(/浠诲姟鏃ュ織/g, '任务日志')
            .replace(/椤圭洰鍒嗘瀽/g, '项目分析')
            .replace(/鍥㈤槦閰嶇疆/g, '团队配置')
            .replace(/鍐呭甯杈撳嚭/g, '内容输出');
    }
}

const newHtml = lines.join('\n');
fs.writeFileSync('C:/Users/Administrator/.openclaw/workspace/blog/index.html', newHtml);
console.log('Fixed all button labels');