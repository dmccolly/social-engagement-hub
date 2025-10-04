#!/usr/bin/env python3
"""
Fix image click handler by using event delegation instead of direct onclick.
This prevents handlers from being lost when content updates.
"""

with open('src/App.js', 'r') as f:
    content = f.read()

# Step 1: Remove the direct onclick handler from insertImageIntoContent
old_onclick = '''         // Add click handler for selection - WORKING VERSION FROM BACKUP
         img.onclick = function(e) {
           e.preventDefault();
           e.stopPropagation();
           console.log('Image clicked! ID:', imageId);
           selectImage(imageId);
           return false;
         };
         
         console.log('Added click handlers to image:', imageId);'''

new_onclick = '''         // Click handler will be attached via event delegation in useEffect
         console.log('Image created with ID:', imageId);'''

if old_onclick in content:
    content = content.replace(old_onclick, new_onclick)
    print("✓ Removed direct onclick handler")
else:
    print("✗ Could not find onclick handler code")
    exit(1)

# Step 2: Find the useEffect that sets up global functions and add event delegation
# Look for the useEffect with window.selectImage
old_useeffect_start = '''       // Make functions globally available
       useEffect(() => {
         console.log('Setting up global image functions...');
         window.selectImage = selectImage;'''

new_useeffect_start = '''       // Make functions globally available and set up event delegation
       useEffect(() => {
         console.log('Setting up global image functions and event delegation...');
         window.selectImage = selectImage;
         
         // Event delegation for image clicks
         const editor = contentRef.current;
         if (editor) {
           const handleImageClick = (e) => {
             // Check if clicked element is an image with our ID format
             if (e.target.tagName === 'IMG' && e.target.id && e.target.id.startsWith('img-')) {
               e.preventDefault();
               e.stopPropagation();
               const imageId = e.target.id.replace('img-', '');
               console.log('Image clicked via delegation! ID:', imageId);
               selectImage(parseInt(imageId));
             }
           };
           
           editor.addEventListener('click', handleImageClick);
           console.log('Event delegation set up for image clicks');
           
           // Cleanup function
           return () => {
             editor.removeEventListener('click', handleImageClick);
           };
         }'''

if old_useeffect_start in content:
    content = content.replace(old_useeffect_start, new_useeffect_start)
    print("✓ Added event delegation for image clicks")
else:
    print("✗ Could not find useEffect to modify")
    exit(1)

# Write back
with open('src/App.js', 'w') as f:
    f.write(content)

print("✓ Successfully fixed image click handler!")
print("✓ Images will now be clickable even after content updates")