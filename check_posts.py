import json
import re

blog_dir = r'D:\openclaw\20260330\.openclaw\workspace\blog'

# Check posts-dedup.json
try:
    with open(blog_dir + '\\posts-dedup.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    if isinstance(data, list):
        print('posts-dedup.json posts count (list):', len(data))
    else:
        print('posts-dedup.json posts count:', len(data.get('allPosts', [])))
except Exception as e:
    print('posts-dedup.json error:', e)

# Check posts.json.broken
try:
    with open(blog_dir + '\\posts.json.broken', 'r', encoding='utf-8') as f:
        content = f.read()
    print('posts.json.broken size:', len(content), 'bytes')
    matches = re.findall(r'"id":\s*(\d+)', content)
    print('posts.json.broken estimated posts:', len(matches))
except Exception as e:
    print('posts.json.broken error:', e)

# Check current posts.json
try:
    with open(blog_dir + '\\posts.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    if isinstance(data, list):
        print('posts.json (current) posts count (list):', len(data))
    else:
        print('posts.json (current) posts count:', len(data.get('allPosts', [])))
except Exception as e:
    print('posts.json error:', e)
