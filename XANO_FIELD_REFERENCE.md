# Xano Asset Table Field Reference

## Quick Reference Guide

This document serves as a reference for developers working with the Xano asset table integration in the Social Engagement Hub.

---

## Asset Table Structure

The Xano backend uses an **"asset"** table to store blog posts. Here are the key fields:

| Field Name | Type | Required | Description | Used In |
|------------|------|----------|-------------|---------|
| `id` | Integer | Auto | Unique identifier | All operations |
| `title` | String | Yes | Blog post title | Create, Update, Read |
| `description` | String | Yes | Blog post content | Create, Update, Read |
| `submitted_by` | String | No | Author name | Create, Update, Read |
| `tags` | String | No | Comma-separated tags | Create, Update, Read |
| `is_featured` | Boolean | No | Featured status | Create, Update, Read |
| `original_creation_date` | Date | No | Creation date (YYYY-MM-DD) | Create only |
| `created_at` | Timestamp | Auto | System timestamp | Read only |

---

## Data Mapping: React ↔ Xano

### React Blog Post Object
```javascript
{
  id: number,
  title: string,
  content: string,        // Maps to 'description' in Xano
  author: string,         // Maps to 'submitted_by' in Xano
  tags: string,
  featured: boolean,      // Maps to 'is_featured' in Xano
  created_at: timestamp,
  status: string
}
```

### Xano Asset Object
```javascript
{
  id: number,
  title: string,
  description: string,    // Maps to 'content' in React
  submitted_by: string,   // Maps to 'author' in React
  tags: string,
  is_featured: boolean,   // Maps to 'featured' in React
  original_creation_date: string,
  created_at: timestamp
}
```

---

## API Endpoints

### Create Asset
- **Endpoint**: `POST /asset_create`
- **Required Fields**: `title`, `description`
- **Optional Fields**: `submitted_by`, `tags`, `is_featured`, `original_creation_date`

### Update Asset
- **Endpoint**: `PATCH /asset/{id}`
- **Required Fields**: At least one field to update
- **Updatable Fields**: `title`, `description`, `submitted_by`, `tags`, `is_featured`

### Get All Assets
- **Endpoint**: `GET /asset`
- **Returns**: Array of all assets

### Get Single Asset
- **Endpoint**: `GET /asset/{id}`
- **Returns**: Single asset object

### Delete Asset
- **Endpoint**: `DELETE /asset/{id}`
- **Returns**: Success confirmation

---

## Standard Data Payload

### For Creating Blog Posts
```javascript
const assetData = {
  title: postData.title || 'Untitled Blog Post',
  description: postData.content || '',
  submitted_by: postData.author || 'Blog Editor',
  tags: postData.tags || '',
  is_featured: postData.featured || false,
  original_creation_date: new Date().toISOString().split('T')[0]
};
```

### For Updating Blog Posts
```javascript
const assetData = {
  title: postData.title,
  description: postData.content,
  submitted_by: postData.author || 'Blog Editor',
  tags: postData.tags || '',
  is_featured: postData.featured || false
};
```

---

## Common Pitfalls to Avoid

### ❌ DON'T DO THIS
```javascript
// Inconsistent field names
const data = {
  title: post.title,
  content: post.content,  // Wrong! Should be 'description'
  author: post.author     // Wrong! Should be 'submitted_by'
};
```

### ✅ DO THIS
```javascript
// Correct field mapping
const data = {
  title: post.title,
  description: post.content,    // Correct
  submitted_by: post.author     // Correct
};
```

---

## Default Values

When creating or updating assets, use these defaults:

| Field | Default Value | Reason |
|-------|---------------|--------|
| `title` | `'Untitled Blog Post'` | Ensures every post has a title |
| `description` | `''` (empty string) | Allows empty content |
| `submitted_by` | `'Blog Editor'` | Default author when none provided |
| `tags` | `''` (empty string) | No tags by default |
| `is_featured` | `false` | Posts not featured by default |
| `original_creation_date` | Current date (YYYY-MM-DD) | Timestamp of creation |

---

## Environment Variables

Ensure these are set in your `.env` file:

```bash
REACT_APP_XANO_BASE_URL=https://your-xano-instance.xano.io/api:your-api-group
```

---

## Validation Rules

### Title
- **Min Length**: 1 character
- **Max Length**: 255 characters (recommended)
- **Required**: Yes

### Description
- **Min Length**: 0 characters (can be empty)
- **Max Length**: Unlimited (text field)
- **Required**: Yes (but can be empty string)

### Tags
- **Format**: Comma-separated string
- **Example**: `"technology, web development, react"`
- **Required**: No

### Is Featured
- **Type**: Boolean
- **Values**: `true` or `false`
- **Required**: No (defaults to `false`)

---

## Troubleshooting

### Issue: "Failed to create post"
**Check**:
1. Is `REACT_APP_XANO_BASE_URL` set correctly?
2. Are you sending all required fields (`title`, `description`)?
3. Is the data structure matching the expected format?

### Issue: "Some fields not saving"
**Check**:
1. Are you using the correct field names (`description` not `content`)?
2. Are you including all fields in the payload?
3. Compare your payload with the standard payload above

### Issue: "Update not working"
**Check**:
1. Are you using the correct endpoint (`/asset/{id}` not `/asset_create`)?
2. Are you using `PATCH` method (not `POST`)?
3. Is the asset ID valid?

---

## Code Examples

### Complete Create Example
```javascript
export const createBlogPost = async (postData) => {
  try {
    const assetData = {
      title: postData.title || 'Untitled Blog Post',
      description: postData.content || '',
      submitted_by: postData.author || 'Blog Editor',
      tags: postData.tags || '',
      is_featured: postData.featured || false,
      original_creation_date: new Date().toISOString().split('T')[0]
    };

    const response = await fetch(`${XANO_BASE_URL}/asset_create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData)
    });

    if (!response.ok) throw new Error('Failed to create post');
    
    return await response.json();
  } catch (error) {
    console.error('Create error:', error);
    throw error;
  }
};
```

### Complete Update Example
```javascript
export const updateBlogPost = async (postId, postData) => {
  try {
    const assetData = {
      title: postData.title,
      description: postData.content,
      submitted_by: postData.author || 'Blog Editor',
      tags: postData.tags || '',
      is_featured: postData.featured || false
    };

    const response = await fetch(`${XANO_BASE_URL}/asset/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData)
    });

    if (!response.ok) throw new Error('Failed to update post');
    
    return await response.json();
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
};
```

---

## Related Documentation

- [Xano Data Mapping Fix](./XANO_DATA_MAPPING_FIX.md)
- [Before/After Comparison](./BEFORE_AFTER_COMPARISON.md)
- [Xano Database Setup](./XANO_DATABASE_SETUP.md)

---

**Maintained by**: Development Team  
**Last Updated**: 2025-10-11  
**Version**: 1.0