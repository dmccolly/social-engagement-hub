

# Rich Blog Editor

A production-ready rich-text editor built with React and TipTap, featuring Cloudinary integration for media uploads and comprehensive formatting options.

## Features

- **Rich Text Formatting**: Headings (H2/H3), bold, italic, underline, custom text colors
- **Smart Links**: Add/update/remove hyperlinks with SEO-friendly attributes (nofollow, noopener)
- **YouTube Embeds**: Paste YouTube URLs to embed responsive video players
- **Media Uploads**: Upload images, audio, and video to Cloudinary with unsigned uploads
- **Export Options**: Copy HTML to clipboard or save to backend API
- **Production Ready**: Error handling, validation, responsive design

## Quick Start

### 1. Installation

```bash
# Clone or download the project
cd rich-blog-editor

# Install dependencies
npm install
# or
pnpm install
```

### 2. Environment Setup

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset_name
REACT_APP_XANO_API_URL=https://your-api-url.com/api
```

### 3. Cloudinary Configuration

**Required for file uploads to work:**

1. **Create Upload Preset**:
   - Go to Cloudinary Console → Settings → Upload → Upload presets
   - Create or select a preset with these settings:
     - **Signing mode**: Unsigned
     - **Preset name**: Match your `REACT_APP_CLOUDINARY_UPLOAD_PRESET`
     - **Allowed formats**: jpg,png,webp,mp3,wav,m4a,mp4,mov
     - **Default folder**: social-hub (optional)

2. **Configure Security**:
   - Go to Settings → Security
   - Add your domains to "Allowed unsigned upload domains":
     - `localhost:3000` (for development)
     - `*.netlify.app` (for Netlify deployment)
     - Your custom domain

### 4. Run Development Server

```bash
npm run dev
# or
pnpm run dev
```

Visit `http://localhost:3000` to see the editor in action.

## Integration

### Basic Usage

```jsx
import RichBlogEditor from './components/RichBlogEditor';

function MyBlogPage() {
  const handleSave = async (html) => {
    // Save to your backend
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: html })
    });
  };

  return (
    <RichBlogEditor
      initialHTML="<p>Start writing...</p>"
      folder="my-blog"
      onSave={handleSave}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialHTML` | string | `"<p>Start writing…</p>"` | Initial content for the editor |
| `folder` | string | `"social-hub"` | Cloudinary folder for uploads |
| `onSave` | function | undefined | Custom save handler `(html) => void` |

### Custom Save Handler

If you don't provide an `onSave` prop, the editor will attempt to POST to `${REACT_APP_XANO_API_URL}/posts`. Provide a custom handler for your specific backend:

```jsx
const customSave = async (html) => {
  try {
    const response = await fetch('/api/blog-posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'My Blog Post',
        content: html,
        status: 'draft'
      })
    });
    
    if (!response.ok) throw new Error('Save failed');
    console.log('Post saved successfully');
  } catch (error) {
    console.error('Save error:', error);
    throw error; // Re-throw to show error in UI
  }
};
```

## Deployment

### Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag the `dist` folder to Netlify
   - Or connect your Git repository

3. **Set environment variables** in Netlify:
   - Go to Site settings → Environment variables
   - Add your `REACT_APP_*` variables

4. **Update Cloudinary settings**:
   - Add your Netlify domain to allowed upload domains
   - Example: `mysite.netlify.app`

### Other Platforms

The editor works with any static hosting platform:
- **Vercel**: Set environment variables in project settings
- **GitHub Pages**: Use GitHub Secrets for environment variables
- **AWS S3**: Configure CloudFront for SPA routing

## Testing

### Manual Smoke Test

Execute these tests in order to verify functionality:

1. **Page loads**: Toolbar visible, editor ready
2. **Typography**: Apply H2, H3, Bold, Italic, Underline
3. **Colors**: Set text color, then clear color
4. **Links**: Select text → Add link → Test in preview → Remove link
5. **YouTube**: Paste `https://youtu.be/VIDEO_ID` → Embed → Verify responsive player
6. **Image Upload**: Upload image → Verify insertion with caption
7. **Audio Upload**: Upload MP3/WAV → Verify `<audio controls>` plays
8. **Video Upload**: Upload MP4 → Verify `<video controls>` plays
9. **Export**: Click "Export HTML" → Verify clipboard copy
10. **Save**: Click "Save" → Verify success (custom handler or API call)

### Expected HTML Output

The editor generates clean, semantic HTML:

```html
<h2>My Heading</h2>
<p>This is <strong>bold</strong> and <em>italic</em> text with a 
<a href="https://example.com" target="_blank" rel="nofollow noopener">link</a>.</p>

<figure>
  <img src="https://res.cloudinary.com/..." alt="">
  <figcaption>Image caption</figcaption>
</figure>

<iframe src="https://www.youtube.com/embed/VIDEO_ID" 
        allowfullscreen loading="lazy" 
        style="width:100%;aspect-ratio:16/9;border:0"></iframe>
```

## Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| "Unknown API key" error | Sending API key in unsigned flow | Remove `api_key` from requests, use unsigned preset |
| "Unsigned upload not allowed" | Wrong preset configuration | Set preset to "Unsigned" mode |
| CORS errors | Domain not whitelisted | Add domain to Cloudinary security settings |
| Upload fails silently | Missing environment variables | Check `REACT_APP_CLOUDINARY_*` variables |
| Styles look broken | CSS conflicts | Component uses scoped styles, check for global CSS overrides |

### Debug Mode

Enable debug logging by adding to your component:

```jsx
const editor = useEditor({
  // ... existing config
  onUpdate: ({ editor }) => {
    console.log('Editor content:', editor.getHTML());
  }
});
```

### Network Issues

Check browser Network tab for failed requests:
- **400 errors**: Usually missing/invalid upload preset
- **401 errors**: Domain not allowed or wrong configuration
- **CORS errors**: Security settings in Cloudinary

## Architecture

### Component Structure

```
RichBlogEditor/
├── Toolbar (sticky, responsive grid)
│   ├── Typography controls (H2, H3, Bold, Italic, Underline)
│   ├── Color picker and clear
│   ├── Link management
│   ├── YouTube embed
│   ├── File upload with caption
│   └── Export/Save actions
├── Editor (TipTap with extensions)
└── Status display
```

### Key Dependencies

- **@tiptap/react**: Core editor framework
- **@tiptap/starter-kit**: Basic editing functionality
- **@tiptap/extension-link**: Link management
- **@tiptap/extension-color**: Text color support
- **@tiptap/extension-text-style**: Text styling
- **@tiptap/extension-heading**: Heading levels

### Security Features

- **Unsigned uploads**: No API keys exposed to client
- **Domain restrictions**: Cloudinary domain whitelist
- **Link attributes**: Automatic `rel="nofollow noopener"`
- **Input validation**: File type and URL validation
- **Error boundaries**: Graceful error handling

## Customization

### Styling

The component uses scoped CSS to prevent conflicts. Customize by modifying the `<style>` block in `RichBlogEditor.jsx`:

```jsx
<style>
  {`
    .rbe-toolbar {
      background: #your-color;
      border: 1px solid #your-border;
    }
    .rbe-editor {
      background: #your-editor-bg;
    }
  `}
</style>
```

### Adding Extensions

Extend functionality with additional TipTap extensions:

```jsx
import { Underline } from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';

const editor = useEditor({
  extensions: [
    StarterKit,
    // ... existing extensions
    Underline,
    Table.configure({
      resizable: true,
    }),
  ],
});
```

### Custom Upload Handler

Replace Cloudinary with your own upload service:

```jsx
async function customUpload(file, folder) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json(); // Should return { secure_url: '...' }
}
```

## License

MIT License - feel free to use in your projects.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify Cloudinary configuration
4. Test with minimal example

---

**Built with ❤️ using TipTap, React, and modern web technologies.**




# Integration Examples

This document provides practical examples for integrating the Rich Blog Editor into different types of applications and workflows.

## Table of Contents

1. [Basic Blog Application](#basic-blog-application)
2. [CMS Integration](#cms-integration)
3. [Multi-tenant SaaS](#multi-tenant-saas)
4. [E-commerce Product Descriptions](#e-commerce-product-descriptions)
5. [Documentation Platform](#documentation-platform)
6. [Social Media Platform](#social-media-platform)
7. [Email Newsletter Builder](#email-newsletter-builder)

## Basic Blog Application

### Simple Blog Post Editor

```jsx
import React, { useState, useEffect } from 'react';
import RichBlogEditor from './components/RichBlogEditor';

function BlogPostEditor({ postId }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (postId) {
      loadPost(postId);
    }
  }, [postId]);

  const loadPost = async (id) => {
    const response = await fetch(`/api/posts/${id}`);
    const data = await response.json();
    setPost(data);
  };

  const handleSave = async (html) => {
    setLoading(true);
    try {
      const method = postId ? 'PUT' : 'POST';
      const url = postId ? `/api/posts/${postId}` : '/api/posts';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post?.title || 'Untitled',
          content: html,
          status: 'draft'
        })
      });

      if (!response.ok) throw new Error('Save failed');
      
      const savedPost = await response.json();
      setPost(savedPost);
      
      // Show success message
      alert('Post saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Post title..."
          value={post?.title || ''}
          onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
          className="w-full text-2xl font-bold border-none outline-none"
        />
      </div>
      
      <RichBlogEditor
        initialHTML={post?.content || '<p>Start writing your blog post...</p>'}
        folder="blog-posts"
        onSave={handleSave}
      />
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">Saving...</div>
        </div>
      )}
    </div>
  );
}
```

## CMS Integration

### WordPress-style Admin Interface

```jsx
import React, { useState } from 'react';
import RichBlogEditor from './components/RichBlogEditor';

function CMSEditor({ contentType = 'post' }) {
  const [metadata, setMetadata] = useState({
    title: '',
    slug: '',
    excerpt: '',
    tags: [],
    category: '',
    status: 'draft',
    publishDate: new Date().toISOString().split('T')[0]
  });

  const handleSave = async (html) => {
    const payload = {
      ...metadata,
      content: html,
      contentType
    };

    const response = await fetch('/api/cms/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to save content');
    
    const result = await response.json();
    
    // Update URL with new content ID
    if (result.id && !window.location.pathname.includes(result.id)) {
      window.history.pushState({}, '', `/cms/edit/${result.id}`);
    }
  };

  const handlePublish = async (html) => {
    await handleSave(html);
    setMetadata(prev => ({ ...prev, status: 'published' }));
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 p-6 border-r">
        <h3 className="font-semibold mb-4">Content Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              type="text"
              value={metadata.slug}
              onChange={(e) => setMetadata(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={metadata.category}
              onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select category</option>
              <option value="news">News</option>
              <option value="tutorials">Tutorials</option>
              <option value="reviews">Reviews</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={metadata.status}
              onChange={(e) => setMetadata(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="pt-4 border-t">
            <button
              onClick={() => handleSave()}
              className="w-full bg-gray-600 text-white py-2 rounded mb-2"
            >
              Save Draft
            </button>
            <button
              onClick={() => handlePublish()}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1">
        <RichBlogEditor
          initialHTML="<p>Start creating your content...</p>"
          folder={`cms-${contentType}`}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
```

## Multi-tenant SaaS

### Tenant-specific Configuration

```jsx
import React, { useContext } from 'react';
import RichBlogEditor from './components/RichBlogEditor';
import { TenantContext } from './contexts/TenantContext';

function SaaSBlogEditor({ documentId }) {
  const { tenant, user } = useContext(TenantContext);

  const handleSave = async (html) => {
    const response = await fetch(`/api/tenants/${tenant.id}/documents`, {
      method: documentId ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
        'X-Tenant-ID': tenant.id
      },
      body: JSON.stringify({
        id: documentId,
        content: html,
        userId: user.id,
        workspace: tenant.workspace
      })
    });

    if (!response.ok) throw new Error('Save failed');
    return response.json();
  };

  // Tenant-specific folder structure
  const cloudinaryFolder = `tenants/${tenant.id}/documents`;

  return (
    <div className="h-full">
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{tenant.name} - Document Editor</h1>
          <p className="text-sm text-gray-600">Workspace: {tenant.workspace}</p>
        </div>
        <div className="text-sm text-gray-500">
          User: {user.name} | Plan: {tenant.plan}
        </div>
      </div>
      
      <RichBlogEditor
        initialHTML="<p>Start writing...</p>"
        folder={cloudinaryFolder}
        onSave={handleSave}
      />
    </div>
  );
}
```

## E-commerce Product Descriptions

### Product Description Editor

```jsx
import React, { useState } from 'react';
import RichBlogEditor from './components/RichBlogEditor';

function ProductDescriptionEditor({ productId }) {
  const [product, setProduct] = useState({
    name: '',
    shortDescription: '',
    price: '',
    sku: '',
    category: ''
  });

  const handleSave = async (html) => {
    const productData = {
      ...product,
      longDescription: html,
      updatedAt: new Date().toISOString()
    };

    const response = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    if (!response.ok) throw new Error('Failed to update product');
    
    // Trigger product cache refresh
    await fetch(`/api/products/${productId}/refresh-cache`, { method: 'POST' });
  };

  const productDescriptionTemplate = `
    <h2>Product Overview</h2>
    <p>Describe your product's key features and benefits here.</p>
    
    <h3>Key Features</h3>
    <ul>
      <li>Feature 1</li>
      <li>Feature 2</li>
      <li>Feature 3</li>
    </ul>
    
    <h3>Specifications</h3>
    <p>Add technical specifications, dimensions, materials, etc.</p>
    
    <h3>Care Instructions</h3>
    <p>How to maintain and care for this product.</p>
  `;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Product Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  value={product.sku}
                  onChange={(e) => setProduct(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => setProduct(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Short Description</label>
                <textarea
                  value={product.shortDescription}
                  onChange={(e) => setProduct(prev => ({ ...prev, shortDescription: e.target.value }))}
                  className="w-full border rounded px-3 py-2 h-20"
                  placeholder="Brief product summary for listings..."
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Description Editor */}
        <div className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Detailed Product Description</h3>
          <RichBlogEditor
            initialHTML={productDescriptionTemplate}
            folder={`products/${productId}`}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
```

## Documentation Platform

### Technical Documentation Editor

```jsx
import React, { useState } from 'react';
import RichBlogEditor from './components/RichBlogEditor';

function DocumentationEditor({ docPath }) {
  const [docMetadata, setDocMetadata] = useState({
    title: '',
    section: '',
    tags: [],
    lastModified: null,
    version: '1.0'
  });

  const handleSave = async (html) => {
    // Convert HTML to markdown for storage (optional)
    const markdown = await convertHtmlToMarkdown(html);
    
    const docData = {
      ...docMetadata,
      content: html,
      markdown: markdown,
      path: docPath,
      lastModified: new Date().toISOString()
    };

    const response = await fetch('/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData)
    });

    if (!response.ok) throw new Error('Failed to save documentation');
    
    // Trigger documentation site rebuild
    await fetch('/api/docs/rebuild', { method: 'POST' });
  };

  const documentationTemplate = `
    <h2>API Reference</h2>
    <p>Brief description of this API endpoint or feature.</p>
    
    <h3>Parameters</h3>
    <table>
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Type</th>
          <th>Required</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>id</td>
          <td>string</td>
          <td>Yes</td>
          <td>Unique identifier</td>
        </tr>
      </tbody>
    </table>
    
    <h3>Example Request</h3>
    <pre><code>curl -X GET "https://api.example.com/endpoint" \\
  -H "Authorization: Bearer YOUR_TOKEN"</code></pre>
    
    <h3>Example Response</h3>
    <pre><code>{
  "status": "success",
  "data": {
    "id": "123",
    "name": "Example"
  }
}</code></pre>
  `;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r p-4">
        <h3 className="font-semibold mb-4">Document Settings</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Section</label>
            <select
              value={docMetadata.section}
              onChange={(e) => setDocMetadata(prev => ({ ...prev, section: e.target.value }))}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">Select section</option>
              <option value="api">API Reference</option>
              <option value="guides">Guides</option>
              <option value="tutorials">Tutorials</option>
              <option value="changelog">Changelog</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Version</label>
            <input
              type="text"
              value={docMetadata.version}
              onChange={(e) => setDocMetadata(prev => ({ ...prev, version: e.target.value }))}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1">
        <RichBlogEditor
          initialHTML={documentationTemplate}
          folder="documentation"
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

async function convertHtmlToMarkdown(html) {
  // Implementation depends on your needs
  // You might use a library like turndown.js
  return html; // Placeholder
}
```

## Social Media Platform

### Social Post Composer

```jsx
import React, { useState } from 'react';
import RichBlogEditor from './components/RichBlogEditor';

function SocialPostComposer({ userId }) {
  const [postSettings, setPostSettings] = useState({
    visibility: 'public',
    allowComments: true,
    scheduledFor: null,
    tags: []
  });

  const handleSave = async (html) => {
    const postData = {
      content: html,
      authorId: userId,
      ...postSettings,
      createdAt: new Date().toISOString()
    };

    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) throw new Error('Failed to create post');
    
    const post = await response.json();
    
    // Redirect to post view
    window.location.href = `/posts/${post.id}`;
  };

  const socialPostTemplate = `
    <p>What's on your mind? Share your thoughts with the community!</p>
  `;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Create Post</h2>
        </div>
        
        <div className="p-4">
          <RichBlogEditor
            initialHTML={socialPostTemplate}
            folder={`users/${userId}/posts`}
            onSave={handleSave}
          />
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={postSettings.visibility}
                onChange={(e) => setPostSettings(prev => ({ ...prev, visibility: e.target.value }))}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
              
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={postSettings.allowComments}
                  onChange={(e) => setPostSettings(prev => ({ ...prev, allowComments: e.target.checked }))}
                  className="mr-2"
                />
                Allow comments
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Email Newsletter Builder

### Newsletter Template Editor

```jsx
import React, { useState } from 'react';
import RichBlogEditor from './components/RichBlogEditor';

function NewsletterEditor({ templateId }) {
  const [newsletter, setNewsletter] = useState({
    subject: '',
    preheader: '',
    senderName: '',
    senderEmail: '',
    segments: []
  });

  const handleSave = async (html) => {
    // Convert to email-friendly HTML
    const emailHtml = await convertToEmailHtml(html);
    
    const newsletterData = {
      ...newsletter,
      content: html,
      emailHtml: emailHtml,
      templateId: templateId
    };

    const response = await fetch('/api/newsletters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newsletterData)
    });

    if (!response.ok) throw new Error('Failed to save newsletter');
    return response.json();
  };

  const handleSendTest = async (html) => {
    const emailHtml = await convertToEmailHtml(html);
    
    await fetch('/api/newsletters/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: newsletter.subject,
        content: emailHtml,
        testEmail: 'test@example.com'
      })
    });
    
    alert('Test email sent!');
  };

  const newsletterTemplate = `
    <h2>Welcome to Our Newsletter!</h2>
    <p>Thank you for subscribing. Here's what's new this week:</p>
    
    <h3>📰 Latest News</h3>
    <p>Brief summary of your latest news or updates...</p>
    
    <h3>🎯 Featured Content</h3>
    <p>Highlight your best content, products, or services...</p>
    
    <h3>📅 Upcoming Events</h3>
    <p>Let subscribers know about upcoming events or deadlines...</p>
    
    <hr>
    <p><small>You received this email because you subscribed to our newsletter. 
    <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
    <a href="{{preferences_url}}">Update preferences</a></small></p>
  `;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg border mb-6 p-6">
        <h2 className="font-semibold mb-4">Newsletter Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject Line</label>
            <input
              type="text"
              value={newsletter.subject}
              onChange={(e) => setNewsletter(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              placeholder="Your newsletter subject..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Preheader Text</label>
            <input
              type="text"
              value={newsletter.preheader}
              onChange={(e) => setNewsletter(prev => ({ ...prev, preheader: e.target.value }))}
              className="w-full border rounded px-3 py-2"
              placeholder="Preview text..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Sender Name</label>
            <input
              type="text"
              value={newsletter.senderName}
              onChange={(e) => setNewsletter(prev => ({ ...prev, senderName: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Sender Email</label>
            <input
              type="email"
              value={newsletter.senderEmail}
              onChange={(e) => setNewsletter(prev => ({ ...prev, senderEmail: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => handleSendTest()}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Send Test Email
          </button>
        </div>
      </div>
      
      <RichBlogEditor
        initialHTML={newsletterTemplate}
        folder="newsletters"
        onSave={handleSave}
      />
    </div>
  );
}

async function convertToEmailHtml(html) {
  // Convert modern HTML to email-compatible HTML
  // This would include:
  // - Inline CSS
  // - Table-based layouts
  // - Email client compatibility fixes
  return html; // Placeholder - implement based on your email service
}
```

## Advanced Configuration

### Custom TipTap Extensions

```jsx
import { Node } from '@tiptap/core';

// Custom callout extension
const Callout = Node.create({
  name: 'callout',
  
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  
  content: 'block+',
  
  group: 'block',
  
  defining: true,
  
  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-type'),
        renderHTML: attributes => {
          if (!attributes.type) return {};
          return { 'data-type': attributes.type };
        },
      },
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-callout': '', ...HTMLAttributes }, 0];
  },
  
  addCommands() {
    return {
      setCallout: (attributes) => ({ commands }) => {
        return commands.wrapIn(this.name, attributes);
      },
    };
  },
});

// Use in your editor
const editor = useEditor({
  extensions: [
    StarterKit,
    Callout,
    // ... other extensions
  ],
});
```

### Environment-specific Configuration

```jsx
// config/editor.js
const getEditorConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    cloudinary: {
      cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
      folder: isDevelopment ? 'dev-uploads' : 'prod-uploads'
    },
    api: {
      baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
      timeout: 10000
    },
    features: {
      enableYouTube: process.env.REACT_APP_ENABLE_YOUTUBE !== 'false',
      enableUploads: !!process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
      maxFileSize: parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 10485760 // 10MB
    }
  };
};

export default getEditorConfig;
```

These examples demonstrate how to integrate the Rich Blog Editor into various types of applications, from simple blogs to complex multi-tenant platforms. Each example includes proper error handling, user feedback, and integration with backend APIs.

