#!/usr/bin/env python3
"""
Fix image click handler using line-based replacement.
"""

with open('src/App.js', 'r') as f:
    lines = f.readlines()

# Find and replace the onclick handler section
modified = False
i = 0
while i < len(lines):
    if '// Add click handler for selection - WORKING VERSION FROM BACKUP' in lines[i]:
        print(f"Found onclick handler at line {i+1}")
        # Replace the next 9 lines (the onclick handler block)
        new_lines = [
            '         \n',
            '         // Click handler will be attached via event delegation in useEffect\n',
            '         console.log(\'Image created with ID:\', imageId);\n',
            '         \n'
        ]
        # Remove old lines and insert new ones
        lines = lines[:i] + new_lines + lines[i+10:]
        modified = True
        print("✓ Removed direct onclick handler")
        break
    i += 1

if not modified:
    print("✗ Could not find onclick handler")
    exit(1)

# Now find and modify the useEffect
i = 0
while i < len(lines):
    if "// Make functions globally available" in lines[i] and "useEffect(() => {" in lines[i+1]:
        print(f"Found useEffect at line {i+1}")
        # Replace the comment and add event delegation
        new_section = '''       // Make functions globally available and set up event delegation
       useEffect(() => {
         console.log('Setting up global image functions and event delegation...');
         
         // Event delegation for image clicks
         const editor = contentRef.current;
         if (editor) {
           const handleImageClick = (e) => {
             // Check if clicked element is an image with our ID format
             if (e.target.tagName === 'IMG' &amp;&amp; e.target.id &amp;&amp; e.target.id.startsWith('img-')) {
               e.preventDefault();
               e.stopPropagation();
               const imageId = e.target.id.replace('img-', '');
               console.log('Image clicked via delegation! ID:', imageId);
               selectImage(parseInt(imageId));
             }
           };
           
           editor.addEventListener('click', handleImageClick);
           console.log('Event delegation set up for image clicks');
           
           // Store cleanup function
           const cleanup = () => {
             editor.removeEventListener('click', handleImageClick);
           };
           
           // Return cleanup for when component unmounts
           window.__imageClickCleanup = cleanup;
         }
         
         console.log('Setting up global image functions...');
         window.selectImage = selectImage;
'''
        # Replace just these two lines
        lines = lines[:i] + [new_section] + lines[i+2:]
        modified = True
        print("✓ Added event delegation")
        break
    i += 1

# Write back
with open('src/App.js', 'w') as f:
    f.writelines(lines)

print("✓ Successfully fixed image click handler!")
print("✓ Images will now be clickable via event delegation")