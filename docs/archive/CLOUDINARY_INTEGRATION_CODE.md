# Cloudinary Integration Code for React App

## Environment Variables

Create a `.env` file in your project root (or add to Netlify environment variables):

```env
REACT_APP_XANO_BASE_URL=https://your-xano-instance.xano.io/api:1
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

**Note:** You can upload directly to Cloudinary from the React app OR route through XANO. I'll provide both options.

---

## Option 1: Direct Upload to Cloudinary (Recommended for Speed)

### Step 1: Install Dependencies

```bash
npm install axios
```

### Step 2: Create Cloudinary Upload Service

Create a new file: `src/services/cloudinaryService.js`

```javascript
// src/services/cloudinaryService.js

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Upload an image directly to Cloudinary
 * @param {File} file - The image file to upload
 * @param {Function} onProgress - Optional callback for upload progress
 * @returns {Promise<Object>} Cloudinary response with image URL
 */
export const uploadImageToCloudinary = async (file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'blog'); // Organize images in 'blog' folder

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Upload with progress tracking (using XMLHttpRequest)
 */
export const uploadImageWithProgress = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'blog');

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          success: true,
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format,
          bytes: data.bytes,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', CLOUDINARY_UPLOAD_URL);
    xhr.send(formData);
  });
};
```

---

## Option 2: Upload via XANO Backend

Create a new file: `src/services/xanoService.js`

```javascript
// src/services/xanoService.js

const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL;

/**
 * Upload image via XANO (which then uploads to Cloudinary)
 */
export const uploadImageViaXano = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${XANO_BASE_URL}/blog/upload-image`, {
      method: 'POST',
      body: formData,
      // Add authentication header if needed
      // headers: {
      //   'Authorization': `Bearer ${yourAuthToken}`
      // }
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('XANO upload error:', error);
    throw error;
  }
};

/**
 * Create a new blog post
 */
export const createBlogPost = async (postData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/blog/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication if needed
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create post: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Create post error:', error);
    throw error;
  }
};

/**
 * Update an existing blog post
 */
export const updateBlogPost = async (postId, postData) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/blog/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update post: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Update post error:', error);
    throw error;
  }
};

/**
 * Get all published blog posts
 */
export const getPublishedPosts = async (limit = 50, offset = 0) => {
  try {
    const response = await fetch(
      `${XANO_BASE_URL}/blog/posts?status=published&limit=${limit}&offset=${offset}&sort=published_at&order=desc`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch posts error:', error);
    throw error;
  }
};

/**
 * Get a single blog post by ID
 */
export const getBlogPost = async (postId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/blog/posts/${postId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch post error:', error);
    throw error;
  }
};

/**
 * Publish a blog post
 */
export const publishBlogPost = async (postId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/blog/posts/${postId}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to publish post: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Publish post error:', error);
    throw error;
  }
};

/**
 * Delete a blog post
 */
export const deleteBlogPost = async (postId) => {
  try {
    const response = await fetch(`${XANO_BASE_URL}/blog/posts/${postId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Delete post error:', error);
    throw error;
  }
};
```

---

## Updated Image Upload Handler for App.js

Replace the current `handleFileUpload` function in your blog editor with this:

```javascript
// Import at the top of App.js
import { uploadImageToCloudinary } from './services/cloudinaryService';
// OR if using XANO route:
// import { uploadImageViaXano } from './services/xanoService';

// Inside your blog editor component:
const [uploadProgress, setUploadProgress] = useState(0);

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert('Please upload a valid image file (JPG, PNG, GIF, or WEBP)');
    return;
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    alert('Image size must be less than 5MB');
    return;
  }

  console.log('Starting file upload:', file.name);
  setIsUploading(true);
  setUploadProgress(0);

  try {
    // Option 1: Upload directly to Cloudinary
    const result = await uploadImageToCloudinary(file, (progress) => {
      setUploadProgress(progress);
    });

    // Option 2: Upload via XANO
    // const result = await uploadImageViaXano(file);

    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    console.log('Upload successful:', result);

    // Create image object with Cloudinary URL
    const newImage = {
      id: Date.now(),
      src: result.url, // Permanent Cloudinary URL
      alt: file.name,
      size: 'medium',
      position: 'center',
      width: result.width,
      height: result.height,
    };

    console.log('Created image object:', newImage);
    insertImageIntoContent(newImage);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Show success message
    console.log('Image uploaded successfully to Cloudinary!');
  } catch (error) {
    console.error('Upload error:', error);
    alert(`Upload failed: ${error.message}`);
  } finally {
    setIsUploading(false);
    setUploadProgress(0);
  }
};
```

---

## Optional: Upload Progress Indicator

Add this to your JSX to show upload progress:

```javascript
{isUploading && uploadProgress > 0 && (
  <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50">
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">Uploading image...</p>
        <div className="mt-2 w-48 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}%</p>
      </div>
    </div>
  </div>
)}
```

---

## Saving Posts to XANO

Update your save/publish functions to use XANO:

```javascript
import { createBlogPost, updateBlogPost, publishBlogPost } from './services/xanoService';

const handleSavePost = async () => {
  try {
    const postData = {
      title: title,
      content: content,
      author: 'Current User', // Replace with actual user
      author_avatar: 'https://...', // Replace with actual avatar
      category: selectedCategory,
      tags: tags.join(','),
      image_url: featuredImageUrl, // If you have a featured image
      status: 'draft',
    };

    if (editingPost) {
      // Update existing post
      const result = await updateBlogPost(editingPost.id, postData);
      console.log('Post updated:', result);
    } else {
      // Create new post
      const result = await createBlogPost(postData);
      console.log('Post created:', result);
    }

    alert('Post saved successfully!');
  } catch (error) {
    console.error('Save error:', error);
    alert('Failed to save post');
  }
};

const handlePublishPost = async () => {
  try {
    if (editingPost) {
      // Publish existing post
      const result = await publishBlogPost(editingPost.id);
      console.log('Post published:', result);
    } else {
      // Create and publish new post
      const postData = {
        title: title,
        content: content,
        author: 'Current User',
        status: 'published',
        published_at: new Date().toISOString(),
      };
      const result = await createBlogPost(postData);
      console.log('Post created and published:', result);
    }

    alert('Post published successfully!');
  } catch (error) {
    console.error('Publish error:', error);
    alert('Failed to publish post');
  }
};
```

---

## Loading Posts from XANO in Widget

Update your widget to fetch from XANO instead of localStorage:

```javascript
import { getPublishedPosts } from './services/xanoService';

// In your widget component:
useEffect(() => {
  const loadPosts = async () => {
    try {
      const result = await getPublishedPosts(20, 0); // Get 20 most recent posts
      if (result.success && result.posts) {
        setPosts(result.posts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  loadPosts();

  // Poll for updates every 5 seconds
  const interval = setInterval(loadPosts, 5000);

  return () => clearInterval(interval);
}, []);
```

---

## Summary

**Recommended Approach:**
1. Upload images directly to Cloudinary from React (faster, less server load)
2. Store blog post data (including Cloudinary URLs) in XANO
3. Widget fetches published posts from XANO API
4. All images are permanently stored and accessible via Cloudinary CDN

**Benefits:**
- ✅ Images persist across sessions
- ✅ Images work in widget on external sites
- ✅ Fast CDN delivery
- ✅ No localStorage limitations
- ✅ Scalable solution
- ✅ Images accessible from anywhere