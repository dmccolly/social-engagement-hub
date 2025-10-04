#!/usr/bin/env python3
"""
Fix the content editor to prevent images from disappearing.
Remove dangerouslySetInnerHTML and add useEffect to set initial content.
"""

with open('src/App.js', 'r') as f:
    lines = f.readlines()

# Find the dangerouslySetInnerHTML line
for i, line in enumerate(lines):
    if 'dangerouslySetInnerHTML={{ __html: content' in line:
        print(f"Found dangerouslySetInnerHTML at line {i+1}")
        # Remove this line
        lines[i] = ''
        print("✓ Removed dangerouslySetInnerHTML")
        break

# Now add a useEffect to set initial content
# Find where to insert it - after the handleContentChange function
for i, line in enumerate(lines):
    if 'const handleContentChange = (e) => {' in line:
        # Find the end of this function
        brace_count = 0
        start = i
        for j in range(i, len(lines)):
            brace_count += lines[j].count('{') - lines[j].count('}')
            if brace_count == 0 and j > start:
                # Insert useEffect after this function
                insert_pos = j + 1
                new_code = '''
       // Set initial content only once
       useEffect(() => {
         if (contentRef.current && !contentRef.current.innerHTML) {
           contentRef.current.innerHTML = content || '<p>Start writing your blog post here...</p>';
         }
       }, []);
       
       // Update content only when editing post
       useEffect(() => {
         if (editingPost && contentRef.current) {
           contentRef.current.innerHTML = content || '<p>Start writing your blog post here...</p>';
         }
       }, [editingPost]);

'''
                lines.insert(insert_pos, new_code)
                print(f"✓ Added useEffect at line {insert_pos+1}")
                break
        break

# Write back
with open('src/App.js', 'w') as f:
    f.writelines(lines)

print("✓ Fixed content editor - images should no longer disappear!")