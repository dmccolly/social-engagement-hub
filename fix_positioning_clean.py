#!/usr/bin/env python3
"""
Clean fix for image positioning.
"""

with open('src/App.js', 'r') as f:
    lines = f.readlines()

# Find and fix the positioning section
for i, line in enumerate(lines):
    if "if (position === 'left') {" in line and i > 3000:
        print(f"Found positioning code at line {i+1}")
        
        # Replace the entire if-else block
        # Find the end of this block
        end_idx = i
        brace_count = 0
        for j in range(i, len(lines)):
            brace_count += lines[j].count('{') - lines[j].count('}')
            if brace_count == 0 and j > i:
                end_idx = j
                break
        
        print(f"Block ends at line {end_idx+1}")
        
        # Create clean replacement
        new_code = """                if (position === 'left') {
                  img.style.float = 'left';
                  img.style.margin = '0 15px 15px 0';
                  img.style.display = 'inline-block';
                  img.style.clear = 'left';
                } else if (position === 'right') {
                  img.style.float = 'right';
                  img.style.margin = '0 0 15px 15px';
                  img.style.display = 'inline-block';
                  img.style.clear = 'right';
                } else {
                  img.style.float = 'none';
                  img.style.margin = '15px auto';
                  img.style.display = 'block';
                  img.style.clear = 'both';
                }
"""
        
        # Replace
        lines = lines[:i] + [new_code] + lines[end_idx+1:]
        print("✓ Fixed image positioning")
        break

# Write back
with open('src/App.js', 'w') as f:
    f.writelines(lines)

print("✓ Image text wrapping fixed!")