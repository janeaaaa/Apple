# -*- coding: utf-8 -*-
"""
从posts.json生成新的index.html
保留博客模板，只更新 allPosts 数组内容
"""
import json, re
from pathlib import Path

BLOG_DIR = Path(__file__).parent
INDEX_FILE = BLOG_DIR / "index.html"
POSTS_FILE = BLOG_DIR / "posts.json"

def generate_index():
    # 读取现有index.html
    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        html = f.read()
    
    # 读取posts.json
    with open(POSTS_FILE, "r", encoding="utf-8") as f:
        posts = json.load(f)
    
    print(f"读取了 {len(posts)} 条posts")
    
    # 生成新的 allPosts JavaScript代码
    def escape_js_str(s):
        if s is None:
            return '""'
        s = str(s)
        # 转义特殊字符
        s = s.replace('\\', '\\\\')
        s = s.replace('"', '\\"')
        s = s.replace('\n', '\\n')
        s = s.replace('\r', '\\r')
        s = s.replace('\t', '\\t')
        return f'"{s}"'
    
    posts_js_parts = []
    for p in posts:
        tags = p.get("tags", [])
        if isinstance(tags, str):
            tags = [tags]
        tags_js = "[" + ", ".join(escape_js_str(t) for t in tags) + "]"
        
        entry = f'''  {{
    "id": {p.get("id", 0)},
    "title": {escape_js_str(p.get("title", ""))},
    "category": {escape_js_str(p.get("category", ""))},
    "date": {escape_js_str(p.get("date", ""))},
    "tags": {tags_js},
    "content": {escape_js_str(p.get("content", ""))}
  }}'''
        posts_js_parts.append(entry)
    
    new_allposts = "[\n" + ",\n".join(posts_js_parts) + "\n]"
    
    # 替换 allPosts = [...] 部分
    # 找到 var allPosts = [ 开始的行，到最后一个 ]; 之前
    pattern = r'(var allPosts = \[)[\s\S]*?(\];)'
    match = re.search(pattern, html)
    if match:
        new_html = html[:match.start(1)] + match.group(1) + "\n" + new_allposts + "\n" + html[match.end(2):]
    else:
        print("ERROR: 找不到 allPosts 数组!")
        return False
    
    # 写回
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        f.write(new_html)
    
    print(f"✅ 已生成新 index.html ({len(new_html)} bytes, {len(posts)} 条posts)")
    return True

if __name__ == "__main__":
    generate_index()
