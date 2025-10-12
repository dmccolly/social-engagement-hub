# Rich Blog Editor - Testing Checklist

## Image Upload and Management Testing

### Step 1: Basic Image Upload
- [ ] Click "Create Post" to open the editor
- [ ] Click the green "Upload Image" button
- [ ] Select an image file from your computer
- [ ] Verify the image appears in the content area
- [ ] Check that the image is properly positioned within the editor

### Step 2: Image Selection
- [ ] Click on the uploaded image
- [ ] Verify a **blue border** appears around the selected image
- [ ] Check that **blue corner handles** appear at the corners
- [ ] Confirm a **floating toolbar** appears above the image

### Step 3: Image Resizing
- [ ] With image selected, click "Small" in the floating toolbar
- [ ] Verify image resizes to approximately 200px width
- [ ] Click "Medium" - verify resize to ~400px width
- [ ] Click "Large" - verify resize to ~600px width
- [ ] Click "Full" - verify image takes full width of container

### Step 4: Image Positioning
- [ ] Click "← Left" in the floating toolbar
- [ ] Verify image floats to the left with text wrapping around it
- [ ] Click "Center" - verify image centers with no text wrapping
- [ ] Click "Right →" - verify image floats right with text wrapping

### Step 5: Manual Resize Handles
- [ ] Select an image to show corner handles
- [ ] Try dragging a corner handle to manually resize
- [ ] Verify the image resizes smoothly during drag

## Text Editing Testing

### Step 6: Backwards Typing Fix
- [ ] Click in the content area
- [ ] Type a sentence: "This is a test of normal typing"
- [ ] Verify text appears left-to-right in normal order
- [ ] Verify cursor stays at the end of typed text
- [ ] No backwards or reversed text should appear

### Step 7: Text Formatting
- [ ] Select some text and click "Bold" - verify bold formatting
- [ ] Select text and click "Italic" - verify italic formatting
- [ ] Try different font families from the dropdown
- [ ] Try different font sizes from the dropdown
- [ ] Use the color picker to change text color

### Step 8: Headings and Structure
- [ ] Select text and change to "Heading 1" from dropdown
- [ ] Verify text becomes large heading format
- [ ] Try "Heading 2" and "Heading 3" options
- [ ] Return to "Normal Text" option

### Step 9: Text Alignment
- [ ] Select text and click "← Left" alignment
- [ ] Click "Center" alignment - verify text centers
- [ ] Click "Right →" alignment - verify text aligns right

### Step 10: Links
- [ ] Select some text
- [ ] Enter a URL in the link input field (e.g., https://google.com)
- [ ] Click "Add Link" - verify text becomes clickable link
- [ ] Select linked text and click "Remove Link" - verify link removed

## Live Preview Testing

### Step 11: Preview Functionality
- [ ] Type content in the editor
- [ ] Verify content appears immediately in the "Live Preview" panel
- [ ] Upload and position an image
- [ ] Verify image appears correctly positioned in preview
- [ ] Apply text formatting
- [ ] Verify formatting appears correctly in preview

## Save and Integration Testing

### Step 12: Save Functionality
- [ ] Enter a post title
- [ ] Add content with text and images
- [ ] Click "Save Post" button
- [ ] Verify the post appears in the main feed
- [ ] Check that images are preserved in the saved post

## Expected Results

✅ **All images should appear within the content area**
✅ **Images should be selectable with blue borders and handles**
✅ **Floating toolbar should provide resize and position controls**
✅ **Text should type normally from left to right**
✅ **All formatting tools should work properly**
✅ **Live preview should update in real-time**
✅ **Saved posts should preserve all formatting and images**

## If Issues Found

If any functionality doesn't work as expected:
1. Note the specific step that failed
2. Describe what happened vs. what was expected
3. Check browser console for any error messages
4. Report back with details for further debugging

The editor should now provide a complete, professional rich text editing experience with full image management capabilities.
