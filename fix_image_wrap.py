#!/usr/bin/env python3
"""
Fix image text wrapping by changing display property for floated images.
"""

with open('src/App.js', 'r') as f:
    content = f.read()

# Fix left position
old_left = """                if (position === 'left') {
                  img.style.float = 'left';
                  img.style.margin = '0 15px 15px 0';
                  img.style.display = 'block';
                }"""

new_left = """                if (position === 'left') {
                  img.style.float = 'left';
                  img.style.margin = '0 15px 15px 0';
                  img.style.display = 'inline-block';
                  img.style.clear = 'left';
                }"""

if old_left in content:
    content = content.replace(old_left, new_left)
    print("✓ Fixed left image positioning")
else:
    print("✗ Could not find left position code")

# Fix right position
old_right = """                } else if (position === 'right') {
                  img.style.float = 'right';
                  img.style.margin = '0 0 15px 15px';
                  img.style.display = 'block';
                }"""

new_right = """                } else if (position === 'right') {
                  img.style.float = 'right';
                  img.style.margin = '0 0 15px 15px';
                  img.style.display = 'inline-block';
                  img.style.clear = 'right';
                }"""

if old_right in content:
    content = content.replace(old_right, new_right)
    print("✓ Fixed right image positioning")
else:
    print("✗ Could not find right position code")

# Fix center position
old_center = """                } else {
                  img.style.float = 'none';
                  img.style.margin = '15px auto';
                  img.style.display = 'block';
                }"""

new_center = """                } else {
                  img.style.float = 'none';
                  img.style.margin = '15px auto';
                  img.style.display = 'block';
                  img.style.clear = 'both';
                }"""

if old_center in content:
    content = content.replace(old_center, new_center)
    print("✓ Fixed center image positioning")
else:
    print("✗ Could not find center position code")

# Write back
with open('src/App.js', 'w') as f:
    f.write(content)

print("\n✓ Image text wrapping should now work correctly!")
print("  - Left images: text wraps to the right")
print("  - Right images: text wraps to the left")
print("  - Center images: text flows above and below")