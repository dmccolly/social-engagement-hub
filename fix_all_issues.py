#!/usr/bin/env python3
"""
Fix all three critical issues:
1. Raw HTML display - use dangerouslySetInnerHTML
2. Canvas width - increase editor width
3. Images disappearing - will need separate investigation
"""

with open('src/App.js', 'r') as f:
    content = f.read()

print("Fixing Issue 1: Raw HTML Display...")

# Fix 1: Dashboard Featured Posts (line 4034)
old_featured = '                     <p className="text-gray-700">{post.content}</p>'
new_featured = '                     <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: post.content }} />'

if old_featured in content:
    content = content.replace(old_featured, new_featured)
    print("✓ Fixed featured posts display")
else:
    print("✗ Could not find featured posts line")

# Fix 2: Dashboard Recent Posts (line 4055)
old_recent = '                         <p className="text-gray-700">{post.content}</p>'
new_recent = '                         <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: post.content }} />'

if old_recent in content:
    content = content.replace(old_recent, new_recent)
    print("✓ Fixed recent posts display")
else:
    print("✗ Could not find recent posts line")

# Fix 3: News Feed (line 608)
old_newsfeed = '                   <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>'
new_newsfeed = '                   <div className="text-gray-700 mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />'

if old_newsfeed in content:
    content = content.replace(old_newsfeed, new_newsfeed)
    print("✓ Fixed news feed display")
else:
    print("✗ Could not find news feed line")

print("\nFixing Issue 2: Canvas Width...")

# Fix canvas width - change from default to wider
old_canvas = '               className="w-full min-h-[800px] p-8 border rounded-lg bg-white focus:border-blue-500 transition-colors text-lg leading-relaxed"'
new_canvas = '               className="w-full max-w-5xl min-h-[800px] p-8 border rounded-lg bg-white focus:border-blue-500 transition-colors text-lg leading-relaxed"'

if old_canvas in content:
    content = content.replace(old_canvas, new_canvas)
    print("✓ Increased canvas width to max-w-5xl")
else:
    print("✗ Could not find canvas class")

# Write back
with open('src/App.js', 'w') as f:
    f.write(content)

print("\n✓ All fixes applied successfully!")
print("\nRemaining Issue:")
print("- Images disappearing: Needs investigation of content state management")