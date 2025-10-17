# Upload Widget Documentation

## 🎯 Overview

The Upload Widget allows visitors to submit content (files, media, documents) to your platform with automatic user recognition and Cloudinary integration.

## ✨ Features

### 1. **One-Time Visitor Sign-In**
- First-time visitors see a sign-in popup
- Requires: First Name, Last Name, Email
- Stored in localStorage for future visits
- Integrated with memberService for tracking

### 2. **Smart User Recognition**
- Automatically recognizes returning visitors
- Pre-fills user information
- No repeated sign-ins required
- Seamless upload experience

### 3. **Upload Form**
- **Title** (mandatory, 50 characters max)
- **Description** (mandatory, 2500 characters max)
- **File Upload** (any file type, 10MB max)
- Character counters for both fields
- Real-time validation

### 4. **File Handling**
- Accepts any file type (images, videos, PDFs, documents, etc.)
- Automatic file type detection
- File size validation (10MB limit)
- Visual file preview with appropriate icons
- Upload progress indicator

### 5. **Cloudinary Integration**
- Files uploaded to: `/visitor-uploads/pending/{email}/`
- Automatic metadata capture:
  - cloudinary_id
  - secure_url
  - resource_type (image/video/raw)
  - format (jpg, pdf, docx, etc.)
  - file_size

### 6. **Data Storage**
Submission data includes:
- fname, lname, email
- title, description
- cloudinary_id, file_url
- file_type, file_format, file_size
- upload_date, status (pending)

### 7. **User Experience**
- Upload progress bar with percentage
- Success message after upload
- "Upload Another File" option
- Clear error messages
- Responsive design

## 🔧 Technical Implementation

### Component Location
```
src/components/widgets/UploadWidget.js
```

### Dependencies
- `uploadImageWithProgress` from cloudinaryService
- `getMembers`, `addMember` from memberService
- Lucide React icons

### Data Flow
```
1. Visitor arrives → Check localStorage
2. If new → Show sign-in popup
3. If recognized → Show upload form
4. File selected → Validate size/type
5. Form submitted → Upload to Cloudinary
6. Get Cloudinary response → Prepare XANO data
7. Send to XANO (TODO) → Show success
8. Option to upload another
```

### Cloudinary Folder Structure
```
visitor-uploads/
  └── pending/
      └── {email}/
          └── uploaded-files...
```

## 🎨 Widget Configuration

Available settings in Settings → Widget Builder:

1. **Header Text** - Customize the widget title
2. **Header Color** - Set the header background color
3. **Button Text** - Customize the upload button text
4. **Border Radius** - Adjust corner roundness
5. **Max File Size** - Set maximum file size in MB
6. **Show Progress** - Toggle upload progress bar

## 📝 Usage

### In Settings Widget Builder:
1. Navigate to Settings → Widget Builder
2. Select "Upload Widget"
3. Customize settings
4. Copy embed code
5. Paste on your website

### Embed Code Example:
```html
<iframe 
  src="https://your-site.com/widget/upload?settings=%7B...%7D" 
  width="100%" 
  height="800" 
  frameborder="0">
</iframe>
```

### Preview URL:
```
/widget/upload?settings={encoded-settings}
```

## 🔌 XANO Integration (TODO)

### Required XANO Table Structure:
```javascript
{
  fname: string,
  lname: string,
  email: string,
  title: string,
  description: string,
  cloudinary_id: string,
  file_url: string,
  file_type: string,
  file_format: string,
  file_size: number,
  upload_date: datetime,
  status: string (default: "pending")
}
```

### Integration Steps:
1. Create XANO table for visitor uploads
2. Create POST endpoint
3. Update UploadWidget.js line ~XXX with XANO endpoint
4. Uncomment XANO fetch code
5. Test submission

### Code to Update:
```javascript
// In UploadWidget.js, replace:
// TODO: Send to XANO endpoint

// With:
await fetch('YOUR_XANO_ENDPOINT', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(submissionData)
});
```

## 🎯 User Flow

### First-Time Visitor:
1. Clicks upload button
2. Sees sign-in popup
3. Enters name and email
4. Proceeds to upload form
5. Fills title and description
6. Selects file
7. Uploads
8. Sees success message

### Returning Visitor:
1. Sees upload form immediately
2. User info pre-filled
3. Fills title and description
4. Selects file
5. Uploads
6. Sees success message

## 🔒 Security & Validation

### Client-Side Validation:
- Email format validation
- File size validation (10MB)
- Required field validation
- Character limits enforced

### Data Persistence:
- Visitor info in localStorage
- Submissions in localStorage (temporary)
- Files in Cloudinary
- Metadata in XANO (when integrated)

## 📊 File Type Detection

The widget automatically detects and displays appropriate icons:
- 🖼️ Images (jpg, png, gif, etc.)
- 🎥 Videos (mp4, mov, avi, etc.)
- 📄 PDFs
- 📝 Documents (docx, txt, etc.)
- 📁 Other files

## 🚀 Future Enhancements

Potential additions:
1. Multiple file upload
2. Drag-and-drop interface
3. File preview before upload
4. Upload history for visitors
5. Admin approval workflow
6. Email notifications
7. File categorization
8. Advanced file type restrictions

## 🐛 Troubleshooting

### Common Issues:

**Upload fails:**
- Check file size (must be < 10MB)
- Verify Cloudinary credentials
- Check internet connection

**Sign-in popup doesn't appear:**
- Clear localStorage
- Check browser console for errors

**File not uploading:**
- Verify cloudinaryService is configured
- Check Cloudinary upload preset
- Ensure file type is supported

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify Cloudinary configuration
3. Test with different file types
4. Check localStorage data

## ✅ Testing Checklist

- [ ] First-time visitor sign-in works
- [ ] Returning visitor recognized
- [ ] File upload succeeds
- [ ] Progress bar displays
- [ ] Success message appears
- [ ] Upload another file works
- [ ] All file types accepted
- [ ] File size validation works
- [ ] Character counters accurate
- [ ] Embed code generates correctly
- [ ] Widget preview works
- [ ] Mobile responsive

---

**Status:** ✅ Complete and ready for use
**XANO Integration:** ⏳ Pending (endpoint needed)
**Cloudinary:** ✅ Integrated
**Member Tracking:** ✅ Integrated