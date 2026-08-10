# -*- coding: utf-8 -*-
"""一次性重建 posts.json - 补录所有历史 memory 文件"""
import sys, io, os, json, re
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BLOG_DIR = Path(r"D:\openclaw\20260330\.openclaw\workspace\blog")
WORKSPACE = Path(r"D:\openclaw\20260330\.openclaw\workspace")
MEMORY_DIR = WORKSPACE / "memory"
POSTS_FILE = BLOG_DIR / "posts.json"
INDEX_FILE = BLOG_DIR / "index.html"

def get_all_memory_files():
    """获取所有 memory 文件（排除 .backup 和 .backup_xxx）"""
    files = []
    for f in MEMORY_DIR.iterdir():
        if f.is_file() and f.suffix == '.md' and not f.name.endswith('.backup_20260727'):
            # 排除已知的非 memory 文件
            if any(kw in f.name for kw in ['reflection', 'daily-output', 'ai-daily', 'ai-hot', 'ai-news', 'morning-report', 'all-articles', 'article-', 'remain', 'hyperframes', 'marketing-learning']):
                continue
            files.append(f)
    # 按文件名排序（日期顺序）
    files.sort(key=lambda x: x.name)
    return files

def classify_content(title, content):
    """根据标题和内容判断分类"""
    title_lower = title.lower()
    content_lower = content.lower()
    
    if any(kw in title for kw in ['公众号', '推送记录', '发布记录', '文章已写', '产出报告', '每日产出', '热点资讯', 'AI日报', '热点推送']):
        return 'content'
    if any(kw in content for kw in ['Media ID', 'wenyan-cli', 'thumb_media_id', '发布成功', '推送成功', '草稿箱', '群发', '推送到飞书']):
        return 'content'
    
    time_count = sum(1 for t in ['07:00', '12:00', '18:00', '09:00', '06:00', '20:00', '23:00', '08:00', '10:00', '11:00'] if t in content)
    log_markers = ['今日完成', '下班汇报', '早会汇报', '今日计划', '待办事项', '已完成', '状态:✅', '状态:❌', 'Cron任务', '任务日志', '今日产出']
    log_count = sum(1 for kw in log_markers if kw in content)
    if time_count >= 2 and log_count >= 1:
        return 'task'
    
    if any(kw in title for kw in ['规律发现', '策略迭代', '数据分析', '整体复盘', '项目分析', '复盘V', '规律V']):
        return 'analysis'
    if any(kw in content for kw in ['规律发现', '策略迭代V', '品类权重', '黄金窗口', '阅读量', '数据复盘']):
        return 'analysis'
    
    if any(kw in title for kw in ['工具探索', 'Skill', '安全评估', 'ClawHub', 'GitHub Skill', '技术研究', '技能学习', '技能探索', '工具研究']):
        return 'learning'
    if '分析时间' in content and 'Star' in content and any(kw in content for kw in ['安装', '工具名', 'GitHub']):
        return 'learning'
    
    if any(kw in title for kw in ['MEMORY.md', 'SOUL.md', '团队配置', '身份定义', '素材上传']):
        if any(kw in content for kw in ['团队协作', '权限清单', '智能体', '主权', '静静']):
            return 'team'
    
    if any(kw in title for kw in ['反思', '总结', '思考', '感悟', '教训']):
        return 'thinking'
    
    if time_count >= 2:
        return 'task'
    
    return 'thinking'

def parse_memory_entries(mem_content, file_date):
    """解析 memory 文件，提取各独立内容块"""
    entries = []
    sections = re.split(r'^## ', mem_content, flags=re.MULTILINE)
    
    for section in sections:
        if not section.strip():
            continue
        
        time_match = re.search(r'\[(\d{2}:\d{2})\]', section)
        if not time_match:
            time_match = re.search(r'\((\d{2}:\d{2})(?:-\d{2}:\d{2})?[^)]*\)', section)
        
        time_str = time_match.group(1) if time_match else '00:00'
        
        title_line = re.split(r'\n', section)[0].strip()
        title_raw = re.sub(r'^\[\d{2}:\d{2}\]\s*', '', title_line)
        title_raw = re.sub(r'\s*\((\d{2}:\d{2})(?:-\d{2}:\d{2})?[^)]*\)\s*$', '', title_raw)
        title_raw = title_raw.strip()
        
        content_lines = re.split(r'\n', section)
        content = '\n'.join(content_lines[1:]).strip()
        
        if not content or len(content) < 50 or not title_raw:
            continue
        
        cat = classify_content(title_raw, content)
        
        cat_names = {
            'content': '内容输出',
            'task': '任务日志',
            'thinking': '思考记录',
            'analysis': '项目分析',
            'team': '团队配置',
            'learning': '迭代学习'
        }
        cat_prefix = cat_names.get(cat, '思考记录')
        
        title = f"{cat_prefix}-{file_date} {title_raw[:40]}"
        
        entries.append({
            'title': title,
            'content': content[:3000],
            'category': cat,
            'date': file_date,
            'tags': [file_date, cat_names[cat], time_str]
        })
    
    return entries

def escape_js_str(s):
    if s is None: return '""'
    s = str(s).replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
    return f'"{s}"'

def regenerate_index(posts_data):
    """重新生成 index.html"""
    posts_js_parts = []
    for p in posts_data:
        tags = p.get("tags", [])
        if isinstance(tags, str): tags = [tags]
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
    
    with open(INDEX_FILE, "r", encoding="utf-8", errors="replace") as f:
        html = f.read()
    
    start_marker = 'var allPosts = ['
    start_idx = html.index(start_marker)
    script_end = html.find('</script>', start_idx)
    
    end_pos = None
    for pos in range(script_end - 2, start_idx, -1):
        if html[pos:pos+2] == '];':
            end_pos = pos + 2
            break
    if end_pos is None:
        print("ERROR: Could not find end of allPosts array!")
        return False
    
    if 'data-category="learning">迭代学习</button>' not in html:
        old_btn = '<button class="nav-btn" data-category="content">内容输出</button>'
        new_btn = old_btn + '\n                <button class="nav-btn" data-category="learning">迭代学习</button>'
        html = html.replace(old_btn, new_btn, 1)
    
    new_html = html[:start_idx] + f'var allPosts = {new_allposts};' + html[end_pos:]
    
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        f.write(new_html)
    
    print(f"  ✅ index.html 更新: {len(new_html)} bytes")
    return True

def main():
    print("=== 博客历史数据重建 ===")
    
    # 获取所有 memory 文件
    mem_files = get_all_memory_files()
    print(f"找到 {len(mem_files)} 个 memory 文件")
    
    # 收集所有帖子
    all_entries = []
    for f in mem_files:
        file_date = f.stem  # 文件名作为日期
        print(f"  处理: {f.name} ...", end='', flush=True)
        try:
            with open(f, "r", encoding="utf-8", errors="replace") as fp:
                content = fp.read()
            entries = parse_memory_entries(content, file_date)
            print(f" {len(entries)} 条")
            all_entries.extend(entries)
        except Exception as e:
            print(f" 错误: {e}")
    
    print(f"\n共提取 {len(all_entries)} 条记录")
    
    # 按日期排序
    all_entries.sort(key=lambda x: x['date'])
    
    # 分配 ID
    for i, e in enumerate(all_entries, 1):
        e['id'] = i
    
    # 保存 posts.json
    with open(POSTS_FILE, "w", encoding="utf-8") as f:
        json.dump({"allPosts": all_entries}, f, ensure_ascii=False, indent=2)
    print(f"✅ posts.json 已保存 ({len(all_entries)} 条)")
    
    # 重新生成 index.html
    print("生成 index.html ...")
    regenerate_index(all_entries)
    
    # Git 提交
    print("\nGit 提交...")
    os.chdir(BLOG_DIR)
    os.system('git add -A')
    result = os.popen('git commit -m "Rebuild: 补录全部历史 memory (' + str(len(all_entries)) + ' 条)"').read()
    print(f"  提交结果: {result[:200]}")
    result = os.popen('git push origin master').read()
    if "fatal" in result.lower():
        print(f"  ⚠️ Push 问题: {result[:200]}")
    else:
        print("  ✅ 已推送到 GitHub")

if __name__ == "__main__":
    main()
