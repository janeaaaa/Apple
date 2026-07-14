// 分析posts.json中的重复内容
const fs = require('fs');

const postsPath = 'D:\\openclaw\\20260330\\.openclaw\\workspace\\blog\\posts.json';
const outputPath = 'D:\\openclaw\\20260330\\.openclaw\\workspace\\blog\\posts-dedup.json';

// 读取posts.json
const content = fs.readFileSync(postsPath, 'utf-8');
const posts = JSON.parse(content);

console.log(`总文章数: ${posts.length}`);

// 分析重复
const titleMap = {};
const contentMap = {};

posts.forEach((post, index) => {
  const title = post.title || '';
  const content = (post.content || '').substring(0, 200); // 用前200字符对比
  
  if (!titleMap[title]) {
    titleMap[title] = [];
  }
  titleMap[title].push({ index, id: post.id, path: post.path });
  
  if (!contentMap[content]) {
    contentMap[content] = [];
  }
  contentMap[content].push({ index, id: post.id, title });
});

// 找出重复标题
console.log('\n=== 重复标题 ===');
let duplicateTitles = 0;
Object.entries(titleMap).forEach(([title, items]) => {
  if (items.length > 1) {
    duplicateTitles++;
    console.log(`\n"${title}" - ${items.length}次`);
    items.forEach(item => {
      console.log(`  - id:${item.id}, path:${item.path}`);
    });
  }
});
console.log(`\n重复标题数量: ${duplicateTitles}`);

// 保留策略：保留每组的第一条，删除其余
const toKeep = new Set();
const toRemove = [];

Object.entries(titleMap).forEach(([title, items]) => {
  if (items.length > 1) {
    toKeep.add(items[0].index);
    items.slice(1).forEach(item => toRemove.push(item.index));
  } else if (items.length === 1) {
    toKeep.add(items[0].index);
  }
});

console.log(`\n保留: ${toKeep.size}, 删除: ${toRemove.length}`);

// 生成去重后的数组
const dedupedPosts = posts.filter((_, index) => toKeep.has(index));

// 保存结果
fs.writeFileSync(outputPath, JSON.stringify(dedupedPosts, null, 2), 'utf-8');
console.log(`\n去重后文章数: ${dedupedPosts.length}`);
console.log(`已保存到: ${outputPath}`);

// 输出删除的路径列表
console.log('\n=== 将删除的重复文章 ===');
toRemove.forEach(idx => {
  const post = posts[idx];
  console.log(`删除: ${post.title} (${post.path})`);
});
