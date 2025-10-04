#!/usr/bin/env python3
"""
Add drag-to-resize functionality to image handles in RichBlogEditor.
This restores the lost functionality from PatchedRichBlogEditor.js
"""

with open('src/App.js', 'r') as f:
    content = f.read()

# Find the selectImage function and locate where handles are created
# We need to add event listeners to the handles

# The section we're looking for is around line 2880-2910
# We need to replace the handle creation code to add mousedown listeners

old_handle_code = '''         handlePositions.forEach(pos => {
           const handle = document.createElement('div');
           handle.className = `image-handle handle-${pos.class}`;
           handle.style.cssText = `
             position: fixed;
             top: ${pos.top}px;
             left: ${pos.left}px;
             width: 12px;
             height: 12px;
             background: #4285f4;
             border: 2px solid white;
             border-radius: 50%;
             cursor: ${pos.class}-resize;
             z-index: 10001;
             box-shadow: 0 2px 4px rgba(0,0,0,0.2);
           `;
           
           document.body.appendChild(handle);
           console.log(`Created ${pos.class} handle at`, pos.top, pos.left);
         });'''

new_handle_code = '''         // Store handles for position updates
         const handles = [];
         
         // Function to update handle and toolbar positions
         const updatePositions = () => {
           const rect = img.getBoundingClientRect();
           handles.forEach(({ pos, el }) => {
             if (pos.class.includes('n')) el.style.top = `${rect.top - 6}px`;
             if (pos.class.includes('s')) el.style.top = `${rect.bottom - 6}px`;
             if (pos.class.includes('w')) el.style.left = `${rect.left - 6}px`;
             if (pos.class.includes('e')) el.style.left = `${rect.right - 6}px`;
           });
           // Update toolbar position
           toolbar.style.top = `${rect.top - 50}px`;
           toolbar.style.left = `${rect.left}px`;
         };
         
         handlePositions.forEach(pos => {
           const handle = document.createElement('div');
           handle.className = `image-handle handle-${pos.class}`;
           handle.style.cssText = `
             position: fixed;
             top: ${pos.top}px;
             left: ${pos.left}px;
             width: 12px;
             height: 12px;
             background: #4285f4;
             border: 2px solid white;
             border-radius: 50%;
             cursor: ${pos.class}-resize;
             z-index: 10001;
             box-shadow: 0 2px 4px rgba(0,0,0,0.2);
           `;
           
           // Add drag-to-resize functionality
           handle.addEventListener('mousedown', (e) => {
             e.preventDefault();
             e.stopPropagation();
             
             const startX = e.clientX;
             const startWidth = img.offsetWidth;
             
             const onMouseMove = (moveEvt) => {
               const dx = moveEvt.clientX - startX;
               let newWidth;
               
               // Calculate new width based on which handle is being dragged
               if (pos.class.includes('e')) {
                 newWidth = startWidth + dx;
               } else if (pos.class.includes('w')) {
                 newWidth = startWidth - dx;
               } else {
                 newWidth = startWidth;
               }
               
               // Enforce minimum width
               newWidth = Math.max(newWidth, 50);
               
               // Apply new width
               img.style.width = `${newWidth}px`;
               img.style.height = 'auto';
               
               // Update handle and toolbar positions
               updatePositions();
             };
             
             const onMouseUp = () => {
               window.removeEventListener('mousemove', onMouseMove);
               window.removeEventListener('mouseup', onMouseUp);
               
               // Save updated content after resizing
               if (contentRef.current) {
                 setContent(contentRef.current.innerHTML);
               }
               
               console.log('Resize complete, content saved');
             };
             
             window.addEventListener('mousemove', onMouseMove);
             window.addEventListener('mouseup', onMouseUp);
           });
           
           document.body.appendChild(handle);
           handles.push({ pos, el: handle });
           console.log(`Created ${pos.class} handle at`, pos.top, pos.left);
         });'''

# Replace the old code with new code
if old_handle_code in content:
    content = content.replace(old_handle_code, new_handle_code)
    print("✓ Successfully added drag-to-resize functionality!")
else:
    print("✗ Could not find the exact handle creation code.")
    print("The code structure may have changed. Manual intervention needed.")
    exit(1)

# Write the updated content
with open('src/App.js', 'w') as f:
    f.write(content)

print("✓ File updated successfully!")
print("✓ Drag-to-resize handles are now functional")