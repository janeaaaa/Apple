# -*- coding: utf-8 -*-
"""
从posts.json正确生成index.html的allPosts数组
保留原始index.html模板，只替换allPosts内容
"""
import json, re, sys
from pathlib import Path

BLOG_DIR = Path(__file__).parent
INDEX_FILE = BLOG_DIR / "index.html"
POSTS_FILE = BLOG_DIR / "posts.json"

def escape_content(s):
    """对content字段进行JavaScript字符串转义"""
    if s is None:
        return '""'
    s = str(s)
    # JSON转义（处理JSON已有转义的情况）
    s = s.replace('\\', '\\\\')  # 先处理反斜杠
    s = s.replace('"', '\\"')
    s = s.replace("'", "\\'")
    s = s.replace('\n', '\\n')
    s = s.replace('\r', '\\r')
    s = s.replace('\t', '\\t')
    s = s.replace('</', '<\\/')
    return f'"{s}"'

def escape_str(s):
    """通用字符串转义"""
    if s is None:
        return '""'
    s = str(s)
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    s = s.replace('\n', '\\n')
    s = s.replace('\r', '\\r')
    s = s.replace('\t', '\\t')
    return f'"{s}"'

def generate():
    # 读取posts.json
    with open(POSTS_FILE, "r", encoding="utf-8") as f:
        posts = json.load(f)
    
    print(f"Loaded {len(posts)} posts from posts.json")
    
    # 生成allPosts数组
    posts_js = []
    for p in posts:
        tags = p.get("tags", [])
        if isinstance(tags, str):
            tags = [tags]
        
        # category映射：中文→英文
        cat_map = {
            '思考记录': 'thinking', '任务日志': 'task', '项目分析': 'analysis',
            '团队配置': 'team', '内容输出': 'content', '迭代学习': 'learning'
        }
        cat = cat_map.get(p.get('category', ''), p.get('category', 'content'))
        
        # title默认用emoji前缀
        title = p.get('title', '')
        if not title.startswith(('📝', '🍎', '🔴', '✅', '⚠️', '🔵', '💡', '🔥')):
            cat_emoji = {'thinking': '💭', 'task': '📋', 'analysis': '📊', 'team': '👥', 'content': '📝', 'learning': '🔧'}.get(cat, '📝')
            title = f"{cat_emoji} {title}"
        
        entry = {
            "id": p.get("id", 0),
            "title": title,
            "category": cat,
            "date": p.get("date", ""),
            "tags": tags,
            "content": p.get("content", "")[:500]  # 限制content长度
        }
        
        posts_js.append(f'''  {{
    "id": {entry["id"]},
    "title": {escape_str(entry["title"])},
    "category": {escape_str(entry["category"])},
    "date": {escape_str(entry["date"])},
    "tags": [{", ".join(escape_str(t) for t in entry["tags"])}],
    "content": {escape_content(entry["content"])}
  }}''')
    
    allposts_str = "[\n" + ",\n".join(posts_js) + "\n]"
    
    # 读取index.html
    with open(INDEX_FILE, "r", encoding="utf-8", errors="replace") as f:
        html = f.read()
    
    # 替换allPosts数组
    new_html = re.sub(
        r'var allPosts = \[.*?\];',
        f'var allPosts = {allposts_str};',
        html,
        flags=re.DOTALL
    )
    
    if new_html == html:
        print("ERROR: allPosts pattern not found!")
        return False
    
    # 写回
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        f.write(new_html)
    
    print(f"✅ Generated index.html: {len(new_html)} bytes, {len(posts)} posts")
    return True

if __name__ == "__main__":
    generate()
