#!/usr/bin/env python3
"""
Add extensive debug logging to understand why image selection isn't working.
"""

with open('src/App.js', 'r') as f:
    content = f.read()

# Add logging to the event delegation handler
old_delegation = '''              handleImageClick = (e) => {
                // Check if clicked element is an image with our ID format
                if (e.target.tagName === 'IMG' &amp;&amp; e.target.id &amp;&amp; e.target.id.startsWith('img-')) {
                  e.preventDefault();
                  e.stopPropagation();
                  const imageId = e.target.id.replace('img-', '');
                  console.log('Image clicked via delegation! ID:', imageId);
                  selectImage(parseInt(imageId));
                }
              };'''

new_delegation = '''              handleImageClick = (e) => {
                console.log('=== CLICK EVENT DETECTED ===');
                console.log('Target:', e.target);
                console.log('Target tagName:', e.target.tagName);
                console.log('Target ID:', e.target.id);
                console.log('Target classList:', e.target.classList);
                
                // Check if clicked element is an image with our ID format
                if (e.target.tagName === 'IMG' &amp;&amp; e.target.id &amp;&amp; e.target.id.startsWith('img-')) {
                  console.log('✓ Image detected with correct ID format');
                  e.preventDefault();
                  e.stopPropagation();
                  const imageId = e.target.id.replace('img-', '');
                  console.log('Image clicked via delegation! ID:', imageId);
                  console.log('Calling selectImage with:', parseInt(imageId));
                  selectImage(parseInt(imageId));
                } else {
                  console.log('✗ Not an image or wrong ID format');
                  if (e.target.tagName !== 'IMG') {
                    console.log('  - Not an IMG tag');
                  }
                  if (!e.target.id) {
                    console.log('  - No ID attribute');
                  }
                  if (e.target.id &amp;&amp; !e.target.id.startsWith('img-')) {
                    console.log('  - ID does not start with "img-"');
                  }
                }
              };'''

if old_delegation in content:
    content = content.replace(old_delegation, new_delegation)
    print("✓ Added debug logging to event delegation")
else:
    print("✗ Could not find event delegation code")
    exit(1)

# Add logging to selectImage function
old_select = '''       // Select image - WORKING VERSION
       const selectImage = (imageId) => {
         console.log('=== SELECT IMAGE CALLED ===');
         console.log('Image ID:', imageId);'''

new_select = '''       // Select image - WORKING VERSION WITH DEBUG
       const selectImage = (imageId) => {
         console.log('=== SELECT IMAGE CALLED ===');
         console.log('Image ID:', imageId);
         console.log('Type of imageId:', typeof imageId);
         console.log('Looking for element with ID:', `img-${imageId}`);'''

if old_select in content:
    content = content.replace(old_select, new_select)
    print("✓ Added debug logging to selectImage")
else:
    print("✗ Could not find selectImage function")

# Write back
with open('src/App.js', 'w') as f:
    f.write(content)

print("✓ Debug logging added successfully!")
print("✓ Check browser console for detailed logs when clicking images")