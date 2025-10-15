# XANO Database Setup for Social Engagement Hub

## Table: blog_posts

### Table Structure

Create a new table called `blog_posts` with the following fields:

| Field Name | Data Type | Properties | Description |
|------------|-----------|------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique identifier for each blog post |
| title | Text | Required, Max length: 255 | Blog post title |
| content | Text (Long) | Required | HTML content of the blog post |
| author | Text | Required, Max length: 100 | Author name |
| author_avatar | Text | Optional, Max length: 500 | URL to author's avatar image |
| category | Text | Optional, Max length: 50 | Post category (e.g., "Technology", "Marketing") |
| tags | Text | Optional | Comma-separated tags |
| image_url | Text | Optional, Max length: 500 | Featured image URL (from Cloudinary) |
| status | Text | Required, Default: "draft" | Post status: "draft" or "published" |
| created_at | Timestamp | Auto-set on create | When post was created |
| updated_at | Timestamp | Auto-update | When post was last modified |
| published_at | Timestamp | Optional | When post was published |
| view_count | Integer | Default: 0 | Number of views |
| likes | Integer | Default: 0 | Number of likes |

### Indexes

Create indexes on these fields for better query performance:
- `status` (for filtering published posts)
- `created_at` (for sorting by date)
- `published_at` (for sorting published posts)

---

## Table: blog_images

### Table Structure

Create a new table called `blog_images` to track all uploaded images:

| Field Name | Data Type | Properties | Description |
|------------|-----------|------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique identifier |
| cloudinary_public_id | Text | Required, Unique, Max length: 255 | Cloudinary public ID |
| cloudinary_url | Text | Required, Max length: 500 | Full Cloudinary URL |
| cloudinary_secure_url | Text | Required, Max length: 500 | HTTPS Cloudinary URL |
| original_filename | Text | Required, Max length: 255 | Original file name |
| file_size | Integer | Required | File size in bytes |
| width | Integer | Optional | Image width in pixels |
| height | Integer | Optional | Image height in pixels |
| format | Text | Required, Max length: 10 | Image format (jpg, png, etc.) |
| uploaded_by | Text | Optional, Max length: 100 | User who uploaded |
| created_at | Timestamp | Auto-set on create | When image was uploaded |

### Indexes

Create indexes on:
- `cloudinary_public_id` (for quick lookups)
- `created_at` (for sorting)

---

## Required API Endpoints

### 1. Upload Image to Cloudinary
**Endpoint:** `POST /blog/upload-image`

**Purpose:** Upload an image file to Cloudinary and store metadata in XANO

**Input:**
- `file` (File upload) - The image file
- `uploaded_by` (Text, optional) - Username/email of uploader

**Process:**
1. Receive the uploaded file
2. Upload to Cloudinary using your Cloudinary credentials
3. Store the response data in `blog_images` table
4. Return the Cloudinary URL and metadata

**Output (JSON):**
```json
{
  "success": true,
  "image": {
    "id": 123,
    "cloudinary_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/blog/abc123.jpg",
    "cloudinary_secure_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/blog/abc123.jpg",
    "cloudinary_public_id": "blog/abc123",
    "width": 1200,
    "height": 800,
    "format": "jpg"
  }
}
```

---

### 2. Create Blog Post
**Endpoint:** `POST /blog/posts`

**Purpose:** Create a new blog post

**Input (JSON):**
```json
{
  "title": "My Blog Post Title",
  "content": "<p>HTML content here...</p>",
  "author": "John Doe",
  "author_avatar": "https://...",
  "category": "Technology",
  "tags": "react,javascript,web",
  "image_url": "https://res.cloudinary.com/...",
  "status": "draft"
}
```

**Output (JSON):**
```json
{
  "success": true,
  "post": {
    "id": 456,
    "title": "My Blog Post Title",
    "content": "<p>HTML content here...</p>",
    "author": "John Doe",
    "status": "draft",
    "created_at": 1234567890,
    "updated_at": 1234567890
  }
}
```

---

### 3. Update Blog Post
**Endpoint:** `PATCH /blog/posts/{post_id}`

**Purpose:** Update an existing blog post

**Input (JSON):** Same as Create, but all fields optional

**Output (JSON):** Updated post object

---

### 4. Get All Published Posts
**Endpoint:** `GET /blog/posts`

**Purpose:** Retrieve all published blog posts (for widget and main app)

**Query Parameters:**
- `status` (optional) - Filter by status (default: "published")
- `limit` (optional) - Number of posts to return (default: 50)
- `offset` (optional) - Pagination offset (default: 0)
- `sort` (optional) - Sort field (default: "published_at")
- `order` (optional) - Sort order: "asc" or "desc" (default: "desc")

**Output (JSON):**
```json
{
  "success": true,
  "posts": [
    {
      "id": 456,
      "title": "My Blog Post Title",
      "content": "<p>HTML content...</p>",
      "author": "John Doe",
      "author_avatar": "https://...",
      "category": "Technology",
      "tags": "react,javascript",
      "image_url": "https://res.cloudinary.com/...",
      "status": "published",
      "created_at": 1234567890,
      "published_at": 1234567890,
      "view_count": 42,
      "likes": 5
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### 5. Get Single Post
**Endpoint:** `GET /blog/posts/{post_id}`

**Purpose:** Get a specific blog post by ID

**Output (JSON):** Single post object

---

### 6. Delete Post
**Endpoint:** `DELETE /blog/posts/{post_id}`

**Purpose:** Delete a blog post

**Output (JSON):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

### 7. Publish Post
**Endpoint:** `POST /blog/posts/{post_id}/publish`

**Purpose:** Change post status from "draft" to "published" and set published_at timestamp

**Output (JSON):** Updated post object with status "published"

---

## Cloudinary Configuration in XANO

To upload images to Cloudinary from XANO, you'll need to configure:

1. **Cloudinary Cloud Name**
2. **Cloudinary API Key**
3. **Cloudinary API Secret**

Store these as environment variables or in XANO's settings.

### Cloudinary Upload Function (for XANO)

In your XANO function for uploading to Cloudinary, use this approach:

1. Use XANO's "External API Request" to POST to Cloudinary
2. Endpoint: `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`
3. Method: POST (multipart/form-data)
4. Include these fields:
   - `file`: The uploaded file
   - `upload_preset`: Your Cloudinary upload preset (or use signed uploads)
   - `folder`: "blog" (to organize images)

---

## Security Considerations

1. **Authentication:** Add authentication to all endpoints (except GET published posts for widget)
2. **File Validation:** Validate file types (only allow images: jpg, png, gif, webp)
3. **File Size Limits:** Limit uploads to reasonable size (e.g., 5MB max)
4. **Rate Limiting:** Implement rate limiting on upload endpoint
5. **CORS:** Configure CORS to allow requests from your Netlify domain and Webflow domain

---

## Testing Checklist

After XANO AI implements the tables and endpoints, test:

- [ ] Upload image to Cloudinary via XANO
- [ ] Create draft blog post
- [ ] Update blog post
- [ ] Publish blog post
- [ ] Get all published posts
- [ ] Get single post by ID
- [ ] Delete post
- [ ] Verify images are accessible via Cloudinary URLs
- [ ] Test CORS from your Netlify and Webflow domains