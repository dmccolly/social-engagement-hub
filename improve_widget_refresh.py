#!/usr/bin/env python3
"""
Improve widget refresh mechanism.
"""

with open('src/App.js', 'r') as f:
    lines = f.readlines()

# Find the widget useEffect cleanup
for i, line in enumerate(lines):
    if 'window.addEventListener(\'storage\', handleStorageChange);' in line and i < 200:
        print(f"Found storage listener at line {i+1}")
        
        # Find the return statement
        for j in range(i, min(i+20, len(lines))):
            if 'return () => {' in lines[j]:
                print(f"Found cleanup at line {j+1}")
                
                # Insert visibility change handler before the interval
                insert_pos = j - 2  # Before "const interval = setInterval"
                
                new_code = '''       
       // Refresh when page becomes visible
       const handleVisibilityChange = () => {
         if (!document.hidden) {
           console.log('Widget: Page visible, refreshing posts...');
           loadPosts();
         }
       };
       
       document.addEventListener('visibilitychange', handleVisibilityChange);
       
'''
                lines.insert(insert_pos, new_code)
                
                # Add cleanup for visibility listener
                for k in range(j, min(j+10, len(lines))):
                    if 'clearInterval(interval);' in lines[k]:
                        lines[k] = lines[k].replace(
                            'clearInterval(interval);',
                            'document.removeEventListener(\'visibilitychange\', handleVisibilityChange);\n         clearInterval(interval);'
                        )
                        print("✓ Added visibility change handler and cleanup")
                        break
                break
        break

# Also add console logging to loadPosts
for i, line in enumerate(lines):
    if 'const loadPosts = () => {' in line and i < 50:
        # Add logging after the try statement
        for j in range(i, min(i+10, len(lines))):
            if 'setDebugInfo(\'Loading posts...\');' in lines[j]:
                lines[j] = lines[j].replace(
                    'setDebugInfo(\'Loading posts...\');',
                    'setDebugInfo(\'Loading posts...\');\n           console.log(\'Widget: Loading posts from localStorage...\');'
                )
                print("✓ Added console logging to loadPosts")
                break
        break

# Write back
with open('src/App.js', 'w') as f:
    f.writelines(lines)

print("\n✓ Widget refresh improvements added!")
print("  - Refreshes when page becomes visible")
print("  - Polls every 2 seconds")
print("  - Console logging for debugging")