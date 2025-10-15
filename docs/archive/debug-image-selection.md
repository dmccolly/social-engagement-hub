# Debug: Image Selection Not Working

## Problem
- Image appears in the editor canvas
- No handles or toolbar appear when clicking the image
- The selectImage function is not being triggered

## Possible Causes
1. Click event listener not attached to the image
2. Image ID not being set correctly
3. Event propagation being blocked
4. Timing issue with image insertion

## Investigation Steps
- [ ] Check if onclick handler is attached during image insertion
- [ ] Verify image ID format
- [ ] Check console for errors
- [ ] Test if selectImage function is being called
- [ ] Verify the image element structure in DOM