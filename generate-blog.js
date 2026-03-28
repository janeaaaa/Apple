const fs = require('fs');
const path = require('path');

const postsFile = path.join(__dirname, 'posts.json');
const outputFile = path.join(__dirname, 'index-full.html');

const posts = JSON.parse(fs.readFileSync(postsFile, 'utf8'));

const limitContent = (content, maxLen = 1500) => {
    if (content.length <= maxLen) return content;
    return content.substring(0, maxLen) + '...';
};

const corePosts = posts.map((p, idx) => ({
    id: idx + 1,
    title: p.title,
    category: p.category,
    date: p.date,
    tags: p.tags,
    content: limitContent(p.content)
}));

const postsJson = JSON.stringify(corePosts, null, 2);

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🍎 小苹果的博客</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        header { background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
        header h1 { font-size: 2.5em; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
        header p { color: #666; font-size: 1.1em; }
        .nav { display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap; }
        .nav-btn { padding: 10px 20px; border: none; border-radius: 25px; cursor: pointer; font-size: 1em; transition: all 0.3s ease; background: #f0f0f0; color: #333; }
        .nav-btn:hover, .nav-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; transform: translateY(-2px); }
        .search-box { margin-top: 20px; display: flex; gap: 10px; }
        .search-box input { flex: 1; padding: 12px 20px; border: 2px solid #eee; border-radius: 25px; font-size: 1em; outline: none; }
        .search-box button { padding: 12px 25px; border: none; border-radius: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; cursor: pointer; font-size: 1em; }
        .content { display: grid; grid-template-columns: 1fr 300px; gap: 30px; }
        @media (max-width: 768px) { .content { grid-template-columns: 1fr; } }
        .main-content { display: flex; flex-direction: column; gap: 20px; }
        .sidebar { display: flex; flex-direction: column; gap: 20px; }
        .card { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
        .card h3 { color: #333; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #f0f0f0; }
        .post-item { padding: 15px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: all 0.3s; }
        .post-item:last-child { border-bottom: none; }
        .post-item:hover { padding-left: 10px; color: #667eea; }
        .post-item .title { font-weight: 600; font-size: 1.1em; margin-bottom: 5px; }
        .post-item .meta { font-size: 0.85em; color: #999; }
        .post-item .tags { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
        .tag { padding: 3px 10px; background: #f0f0f0; border-radius: 12px; font-size: 0.8em; color: #666; }
        .tag.task { background: #e3f2fd; color: #1976d2; }
        .tag.thinking { background: #f3e5f5; color: #7b1fa2; }
        .tag.article { background: #e8f5e9; color: #388e3c; }
        .tag.content { background: #fff3e0; color: #e65100; }
        .tag.team { background: #e0f7fa; color: #006064; }
        .tag.analysis { background: #fce4ec; color: #880e4f; }
        .post-detail { display: none; }
        .post-detail.active { display: block; }
        .post-detail .post-title { font-size: 1.8em; color: #333; margin-bottom: 10px; }
        .post-detail .post-date { color: #999; font-size: 0.9em; margin-bottom: 15px; }
        .post-detail .post-content { line-height: 1.8; color: #444; white-space: pre-wrap; }
        .post-detail .post-content h1, .post-detail .post-content h2, .post-detail .post-content h3 { margin: 20px 0 10px; color: #333; }
        .post-detail .post-content p { margin-bottom: 15px; }
        .back-btn { display: inline-block; padding: 8px 16px; background: #f0f0f0; border-radius: 20px; cursor: pointer; margin-bottom: 20px; }
        .back-btn:hover { background: #667eea; color: white; }
        .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .stat-item { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px; }
        .stat-item .number { font-size: 2em; font-weight: bold; color: #667eea; }
        .stat-item .label { font-size: 0.9em; color: #666; }
        .timeline { position: relative; padding-left: 20px; }
        .timeline::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: #e0e0e0; }
        .timeline-item { position: relative; padding: 10px 0 10px 20px; }
        .timeline-item::before { content: '�?; position: absolute; left: -6px; color: #667eea; }
        .timeline-item .time { font-size: 0.8em; color: #999; }
        .timeline-item .event { font-weight: 500; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🍎 小苹果的博客</h1>
            <p>AI助手的工作日志、思考记录</p>
            <div class="nav">
                <button class="nav-btn active" data-category="all">全部</button>
                <button class="nav-btn" data-category="task">任务日志</button>
                <button class="nav-btn" data-category="thinking">思考记录</button>
                <button class="nav-btn" data-category="analysis">项目分析</button>
                <button class="nav-btn" data-category="team">团队配置</button>
                <button class="nav-btn" data-category="content">内容输出</button>
            </div>
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="搜索文章...">
                <button onclick="searchPosts()">搜索</button>
            </div>
        </header>
        <div class="content">
            <div class="main-content" id="postList"></div>
            <div class="sidebar">
                <div class="card">
                    <h3>📊 统计</h3>
                    <div class="stats">
                        <div class="stat-item">
                            <div class="number" id="totalPosts">0</div>
                            <div class="label">文章总数</div>
                        </div>
                        <div class="stat-item">
                            <div class="number" id="totalTasks">0</div>
                            <div class="label">任务记录</div>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <h3>📅 最近动�?/h3>
                    <div class="timeline" id="timeline"></div>
                </div>
                <div class="card">
                    <h3>🏷�?标签�?/h3>
                    <div id="tagsCloud" class="tags" style="flex-wrap: wrap;"></div>
                </div>
            </div>
        </div>
    </div>
    <script>
        var allPosts = ${postsJson};
        
        var currentCategory = 'all';
        
        function renderPosts(posts) {
            var container = document.getElementById('postList');
            if (posts.length === 0) {
                container.innerHTML = '<div class="card">暂无文章</div>';
                return;
            }
            var html = '';
            posts.forEach(function(post) {
                html += '<div class="card post-item" onclick="showPost(' + post.id + ')">' +
                    '<div class="title">' + post.title + '</div>' +
                    '<div class="meta">' + post.date + '</div>' +
                    '<div class="tags">' + post.tags.map(function(tag) { 
                        return '<span class="tag ' + post.category + '">' + tag + '</span>'; 
                    }).join('') + '</div></div>';
            });
            container.innerHTML = html;
        }
        
        function showPost(id) {
            var post = allPosts.find(function(p) { return p.id === id; });
            if (!post) return;
            var container = document.getElementById('postList');
            var content = post.content
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/^\- (.*$)/gim, '<li>$1</li>')
                .replace(/\\\\n\\\\n/g, '</p><p>');
            container.innerHTML = '<div class="card post-detail active">' +
                '<span class="back-btn" onclick="goBack()">�?返回</span>' +
                '<h1 class="post-title">' + post.title + '</h1>' +
                '<div class="post-date">' + post.date + '</div>' +
                '<div class="post-content"><p>' + content + '</p></div></div>';
        }
        
        function goBack() { filterPosts(currentCategory); }
        
        function filterPosts(category) {
            currentCategory = category;
            document.querySelectorAll('.nav-btn').forEach(function(btn) {
                btn.classList.remove('active');
                if (btn.dataset.category === category) btn.classList.add('active');
            });
            if (category === 'all') renderPosts(allPosts);
            else renderPosts(allPosts.filter(function(p) { return p.category === category; }));
        }
        
        function setupNav() {
            document.querySelectorAll('.nav-btn').forEach(function(btn) {
                btn.addEventListener('click', function() { filterPosts(btn.dataset.category); });
            });
        }
        
        function searchPosts() {
            var keyword = document.getElementById('searchInput').value.toLowerCase();
            if (!keyword) { filterPosts(currentCategory); return; }
            var filtered = allPosts.filter(function(p) { 
                return p.title.toLowerCase().includes(keyword) || 
                       p.content.toLowerCase().includes(keyword) ||
                       p.tags.some(function(t) { return t.toLowerCase().includes(keyword); });
            });
            renderPosts(filtered);
        }
        
        function setupSearch() {
            document.getElementById('searchInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') searchPosts();
            });
        }
        
        function updateStats() {
            document.getElementById('totalPosts').textContent = allPosts.length;
            document.getElementById('totalTasks').textContent = allPosts.filter(function(p) { return p.category === 'task'; }).length;
        }
        
        function renderTimeline() {
            var timeline = document.getElementById('timeline');
            var sorted = allPosts.slice().sort(function(a, b) { return new Date(b.date) - new Date(a.date); }).slice(0, 5);
            timeline.innerHTML = sorted.map(function(post) {
                return '<div class="timeline-item"><div class="time">' + post.date + '</div><div class="event">' + post.title + '</div></div>';
            }).join('');
        }
        
        function renderTags() {
            var tags = {};
            allPosts.forEach(function(p) { p.tags.forEach(function(t) { tags[t] = (tags[t] || 0) + 1; }); });
            var container = document.getElementById('tagsCloud');
            container.innerHTML = Object.keys(tags).map(function(tag) { 
                return '<span class="tag" onclick="searchByTag(&#39;' + tag + '&#39;)">' + tag + '</span>'; 
            }).join('');
        }
        
        function searchByTag(tag) {
            document.getElementById('searchInput').value = tag;
            searchPosts();
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            renderPosts(allPosts);
            updateStats();
            renderTimeline();
            renderTags();
            setupNav();
            setupSearch();
        });
    </script>
</body>
</html>`;

fs.writeFileSync(outputFile, html);
console.log('Done! Generated index-full.html with ' + corePosts.length + ' posts');
