# Social Engagement Hub

A complete social media and engagement platform for Webflow integration.

## Features
- Rich media blog posts (YouTube, video, audio embedding)
- Email campaign management
- Member management with signup widgets
- Content scheduling with approval routing
- Media library with Cloudinary integration
- Embeddable iframe widgets for Webflow

## Setup
1. Upload to GitHub
2. Deploy to Netlify
3. Add environment variables in Netlify:
   - REACT_APP_XANO_BASE_URL
   - REACT_APP_XANO_API_KEY
   - REACT_APP_CLOUDINARY_CLOUD_NAME
   - REACT_APP_CLOUDINARY_UPLOAD_PRESET

## Widget Embedding
```html
<iframe src="https://your-app.netlify.app/widget/signup" width="400" height="500"></iframe>
```
