# Social Engagement Hub

A complete social media and engagement platform for Webflow integration.

## Features
- **Fixed Rich Blog Editor**: A robust and reliable rich text editor that resolves the backwards typing issue and provides enhanced image management capabilities.
- Rich media blog posts (YouTube, video, audio embedding)
- Email campaign management
- Member management with signup widgets
- Content scheduling with approval routing
- Media library with Cloudinary integration
- Embeddable iframe widgets for Webflow

## Rich Blog Editor Fixes

The `FixedRichBlogEditor.js` component addresses the following critical issues:

- **Backwards Typing Issue**: The editor now provides a smooth, natural typing experience without the cursor jumping or text appearing in reverse.
- **Image Positioning**: Images can be easily resized and positioned within the content area using an intuitive floating toolbar.

For a detailed analysis of the fixes, please refer to the `BACKWARDS_TYPING_ANALYSIS.md` document.

## Setup
1. Upload to GitHub
2. Deploy to Netlify
3. Add environment variables in Netlify:
   - `REACT_APP_XANO_BASE_URL`
   - `REACT_APP_XANO_API_KEY`
   - `REACT_APP_CLOUDINARY_CLOUD_NAME`
   - `REACT_APP_CLOUDINARY_UPLOAD_PRESET`

## Widget Embedding
```html
<iframe src="https://your-app.netlify.app/widget/signup" width="400" height="500"></iframe>
```

