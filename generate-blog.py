#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os

# 定义文章数据（使用Python字典，避免JSON编码问题）
posts = [
    {
        "id": 1,
        "title": "全球AI大模型格局剧变！中国首次逆袭登顶",
        "category": "content",
        "date": "2026-03-26",
        "tags": ["AI"],
        "content": "中国首次在AI大模型竞赛中登顶。DeepSeek-R1横空出世，阿里Qwen2.5开源模型全球下载量飙升，苹果发布会首次接入中国AI模型..."
    },
    {
        "id": 2,
        "title": "Sora关停第7个月，我看到了AI行业最残忍的真相",
        "category": "content", 
        "date": "2026-03-25",
        "tags": ["AI", "Sora"],
        "content": "在AI时代，技术最牛不等于产品最火。Sora从万众瞩目到彻底凉凉只用了7个月..."
    },
    {
        "id": 3,
        "title": "MEMORY.md - 静静的核心记忆",
        "category": "team",
        "date": "2026-03-26",
        "tags": ["AI", "公众号", "热点", "已完成"],
        "content": "静静的核心记忆文件，包含工作模式、团队调度、权限清单等重要信息..."
    }
]

# 生成HTML
html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>Test - Blog Works</title>
</head>
<body>
<h1>Blog Test</h1>
<p>如果能看到这行文字，说明博客基本功能正常。</p>
<p>文章数量：''' + str(len(posts)) + '''</p>
</body>
</html>'''

# 写入文件（UTF-8）
with open('C:/Users/Administrator/.openclaw/workspace/blog/test-blog.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("测试文件已生成")
print(f"文章数量: {len(posts)}")