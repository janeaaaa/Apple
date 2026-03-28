#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os

# 定义所有文章数据
posts = []

# 扫描workspace获取所有md文件
workspace = r"C:\Users\Administrator\.openclaw\workspace"

# 手动定义需要包含的重要文章
important_files = [
    "MEMORY.md",
    "SOUL.md", 
    "USER.md",
    "AGENTS.md",
    "TOOLS.md",
    "IDENTITY.md",
    "HEARTBEAT.md",
    "TODO.md",
]

# 扫描memory目录
memory_dir = os.path.join(workspace, "memory")
if os.path.exists(memory_dir):
    for f in os.listdir(memory_dir):
        if f.endswith('.md'):
            important_files.append(os.path.join("memory", f))

# 扫描根目录的其他md文件
for f in os.listdir(workspace):
    if f.endswith('.md') and f not in important_files:
        important_files.append(f)

print(f"找到 {len(important_files)} 个文件")

# 读取文件内容
for i, f in enumerate(important_files):
    path = os.path.join(workspace, f) if not f.startswith("memory") else os.path.join(workspace, f)
    if os.path.exists(path):
        try:
            with open(path, 'r', encoding='utf-8') as fp:
                content = fp.read()[:1500]  # 限制长度
            title = os.path.basename(f).replace('.md', '')
            # 从文件名提取日期
            date = "2026-03-27"
            if len(title) >= 10 and title[:4].isdigit():
                date = title[:10]
            
            category = "task"
            if "MEMORY" in f or "SOUL" in f or "USER" in f or "AGENTS" in f or "TOOLS" in f or "IDENTITY" in f or "HEARTBEAT" in f:
                category = "team"
            elif "analysis" in f.lower() or "github" in f.lower():
                category = "analysis"
            elif "thinking" in f.lower():
                category = "thinking"
            
            posts.append({
                "id": len(posts) + 1,
                "title": f"📝 {date} - {title}",
                "category": category,
                "date": date,
                "tags": ["AI"],
                "content": content
            })
        except Exception as e:
            print(f"读取失败: {f} - {e}")

print(f"共 {len(posts)} 篇文章")

import json

# 保存到文件而不是打印
with open('posts_output.json', 'w', encoding='utf-8') as f:
    json.dump(posts, f, ensure_ascii=False, indent=2)

print(f"已保存 {len(posts)} 篇文章到 posts_output.json")