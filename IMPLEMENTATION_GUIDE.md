# Implementation Guide: Cloudinary + XANO Integration

## Overview

This guide walks you through implementing persistent image storage and blog post management using Cloudinary and XANO.

---

## Phase 1: XANO Setup (Do This First)

### Step 1: Create Database Tables in XANO

1. Open your XANO workspace
2. Go to the Database section
3. Use the XANO AI or manually create the tables as specified in `XANO_DATABASE_SETUP.md`

**Tables to create:**
- `blog_posts` (main blog post data)
- `blog_images` (image metadata tracking)

### Step 2: Configure Cloudinary in XANO

1. In XANO, go to Settings → Environment Variables
2. Add these variables:
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

**To find these values:**
1. Log into your Cloudinary account
2. Go to Dashboard
3. Copy the Cloud Name, API Key, and API Secret

### Step 3: Create XANO API Endpoints

Use XANO AI or manually create these endpoints (see `XANO_DATABASE_SETUP.md` for details):

1. `POST /blog/upload-image` - Upload image to Cloudinary
2. `POST /blog/posts` - Create blog post
3. `PATCH /blog/posts/{post_id}` - Update blog post
4. `GET /blog/posts` - Get all published posts
5. `GET /blog/posts/{post_id}` - Get single post
6. `POST /blog/posts/{post_id}/publish` - Publish post
7. `DELETE /blog/posts/{post_id}` - Delete post

### Step 4: Configure CORS in XANO

1. Go to Settings → API Settings → CORS
2. Add these allowed origins:
   - `https://gleaming-cendol-417bf3.netlify.app` (your Netlify domain)
   - `https://history-of-idaho-broadcasting--717ee2.webflow.io` (your Webflow domain)
   - `http://localhost:3000` (for local development)

### Step 5: Test XANO Endpoints

Use XANO's built-in API testing or Postman to verify:
- [ ] Image upload works and returns Cloudinary URL
- [ ] Blog post creation works
- [ ] Blog post retrieval works
- [ ] CORS is configured correctly

---

## Phase 2: React App Setup

### Step 1: Install Dependencies

```bash
cd social-engagement-hub
npm install axios
```

### Step 2: Create Environment Variables

Create `.env` file in project root:

```env
REACT_APP_XANO_BASE_URL=https://your-xano-instance.xano.io/api:1
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

**To get Cloudinary Upload Preset:**
1. Log into Cloudinary
2. Go to Settings → Upload
3. Scroll to "Upload presets"
4. Create a new unsigned upload preset (or use existing)
5. Set folder to "blog"
6. Copy the preset name

### Step 3: Add to Netlify Environment Variables

1. Go to Netlify dashboard
2. Select your site
3. Go to Site settings → Environment variables
4. Add the same three variables from `.env`

### Step 4: Create Service Files

Copy the code from `CLOUDINARY_INTEGRATION_CODE.md`:

1. Create `src/services/cloudinaryService.js`
2. Create `src/services/xanoService.js`

---

## Phase 3: Update App.js

### Step 1: Add Imports

At the top of `src/App.js`, add:

```javascript
import { uploadImageToCloudinary } from './services/cloudinaryService';
import { 
  createBlogPost, 
  updateBlogPost, 
  publishBlogPost,
  getPublishedPosts 
} from './services/xanoService';
```

### Step 2: Update Image Upload Handler

Replace the existing `handleFileUpload` function with the new version from `CLOUDINARY_INTEGRATION_CODE.md`.

**Key changes:**
- Remove `URL.createObjectURL(file)` 
- Add `await uploadImageToCloudinary(file)`
- Use returned Cloudinary URL instead of blob URL

### Step 3: Update Save/Publish Functions

Replace localStorage-based save functions with XANO API calls (see `CLOUDINARY_INTEGRATION_CODE.md`).

### Step 4: Update Widget to Fetch from XANO

Replace the widget's localStorage polling with XANO API calls.

---

## Phase 4: Testing

### Test Locally

1. Start the development server:
```bash
npm start
```

2. Test the following:
   - [ ] Upload an image → Should upload to Cloudinary
   - [ ] Create a blog post → Should save to XANO
   - [ ] Publish a post → Should update status in XANO
   - [ ] Refresh page → Images should still display (Cloudinary URLs)
   - [ ] Check widget → Should show published posts from XANO

### Test on Netlify

1. Commit and push changes:
```bash
git add .
git commit -m "Integrate Cloudinary and XANO for persistent storage"
git push origin main
```

2. Wait for Netlify to deploy

3. Test on live site:
   - [ ] Upload image
   - [ ] Create and publish post
   - [ ] Refresh page
   - [ ] Check widget on Webflow site

---

## Phase 5: Migration (Optional)

If you have existing posts in localStorage that you want to migrate:

### Create Migration Script

Create `src/scripts/migrateToXano.js`:

```javascript
import { createBlogPost } from '../services/xanoService';

export const migrateLocalStoragePosts = async () => {
  try {
    // Get posts from localStorage
    const stored = localStorage.getItem('socialHubPosts');
    if (!stored) {
      console.log('No posts to migrate');
      return;
    }

    const posts = JSON.parse(stored);
    console.log(`Found ${posts.length} posts to migrate`);

    // Migrate each post
    for (const post of posts) {
      try {
        const postData = {
          title: post.title,
          content: post.content,
          author: post.author || 'Unknown',
          author_avatar: post.author_avatar || '',
          category: post.category || 'General',
          tags: post.tags || '',
          image_url: post.imageUrl || '',
          status: 'published',
          published_at: post.date || new Date().toISOString(),
        };

        const result = await createBlogPost(postData);
        console.log(`Migrated post: ${post.title}`, result);
      } catch (error) {
        console.error(`Failed to migrate post: ${post.title}`, error);
      }
    }

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration error:', error);
  }
};
```

### Run Migration

Add a temporary button in your admin panel:

```javascript
<button onClick={migrateLocalStoragePosts}>
  Migrate Posts to XANO
</button>
```

Click it once to migrate, then remove the button.

---

## Phase 6: Cleanup

### Remove localStorage Dependencies

1. Remove all `localStorage.setItem('socialHubPosts', ...)` calls
2. Remove all `localStorage.getItem('socialHubPosts')` calls
3. Keep only XANO API calls

### Update Widget

Ensure widget only fetches from XANO, not localStorage.

---

## Troubleshooting

### Images Not Uploading

**Check:**
1. Cloudinary credentials are correct in `.env`
2. Upload preset exists and is unsigned
3. CORS is enabled in Cloudinary settings
4. Network tab shows successful upload to Cloudinary

### Posts Not Saving

**Check:**
1. XANO base URL is correct
2. XANO endpoints are created and working
3. CORS is configured in XANO
4. Network tab shows successful API calls

### Widget Not Updating

**Check:**
1. Widget is fetching from XANO, not localStorage
2. XANO endpoint returns published posts
3. CORS allows requests from Webflow domain
4. Network tab shows successful API calls

### Images Not Displaying After Refresh

**Check:**
1. Images are uploaded to Cloudinary (not blob URLs)
2. Cloudinary URLs are saved in XANO database
3. Posts are fetched from XANO with image URLs
4. Image URLs are HTTPS (secure_url from Cloudinary)

---

## Architecture Diagram

```
┌─────────────────┐
│   React App     │
│  (Netlify)      │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────┐
│   Cloudinary    │  │    XANO      │
│  (Image CDN)    │  │  (Database)  │
└─────────────────┘  └──────┬───────┘
         │                   │
         │                   │
         └───────┬───────────┘
                 │
                 ▼
         ┌───────────────┐
         │  Widget on    │
         │  Webflow Site │
         └───────────────┘
```

**Flow:**
1. User uploads image → Cloudinary
2. Cloudinary returns permanent URL
3. User creates post with Cloudinary URL → XANO
4. Widget fetches posts from XANO
5. Widget displays images from Cloudinary CDN

---

## Success Criteria

✅ Images upload to Cloudinary and return permanent URLs
✅ Blog posts save to XANO database
✅ Images persist after page refresh
✅ Widget on Webflow site displays posts with images
✅ No localStorage dependencies for images or posts
✅ All images load from Cloudinary CDN
✅ Posts are accessible across all domains

---

## Next Steps After Implementation

1. **Add Authentication:** Secure XANO endpoints with user authentication
2. **Add Image Optimization:** Use Cloudinary transformations for responsive images
3. **Add Caching:** Implement caching strategy for faster load times
4. **Add Analytics:** Track post views and engagement
5. **Add Search:** Implement search functionality for posts
6. **Add Categories:** Organize posts by categories
7. **Add Comments:** Allow users to comment on posts

---

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check the Network tab for failed API calls
3. Verify XANO endpoints are working in XANO's API tester
4. Verify Cloudinary uploads work in Cloudinary's console
5. Check CORS configuration in both XANO and Cloudinary