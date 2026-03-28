/**
 * 博客文章同步脚本
 * 扫描workspace目录，生成博客文章数据
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(__dirname, 'posts.json');

// 要扫描的目录和文件
const SCAN_PATHS = [
    { path: 'memory', category: 'task', tags: ['日报', '日志'] },
    { path: 'docs', category: 'article', tags: ['文档', '文章'] },
    { path: 'blog/articles', category: 'content', tags: ['公众号', '文章'] },
];

// 要包含的根目录文件
const ROOT_FILES = [
    'MEMORY.md',
    'SOUL.md',
    'USER.md',
    'AGENTS.md',
    'TOOLS.md',
    'HEARTBEAT.md',
    'IDENTITY.md',
    'TODO.md',
    'thinking-log.md',
    'morning-report.md',
    'github-deep-analysis.md',
    'github-top1000-analysis.md',
];

// 排除的文件
const EXCLUDE_FILES = [
    'package.json',
    'package-lock.json',
    'BOOTSTRAP.md',
    'feishu-bots.json',
    'create-doc.js',
    'test-doc.js',
    'test_jimeng.py',
    '.DS_Store',
];

// 分类映射 - 改进版
function getCategory(filename, dirPath) {
    const lower = filename.toLowerCase();
    const lowerPath = dirPath.toLowerCase();
    
    // memory目录 -> 任务日志
    if (lowerPath.includes('memory')) return 'task';
    
    // 思考类
    if (lower.includes('thinking') || lower.includes('思考')) return 'thinking';
    
    // 分析类
    if (lower.includes('analysis') || lower.includes('分析')) return 'analysis';
    
    // 团队/配置类
    if (lower.includes('memory') || lower.includes('soul') || 
        lower.includes('identity') || lower.includes('tools') ||
        lower.includes('agents') || lower.includes('heartbeat') ||
        lower.includes('team') || lower.includes('团队')) return 'team';
    
    // 任务类
    if (lower.includes('todo') || lower.includes('morning') || 
        lower.includes('report') || lower.includes('日志')) return 'task';
    
    // 内容输出类
    if (lower.includes('article') || lower.includes('content') ||
        lower.includes('文章') || lower.includes('输出')) return 'content';
    
    return 'article';
}

// 标签提取 - 改进版
function getTags(filename, content) {
    const tags = [];
    
    // 领域标签
    if (filename.includes('AI') || filename.includes('github') || 
        content.includes('AI') || content.includes('人工智能')) tags.push('AI');
    if (filename.includes('公众号') || content.includes('公众号')) tags.push('公众号');
    if (filename.includes('热点') || content.includes('热点')) tags.push('热点');
    
    // 类型标签
    if (filename.includes('分析') || filename.includes('analysis')) tags.push('分析');
    if (filename.includes('任务') || filename.includes('todo')) tags.push('任务');
    if (filename.includes('思考') || filename.includes('thinking')) tags.push('思考');
    if (filename.includes('配置') || filename.includes('config')) tags.push('配置');
    
    // 状态标签
    if (content.includes('已完成') || content.includes('完成')) tags.push('已完成');
    if (content.includes('进行中')) tags.push('进行中');
    if (content.includes('阻塞') || content.includes('问题')) tags.push('待处理');
    
    return tags.length > 0 ? tags.slice(0, 4) : ['通用'];
}

// 标题优化 - 格式：emoji YYYY-MM-DD - 类目 - 内容
// 每个类目使用不同的emoji

function getDisplayTitle(filename, content) {
    // 去掉.md后缀
    const name = filename.replace('.md', '');
    
    // 从内容中提取日期
    let date = '';
    const dateMatch = content.match(/^#\s+.*?(\d{4}[-/年]\d{1,2}[-/月]\d{1,2})/);
    if (dateMatch) {
        date = dateMatch[1].replace(/年/g, '-').replace(/月/g, '-').replace(/日/g, '');
    }
    // 格式化日期为 YYYY-MM-DD
    if (date) {
        const parts = date.split('-');
        if (parts.length === 3) {
            date = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
    }
    if (!date) {
        date = new Date().toISOString().split('T')[0];
    }
    
    // emoji和标题映射表 - 每个类目不同emoji
    const titleMap = {
        'MEMORY': { emoji: '🧠', title: '核心记忆' },
        'SOUL': { emoji: '🎭', title: '身份定义' },
        'USER': { emoji: '👤', title: '关于静静' },
        'AGENTS': { emoji: '🏠', title: '工作空间配置' },
        'TOOLS': { emoji: '🔧', title: '工具配置' },
        'HEARTBEAT': { emoji: '💓', title: '心跳机制' },
        'IDENTITY': { emoji: '🍎', title: '我是谁' },
        'TODO': { emoji: '📋', title: '待办清单' },
        'morning-report': { emoji: '🌅', title: '每日早会' },
        'thinking-log': { emoji: '💭', title: '思考日志' },
        'github-deep-analysis': { emoji: '📊', title: 'GitHub深度分析报告' },
        'github-top1000-analysis': { emoji: '📋', title: 'GitHub Top1000项目清单' },
        '团队协作共识': { emoji: '🤝', title: '团队协作共识' },
    };
    
    const lowerName = name.toLowerCase();
    
    // 1. 检查映射表 - 每个类目不同emoji
    for (const [key, value] of Object.entries(titleMap)) {
        if (lowerName === key.toLowerCase()) {
            return `${value.emoji} ${date} - ${value.title}`;
        }
    }
    
    // 2. 日期格式的文件 -> 📝 工作日志
    if (name.match(/^\d{4}-\d{2}-\d{2}/)) {
        return `📝 ${date} - 工作日志`;
    }
    
    // 3. articles目录的内容 -> 📝 公众号发文
    if (name.includes('全球AI大模型')) {
        return `📝 ${date} - 公众号发文 全球AI大模型格局剧变`;
    }
    
    // 4. 默认
    return `📝 ${date} - ${name}`;
}

// 从文件提取日期
function extractDate(content, filename) {
    // 尝试从文件名提取
    const dateMatch = filename.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (dateMatch) {
        return `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
    }
    
    // 尝试从内容提取
    const contentMatch = content.match(/(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})/);
    if (contentMatch) {
        return `${contentMatch[1]}-${contentMatch[2].padStart(2, '0')}-${contentMatch[3].padStart(2, '0')}`;
    }
    
    // 返回今天
    return new Date().toISOString().split('T')[0];
}

// 扫描目录
function scanDirectory(dirPath, basePath = '') {
    const results = [];
    
    if (!fs.existsSync(dirPath)) {
        return results;
    }
    
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        const relativePath = path.join(basePath, item);
        
        if (stat.isDirectory()) {
            // 递归扫描子目录
            results.push(...scanDirectory(fullPath, relativePath));
        } else if (stat.isFile() && item.endsWith('.md')) {
            // 排除文件
            if (EXCLUDE_FILES.includes(item)) {
                return;
            }
            
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const category = getCategory(item, relativePath);
                const tags = getTags(item, content);
                const date = extractDate(content, item);
                
                results.push({
                    id: results.length + 1,
                    title: getDisplayTitle(item, content),
                    category: category,
                    date: date,
                    tags: tags,
                    path: relativePath,
                    content: content
                });
            } catch (err) {
                console.error(`Error reading ${fullPath}:`, err.message);
            }
        }
    });
    
    return results;
}

// 扫描根目录的文件
function scanRootFiles() {
    const results = [];
    
    ROOT_FILES.forEach(filename => {
        const fullPath = path.join(WORKSPACE, filename);
        
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const category = getCategory(filename, '');
                const tags = getTags(filename, content);
                const date = extractDate(content, filename);
                
                results.push({
                    id: results.length + 1,
                    title: getDisplayTitle(filename, content),
                    category: category,
                    date: date,
                    tags: tags,
                    path: filename,
                    content: content
                });
            } catch (err) {
                console.error(`Error reading ${fullPath}:`, err.message);
            }
        }
    });
    
    return results;
}

// 主函数
function main() {
    console.log('🔄 同步博客文章...');
    
    const posts = [];
    
    // 扫描memory目录
    const memoryPath = path.join(WORKSPACE, 'memory');
    posts.push(...scanDirectory(memoryPath, 'memory'));
    
    // 扫描docs目录
    const docsPath = path.join(WORKSPACE, 'docs');
    if (fs.existsSync(docsPath)) {
        posts.push(...scanDirectory(docsPath, 'docs'));
    }
    
    // 扫描articles目录（内容输出）
    const articlesPath = path.join(WORKSPACE, 'articles');
    if (fs.existsSync(articlesPath)) {
        const articleFiles = scanDirectory(articlesPath, 'articles');
        articleFiles.forEach(p => p.category = 'content');
        posts.push(...articleFiles);
    }
    
    // 扫描blog下的articles
    const blogArticlesPath = path.join(WORKSPACE, 'blog', 'articles');
    if (fs.existsSync(blogArticlesPath)) {
        const blogArticleFiles = scanDirectory(blogArticlesPath, 'blog-articles');
        blogArticleFiles.forEach(p => p.category = 'content');
        posts.push(...blogArticleFiles);
    }
    
    // 扫描根目录文件
    posts.push(...scanRootFiles());
    
    // 按日期排序
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 重新编号
    posts.forEach((post, index) => {
        post.id = index + 1;
    });
    
    // 保存到JSON文件
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2), 'utf8');
    
    console.log(`✅ 已同步 ${posts.length} 篇文章`);
    console.log(`📁 输出文件: ${OUTPUT_FILE}`);
    
    // 统计
    const stats = {
        total: posts.length,
        task: posts.filter(p => p.category === 'task').length,
        thinking: posts.filter(p => p.category === 'thinking').length,
        analysis: posts.filter(p => p.category === 'analysis').length,
        team: posts.filter(p => p.category === 'team').length,
        content: posts.filter(p => p.category === 'content').length,
    };
    
    console.log('\n📊 统计:');
    console.log(`   任务日志: ${stats.task}`);
    console.log(`   思考记录: ${stats.thinking}`);
    console.log(`   项目分析: ${stats.analysis}`);
    console.log(`   团队配置: ${stats.team}`);
    console.log(`   内容输出: ${stats.content}`);
}

main();
