/**
 * 博客本地服务器
 * 运行: node server.js
 * 然后访问: http://localhost:8080
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const STATIC_DIR = __dirname;

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.md': 'text/markdown',
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    
    // 默认返回index.html
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(STATIC_DIR, filePath);
    
    // 安全检查：防止路径遍历攻击
    if (!filePath.startsWith(STATIC_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    // 获取文件扩展名
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 文件不存在
                res.writeHead(404);
                res.end('Not Found');
            } else {
                // 服务器错误
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            // 成功返回文件 - 所有文本类型都加 UTF-8
            const isText = contentType.includes('text') || contentType.includes('json') || contentType.includes('javascript');
            const charset = isText ? '; charset=UTF-8' : '';
            res.writeHead(200, { 'Content-Type': contentType + charset });
            res.end(content);
        }
    });
});

// 自动同步文章数据
function syncPosts() {
    const syncScript = path.join(__dirname, 'sync-posts.js');
    if (fs.existsSync(syncScript)) {
        console.log('🔄 正在同步文章数据...');
        try {
            require(syncScript);
        } catch (err) {
            console.error('同步失败:', err.message);
        }
    }
}

// 启动前先同步一次
syncPosts();

server.listen(PORT, () => {
    console.log(`
🍎 博客服务器已启动！
   
   本地访问: http://localhost:${PORT}
   
   按 Ctrl+C 停止服务器
   
   使用说明:
   - 每次启动服务器会自动同步文章
   - 也可以手动运行: node sync-posts.js
`);
});
