#!/usr/bin/env python3

# Read the file
with open('src/App.js', 'r') as f:
    lines = f.readlines()

# Find the problematic section and fix it
output_lines = []
i = 0
while i < len(lines):
    # Check if we're at the start of the problematic button section
    if i < len(lines) - 20 and '].map((item) => (' in lines[i]:
        # Check if the next lines contain the duplicate onClick
        next_lines = ''.join(lines[i:i+25])
        if 'setContentType(\'post\')' in next_lines and 'setIsCreating(true)' in next_lines:
            # Found the problematic section - skip to the second onClick
            output_lines.append(lines[i])  # Keep the ].map((item) => (
            i += 1
            
            # Skip the first onClick block and whitespace
            while i < len(lines) and 'key={item.id}' not in lines[i]:
                i += 1
            
            # Now write the corrected button
            output_lines.append('               <button\n')
            output_lines.append('                 key={item.id}\n')
            i += 1  # Skip the key line we already found
            
            # Find and keep the second onClick
            while i < len(lines) and 'onClick={() => setActiveSection(item.id)}' not in lines[i]:
                i += 1
            
            # Add the rest of the button
            while i < len(lines) and '))}\n' not in lines[i]:
                output_lines.append(lines[i])
                i += 1
            output_lines.append(lines[i])  # Add the closing ))}\n
            i += 1
            continue
    
    output_lines.append(lines[i])
    i += 1

# Write the fixed content
with open('src/App.js', 'w') as f:
    f.writelines(output_lines)

print("Fixed App.js!")