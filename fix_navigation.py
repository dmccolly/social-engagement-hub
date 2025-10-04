#!/usr/bin/env python3
import re

# Read the file
with open('src/App.js', 'r') as f:
    content = f.read()

# Find and replace the problematic navigation section
# The pattern matches the button with duplicate onClick handlers
old_pattern = r'''(\]\.map\(\(item\) => \(
\s+<button
\s+onClick=\{\(\) => \{ 
\s+setContentType\('post'\); 
\s+setIsCreating\(true\); 
\s+// Ensure latest posts are synced for widget previews
\s+try \{
\s+const mapped = mapPostsForWidget\(posts\);
\s+localStorage\.setItem\('socialHubPosts', JSON\.stringify\(mapped\)\);
\s+\} catch \(e\) \{\}
\s+\}\}
\s+
\s+key=\{item\.id\}
\s+onClick=\{\(\) => setActiveSection\(item\.id\)\})'''

new_pattern = r'''].map((item) => (
               <button
                 key={item.id}
                 onClick={() => setActiveSection(item.id)}'''

content = re.sub(old_pattern, new_pattern, content, flags=re.MULTILINE)

# Write back
with open('src/App.js', 'w') as f:
    f.write(content)

print("Fixed navigation buttons!")