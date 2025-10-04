#!/usr/bin/env python3
"""
Add drag-to-resize functionality to image handles in RichBlogEditor.
"""

with open('src/App.js', 'r') as f:
    lines = f.readlines()

# Find the line where handlePositions.forEach starts
start_line = None
for i, line in enumerate(lines):
    if 'handlePositions.forEach(pos => {' in line:
        start_line = i
        break

if start_line is None:
    print("Could not find handlePositions.forEach")
    exit(1)

print(f"Found handlePositions.forEach at line {start_line + 1}")

# Find the closing of the forEach (look for the matching });)
end_line = None
brace_count = 0
for i in range(start_line, len(lines)):
    line = lines[i]
    if 'handlePositions.forEach' in line:
        brace_count = 1
    else:
        brace_count += line.count('{') - line.count('}')
    
    if brace_count == 0 and i > start_line:
        end_line = i
        break

if end_line is None:
    print("Could not find end of forEach")
    exit(1)

print(f"Found end of forEach at line {end_line + 1}")

# Create the new code
new_code = '''         // Store handles for position updates
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
         });
'''

# Replace the old forEach with the new code
new_lines = lines[:start_line] + [new_code + '\n'] + lines[end_line + 1:]

# Write back
with open('src/App.js', 'w') as f:
    f.writelines(new_lines)

print("✓ Successfully added drag-to-resize functionality!")
print("✓ Drag-to-resize handles are now functional")