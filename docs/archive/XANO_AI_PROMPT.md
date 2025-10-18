# XANO AI Prompt for Database Setup

Copy and paste this prompt to XANO AI to automatically create the database structure:

---

## Prompt for XANO AI:

```
Please create a complete blog management system with the following specifications:

DATABASE TABLES:

1. Create a table called "blog_posts" with these fields:
   - id: integer, primary key, auto-increment
   - title: text, required, max 255 characters
   - content: long text, required (for HTML content)
   - author: text, required, max 100 characters
   - author_avatar: text, optional, max 500 characters (URL)
   - category: text, optional, max 50 characters
   - tags: text, optional (comma-separated)
   - image_url: text, optional, max 500 characters (featured image from Cloudinary)
   - status: text, required, default "draft" (values: "draft" or "published")
   - created_at: timestamp, auto-set on create
   - updated_at: timestamp, auto-update on modify
   - published_at: timestamp, optional
   - view_count: integer, default 0
   - likes: integer, default 0

   Add indexes on: status, created_at, published_at

2. Create a table called "blog_images" with these fields:
   - id: integer, primary key, auto-increment
   - cloudinary_public_id: text, required, unique, max 255 characters
   - cloudinary_url: text, required, max 500 characters
   - cloudinary_secure_url: text, required, max 500 characters
   - original_filename: text, required, max 255 characters
   - file_size: integer, required (in bytes)
   - width: integer, optional
   - height: integer, optional
   - format: text, required, max 10 characters (jpg, png, etc.)
   - uploaded_by: text, optional, max 100 characters
   - created_at: timestamp, auto-set on create

   Add indexes on: cloudinary_public_id, created_at

API ENDPOINTS:

1. POST /blog/upload-image
   - Accept file upload
   - Upload to Cloudinary using environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
   - Store metadata in blog_images table
   - Return JSON with cloudinary_url, cloudinary_secure_url, cloudinary_public_id, width, height, format

2. POST /blog/posts
   - Create new blog post
   - Accept JSON body with: title, content, author, author_avatar, category, tags, image_url, status
   - Set created_at and updated_at timestamps
   - Return created post object

3. PATCH /blog/posts/{post_id}
   - Update existing blog post
   - Accept JSON body with any fields to update
   - Update updated_at timestamp
   - Return updated post object

4. GET /blog/posts
   - Get all blog posts
   - Accept query parameters: status (default "published"), limit (default 50), offset (default 0), sort (default "published_at"), order (default "desc")
   - Return JSON with posts array, total count, limit, offset

5. GET /blog/posts/{post_id}
   - Get single blog post by ID
   - Return post object

6. POST /blog/posts/{post_id}/publish
   - Change post status from "draft" to "published"
   - Set published_at to current timestamp
   - Return updated post object

7. DELETE /blog/posts/{post_id}
   - Delete blog post by ID
   - Return success message

CORS CONFIGURATION:
Enable CORS for these origins:
- https://gleaming-cendol-417bf3.netlify.app
- https://history-of-idaho-broadcasting--717ee2.webflow.io
- http://localhost:3000

SECURITY:
- Add input validation for all endpoints
- Validate image file types (only jpg, jpeg, png, gif, webp)
- Limit file upload size to 5MB
- Add rate limiting on upload endpoint

Please create all tables, endpoints, and configurations as specified above.
```

---

## Alternative: Step-by-Step Instructions for Manual Setup

If you prefer to set up manually instead of using XANO AI:

### Step 1: Create blog_posts Table

1. Go to Database → Add Table
2. Name: `blog_posts`
3. Add fields one by one:
   - Click "Add Field"
   - Enter field name, select type, set properties
   - Repeat for all fields listed above

### Step 2: Create blog_images Table

1. Go to Database → Add Table
2. Name: `blog_images`
3. Add all fields as specified

### Step 3: Create Upload Image Endpoint

1. Go to API → Add Endpoint
2. Method: POST
3. Path: `/blog/upload-image`
4. Add Function Stack:
   - Input: File upload (name: `file`)
   - External API Request to Cloudinary:
     - URL: `https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/image/upload`
     - Method: POST
     - Body: multipart/form-data with file
   - Add Record to blog_images table
   - Return response

### Step 4: Create Other Endpoints

Follow similar process for each endpoint listed above.

### Step 5: Configure Environment Variables

1. Go to Settings → Environment Variables
2. Add:
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET

### Step 6: Configure CORS

1. Go to Settings → API Settings
2. Add allowed origins

---

## Verification Checklist

After XANO AI creates everything, verify:

- [ ] blog_posts table exists with all fields
- [ ] blog_images table exists with all fields
- [ ] All 7 API endpoints are created
- [ ] Environment variables are set
- [ ] CORS is configured
- [ ] Test upload-image endpoint with a sample image
- [ ] Test create post endpoint
- [ ] Test get posts endpoint

---

## Testing the Endpoints

Use XANO's built-in API tester or Postman:

### Test 1: Upload Image
```
POST /blog/upload-image
Body: multipart/form-data
- file: [select an image file]

Expected Response:
{
  "success": true,
  "image": {
    "id": 1,
    "cloudinary_url": "https://res.cloudinary.com/...",
    "cloudinary_secure_url": "https://res.cloudinary.com/...",
    "cloudinary_public_id": "blog/abc123",
    "width": 1200,
    "height": 800,
    "format": "jpg"
  }
}
```

### Test 2: Create Post
```
POST /blog/posts
Body: JSON
{
  "title": "Test Post",
  "content": "<p>This is a test post</p>",
  "author": "Test User",
  "status": "draft"
}

Expected Response:
{
  "success": true,
  "post": {
    "id": 1,
    "title": "Test Post",
    "content": "<p>This is a test post</p>",
    "author": "Test User",
    "status": "draft",
    "created_at": 1234567890
  }
}
```

### Test 3: Get Posts
```
GET /blog/posts?status=published&limit=10

Expected Response:
{
  "success": true,
  "posts": [...],
  "total": 5,
  "limit": 10,
  "offset": 0
}
```

---

## Common Issues and Solutions

### Issue: Cloudinary upload fails
**Solution:** 
- Verify environment variables are set correctly
- Check Cloudinary credentials
- Ensure upload preset exists (if using unsigned uploads)

### Issue: CORS errors
**Solution:**
- Add all required origins to CORS settings
- Include http://localhost:3000 for development
- Ensure HTTPS is used for production domains

### Issue: File upload size limit
**Solution:**
- Increase XANO's file upload limit in settings
- Add validation to reject files over 5MB

### Issue: Posts not returning
**Solution:**
- Check if posts exist in database
- Verify status filter is correct
- Check if published_at is set for published posts

---

## Next Steps After Setup

1. Test all endpoints in XANO
2. Copy the XANO base URL (e.g., `https://x8ki-letl-twmt.n7.xano.io/api:1`)
3. Add to React app's `.env` file
4. Proceed with React app integration (see IMPLEMENTATION_GUIDE.md)