# Fix Image Click Handler Issue

## Problem
- Image onclick handlers are attached during insertion
- But `setContent(editor.innerHTML)` causes re-render
- Re-render removes all event listeners from images
- Images become unclickable

## Solution
Use event delegation instead of direct onclick handlers:
1. Attach click listener to the editor container (contentRef)
2. Check if clicked element is an image
3. Extract image ID and call selectImage

## Implementation
Replace direct onclick with event delegation in useEffect