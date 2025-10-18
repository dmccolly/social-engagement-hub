# Upload Widget Implementation Plan

## Questions for Clarification

### 1. Visitor Recognition
- How do we recognize if a visitor is already known? 
  - Check localStorage for existing member data?
  - Cookie-based?
  - Should we use the existing `memberService.js` to check by email?

### 2. Cloudinary Folder Structure
- What should the folder naming convention be?
  - `/visitor-uploads/{email}/` ?
  - `/visitor-uploads/{date}/` ?
  - `/visitor-uploads/pending/` (before migration)?
- Should each visitor have their own subfolder?

### 3. File Upload Workflow
- Should we use the existing `cloudinaryService.js` or create a new one?
- Do you want upload progress indicators?
- File size limits? (Cloudinary has limits)
- Any file type restrictions or should it truly accept ANY file?

### 4. Data Storage
- Where should we store the submission data (fname, lname, email, title, description, cloudinary_id, url)?
  - localStorage (temporary)?
  - Should this integrate with XANO?
  - Or just Cloudinary metadata?

### 5. Widget Appearance & Behavior
- Should this widget have the same customization options as others (colors, themes, etc.)?
- What happens after successful upload?
  - Show success message?
  - Show the uploaded file preview?
  - Clear the form?
  - Allow multiple uploads in one session?

### 6. File Manager Integration
- You mentioned "media file manager repo" - is this a separate system?
- How should the "migration" work when you choose to move files from pending to permanent?
- Should the widget show a list of previously uploaded files by that visitor?

### 7. Widget Configuration in Settings
- What settings should be configurable?
  - Header text
  - Button text ("Upload" vs "Submit" etc.)
  - Show/hide description field
  - Required vs optional fields
  - Success message customization

### 8. Security & Validation
- Email validation required?
- Should we prevent duplicate uploads of the same file?
- Any spam prevention needed?

## Proposed Implementation

Based on typical use cases, here's what I'll implement unless you specify otherwise:

### Default Assumptions:
1. **Visitor Recognition:** Check localStorage using memberService
2. **Cloudinary Folder:** `/visitor-uploads/pending/{email}/`
3. **File Upload:** Use existing cloudinaryService with progress indicator
4. **Data Storage:** localStorage + Cloudinary metadata
5. **Widget Behavior:** Show success message, allow multiple uploads
6. **File Manager:** Separate migration process (manual approval)
7. **Widget Config:** Full customization like other widgets
8. **Validation:** Email validation, no duplicate prevention initially

Please review and let me know what needs to be changed!