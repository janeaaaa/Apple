// 清理blog目录下的临时文件
const fs = require('fs');
const path = require('path');

const blogDir = 'D:\\openclaw\\20260330\\.openclaw\\workspace\\blog';

// 需要删除的文件模式
const deletePatterns = [
  /^\(1\)\.md$/,  // (1).md
  /^\(2\)\.md$/,  // (2).md
  /debug.*\.html$/i,
  /^fix.*\.js$/i,
  /^test.*\.html$/i,
  /^check.*\.js$/i,
  /^simple.*\.html$/i,
  /^static.*\.html$/i,
  /^simulate.*\.html$/i,
  /^generate.*\.js$/i,
  /^generate.*\.py$/i,
  /^regenerate.*\.py$/i,
  /^sync.*\.js$/i,
  /^server.*\.js$/i,
  /^minimal.*\.html$/i,
  /^index.*\.html$/i,
  /^README.*\.md$/i,
  /.*\u4F7F\u7528.*\.md$/i,
  /.*\u6C思考.*\.md$/i,
  /.*\u6CE8\u610F.*\.md$/i,
  /.*\u89C4\u5219.*\.md$/i,
  /^team-workflow.*\.md$/i,
  /^wechat-analysis.*\.md$/i,
  /^posts.*\.json$/i,
  /^posts.*\.txt$/i,
  /^comments.*\.json$/i
];

function shouldDelete(filename) {
  // 保留posts.json（主文件）
  if (filename === 'posts.json') return false;
  // 保留必要的文件
  if (filename === 'index.html' || filename === 'posts-dedup.json' || filename === 'dedup.js' || filename === 'cleanup.js') return false;
  
  for (const pattern of deletePatterns) {
    if (pattern.test(filename)) return true;
  }
  return false;
}

const files = fs.readdirSync(blogDir);
let deletedCount = 0;
let keptCount = 0;

console.log('=== 清理blog目录 ===\n');

files.forEach(file => {
  if (shouldDelete(file)) {
    const filePath = path.join(blogDir, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`删除: ${file}`);
      deletedCount++;
    } catch (e) {
      console.log(`删除失败: ${file} - ${e.message}`);
    }
  } else {
    keptCount++;
  }
});

console.log(`\n=== 清理完成 ===`);
console.log(`删除: ${deletedCount}个文件`);
console.log(`保留: ${keptCount}个文件`);

// 列出保留的文件
console.log('\n=== 保留的文件 ===');
files.forEach(file => {
  if (!shouldDelete(file)) {
    console.log(`  ${file}`);
  }
});
