#!/usr/bin/env python3
"""
Fix the useEffect to properly integrate event delegation with existing cleanup.
"""

with open('src/App.js', 'r') as f:
    lines = f.readlines()

# Find the useEffect section and rebuild it properly
start_idx = None
end_idx = None

for i, line in enumerate(lines):
    if '// Make functions globally available and set up event delegation' in line:
        start_idx = i
    if start_idx and '}, [selectImage]);' in line:
        end_idx = i
        break

if not start_idx or not end_idx:
    print("Could not find useEffect boundaries")
    exit(1)

print(f"Found useEffect from line {start_idx+1} to {end_idx+1}")

# Create the complete new useEffect
new_useeffect = '''       // Make functions globally available and set up event delegation
       useEffect(() => {
         console.log('Setting up global image functions and event delegation...');
         
         // Event delegation for image clicks
         const editor = contentRef.current;
         let handleImageClick = null;
         
         if (editor) {
           handleImageClick = (e) => {
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
         }
         
         // Set up global functions
         window.selectImage = selectImage;
         
         window.resizeImageTo = (imageId, size) => {
           console.log('Resizing image', imageId, 'to', size);
           const img = document.getElementById(`img-${imageId}`);
           if (img) {
             const sizeMap = {
               small: '200px',
               medium: '400px', 
               large: '600px',
               full: '100%'
             };
             img.style.width = sizeMap[size];
             
             if (contentRef.current) {
               setContent(contentRef.current.innerHTML);
             }
             
             // Refresh selection
             setTimeout(() => selectImage(imageId), 10);
           }
         };
         
         window.positionImageTo = (imageId, position) => {
           console.log('Positioning image', imageId, 'to', position);
           const img = document.getElementById(`img-${imageId}`);
           if (img) {
             if (position === 'left') {
               img.style.float = 'left';
               img.style.margin = '0 15px 15px 0';
               img.style.display = 'block';
             } else if (position === 'right') {
               img.style.float = 'right';
               img.style.margin = '0 0 15px 15px';
               img.style.display = 'block';
             } else {
               img.style.float = 'none';
               img.style.margin = '15px auto';
               img.style.display = 'block';
             }
             
             if (contentRef.current) {
               setContent(contentRef.current.innerHTML);
             }
             
             // Refresh selection
             setTimeout(() => selectImage(imageId), 10);
           }
         };
         
         window.deselectImage = () => {
           console.log('Deselecting image');
           setSelectedImageId(null);
           document.querySelectorAll('.selected-image').forEach(el => {
             el.classList.remove('selected-image');
             el.style.border = '2px solid transparent';
             el.style.boxShadow = 'none';
           });
           document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
           document.querySelectorAll('.image-handle').forEach(el => el.remove());
         };
         
         // Cleanup function
         return () => {
           // Remove event delegation listener
           if (editor && handleImageClick) {
             editor.removeEventListener('click', handleImageClick);
           }
           
           // Clean up global functions
           delete window.selectImage;
           delete window.resizeImageTo;
           delete window.positionImageTo;
           delete window.deselectImage;
           
           // Clean up any leftover UI elements
           document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
           document.querySelectorAll('.image-handle').forEach(el => el.remove());
         };
       }, [selectImage]);
'''

# Replace the entire useEffect section
lines = lines[:start_idx] + [new_useeffect] + lines[end_idx+1:]

# Write back
with open('src/App.js', 'w') as f:
    f.writelines(lines)

print("✓ Successfully rebuilt useEffect with proper event delegation and cleanup!")