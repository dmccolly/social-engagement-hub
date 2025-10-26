# XANO EmailMarketing API Group - Newsfeed Endpoints Implementation

This document provides complete implementation specifications for the newsfeed endpoints within the EmailMarketing API group in Xano.

## Overview

The newsfeed endpoints enable community engagement features including posts, replies, likes, and analytics. These endpoints are part of the EmailMarketing API group and provide visitor interaction capabilities with proper validation, security, and analytics.

## Database Tables Required

Before implementing these endpoints, ensure the following tables exist in your Xano database:

### newsfeed_posts Table
```sql
CREATE TABLE newsfeed_posts (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255),
    author_id INTEGER,
    content TEXT NOT NULL,
    parent_id INTEGER NULL,
    post_type VARCHAR(50) DEFAULT 'post',
    status VARCHAR(50) DEFAULT 'published',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES newsfeed_posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_parent ON newsfeed_posts(parent_id);
CREATE INDEX idx_posts_status ON newsfeed_posts(status);
CREATE INDEX idx_posts_created ON newsfeed_posts(created_at);
CREATE INDEX idx_posts_author_email ON newsfeed_posts(author_email);
CREATE INDEX idx_posts_author_id ON newsfeed_posts(author_id);
```

### newsfeed_likes Table
```sql
CREATE TABLE newsfeed_likes (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    post_id INTEGER NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_id INTEGER,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES newsfeed_posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (post_id, author_email)
);

CREATE INDEX idx_likes_post ON newsfeed_likes(post_id);
CREATE INDEX idx_likes_author_email ON newsfeed_likes(author_email);
```

---

## API Endpoints

### 1. GET /newsfeed_posts

**Purpose**: Return a list of published posts with optional filters (type, author_id, author_email, search, limit, offset, visitor_email).

**Logic**: Filter newsfeed_posts by status, apply any query params (e.g. type='posts_only' returns only top-level posts), sort by created_at descending, and paginate. For each post, count likes and replies and set visitor_liked if visitor_email is provided.

**Query Parameters**:
- `type` (string, optional): Filter by type. Use 'posts_only' to return only top-level posts (parent_id is null)
- `author_id` (integer, optional): Filter posts by author_id
- `author_email` (string, optional): Filter posts by author_email
- `search` (string, optional): Search in content and author_name
- `limit` (integer, optional): Number of posts to return (default: 20, max: 100)
- `offset` (integer, optional): Pagination offset (default: 0)
- `visitor_email` (string, optional): Email of current visitor to check if they liked posts

**Response**:
```json
{
  "success": true,
  "posts": [
    {
      "id": 1,
      "author_name": "John Doe",
      "author_email": "john@example.com",
      "author_id": 123,
      "content": "This is a post",
      "parent_id": null,
      "post_type": "post",
      "status": "published",
      "likes_count": 5,
      "comments_count": 3,
      "visitor_liked": true,
      "created_at": "2025-10-26T12:00:00Z",
      "updated_at": "2025-10-26T12:00:00Z"
    }
  ],
  "total": 50,
  "pagination": {
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

**Xano Implementation**:
```javascript
// GET /newsfeed_posts
function getNewsfeedPosts(inputs) {
    // Start with published posts only
    let query = this.query.newsfeed_posts.filter(item => item.status == 'published');
    
    // Filter by type (posts_only = top-level posts without parent)
    if (inputs.type === 'posts_only') {
        query = query.filter(item => item.parent_id == null);
    }
    
    // Filter by author_id
    if (inputs.author_id) {
        query = query.filter(item => item.author_id == inputs.author_id);
    }
    
    // Filter by author_email
    if (inputs.author_email) {
        query = query.filter(item => item.author_email == inputs.author_email);
    }
    
    // Search functionality
    if (inputs.search) {
        const searchTerm = inputs.search.toLowerCase();
        query = query.filter(item => 
            item.content.toLowerCase().includes(searchTerm) ||
            item.author_name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Get total count before pagination
    const total = query.count();
    
    // Apply pagination
    const limit = Math.min(inputs.limit || 20, 100);
    const offset = inputs.offset || 0;
    
    // Get posts sorted by created_at descending
    const posts = query
        .sort((a, b) => b.created_at - a.created_at)
        .limit(limit)
        .offset(offset)
        .all();
    
    // For each post, count likes and replies, and check if visitor liked it
    const postsWithMetadata = posts.map(post => {
        // Count likes for this post
        const likesCount = this.query.newsfeed_likes
            .filter(item => item.post_id == post.id)
            .count();
        
        // Count replies (comments) for this post
        const commentsCount = this.query.newsfeed_posts
            .filter(item => item.parent_id == post.id && item.status == 'published')
            .count();
        
        // Check if current visitor liked this post
        let visitorLiked = false;
        if (inputs.visitor_email) {
            visitorLiked = this.query.newsfeed_likes
                .filter(item => item.post_id == post.id && item.author_email == inputs.visitor_email)
                .count() > 0;
        }
        
        return {
            ...post,
            likes_count: likesCount,
            comments_count: commentsCount,
            visitor_liked: visitorLiked
        };
    });
    
    return {
        success: true,
        posts: postsWithMetadata,
        total: total,
        pagination: {
            limit: limit,
            offset: offset,
            has_more: (offset + limit) < total
        }
    };
}
```

---

### 2. POST /newsfeed_posts

**Purpose**: Create a new post or reply.

**Required fields**: author_name, content

**Optional fields**: author_email, author_id, parent_id, session_id, ip_address, user_agent

**Logic**: Validate required fields and email format; if parent_id is present, verify the parent exists and set post_type='reply', otherwise post_type='post'. Insert the record into newsfeed_posts, and if it's a reply, increment the parent's comments_count.

**Request Body**:
```json
{
  "author_name": "John Doe",
  "content": "This is my post content",
  "author_email": "john@example.com",
  "author_id": 123,
  "parent_id": null,
  "session_id": "abc123",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Response**:
```json
{
  "success": true,
  "post": {
    "id": 1,
    "author_name": "John Doe",
    "author_email": "john@example.com",
    "author_id": 123,
    "content": "This is my post content",
    "parent_id": null,
    "post_type": "post",
    "status": "published",
    "likes_count": 0,
    "comments_count": 0,
    "created_at": "2025-10-26T12:00:00Z"
  },
  "message": "Post created successfully"
}
```

**Xano Implementation**:
```javascript
// POST /newsfeed_posts
function createNewsfeedPost(inputs) {
    // Validate required fields
    if (!inputs.author_name || inputs.author_name.trim() === '') {
        return this.response.status(400).json({ 
            success: false, 
            error: 'Author name is required' 
        });
    }
    
    if (!inputs.content || inputs.content.trim() === '') {
        return this.response.status(400).json({ 
            success: false, 
            error: 'Content is required' 
        });
    }
    
    // Validate email format if provided
    if (inputs.author_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputs.author_email)) {
            return this.response.status(400).json({ 
                success: false, 
                error: 'Invalid email format' 
        });
        }
    }
    
    // If parent_id is present, verify the parent exists
    let postType = 'post';
    if (inputs.parent_id) {
        const parentPost = this.query.newsfeed_posts
            .filter(item => item.id == inputs.parent_id)
            .first();
        
        if (!parentPost) {
            return this.response.status(404).json({ 
                success: false, 
                error: 'Parent post not found' 
            });
        }
        
        postType = 'reply';
    }
    
    // Create the post
    const post = this.addRecord('newsfeed_posts', {
        author_name: inputs.author_name.trim(),
        author_email: inputs.author_email ? inputs.author_email.trim() : null,
        author_id: inputs.author_id || null,
        content: inputs.content.trim(),
        parent_id: inputs.parent_id || null,
        post_type: postType,
        status: 'published',
        likes_count: 0,
        comments_count: 0,
        session_id: inputs.session_id || null,
        ip_address: inputs.ip_address || null,
        user_agent: inputs.user_agent || null
    });
    
    // If it's a reply, increment the parent's comments_count
    if (inputs.parent_id) {
        const parent = this.query.newsfeed_posts
            .filter(item => item.id == inputs.parent_id)
            .first();
        
        if (parent) {
            this.updateRecord('newsfeed_posts', inputs.parent_id, {
                comments_count: parent.comments_count + 1
            });
        }
    }
    
    return {
        success: true,
        post: post,
        message: postType === 'reply' ? 'Reply posted successfully' : 'Post created successfully'
    };
}
```

---

### 3. POST /newsfeed_posts/{id}/like

**Purpose**: Toggle a like on a post.

**Required fields**: author_email

**Optional fields**: author_id, ip_address, user_agent

**Logic**: Check if a like already exists for (post_id, author_email). If yes, delete it and decrement the post's likes_count; if no, insert a like record and increment likes_count.

**URL Parameters**:
- `id` (integer, required): The post ID to like/unlike

**Request Body**:
```json
{
  "author_email": "john@example.com",
  "author_id": 123,
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Response (Like)**:
```json
{
  "success": true,
  "liked": true,
  "likes_count": 6
}
```

**Response (Unlike)**:
```json
{
  "success": true,
  "liked": false,
  "likes_count": 5
}
```

**Xano Implementation**:
```javascript
// POST /newsfeed_posts/{id}/like
function likeNewsfeedPost(inputs) {
    // Validate required fields
    if (!inputs.author_email || inputs.author_email.trim() === '') {
        return this.response.status(400).json({ 
            success: false, 
            error: 'Author email is required' 
        });
    }
    
    // Check if post exists
    const post = this.query.newsfeed_posts
        .filter(item => item.id == inputs.id)
        .first();
    
    if (!post) {
        return this.response.status(404).json({ 
            success: false, 
            error: 'Post not found' 
        });
    }
    
    // Check if like already exists for (post_id, author_email)
    const existingLike = this.query.newsfeed_likes
        .filter(item => item.post_id == inputs.id && item.author_email == inputs.author_email)
        .first();
    
    if (existingLike) {
        // Unlike: delete the like record
        this.deleteRecord('newsfeed_likes', existingLike.id);
        
        // Decrement the post's likes_count
        const newLikesCount = Math.max(0, post.likes_count - 1);
        this.updateRecord('newsfeed_posts', inputs.id, {
            likes_count: newLikesCount
        });
        
        return {
            success: true,
            liked: false,
            likes_count: newLikesCount
        };
    } else {
        // Like: insert a like record
        this.addRecord('newsfeed_likes', {
            post_id: inputs.id,
            author_email: inputs.author_email.trim(),
            author_id: inputs.author_id || null,
            ip_address: inputs.ip_address || null,
            user_agent: inputs.user_agent || null
        });
        
        // Increment the post's likes_count
        const newLikesCount = post.likes_count + 1;
        this.updateRecord('newsfeed_posts', inputs.id, {
            likes_count: newLikesCount
        });
        
        return {
            success: true,
            liked: true,
            likes_count: newLikesCount
        };
    }
}
```

---

### 4. GET /newsfeed_posts/{id}/replies

**Purpose**: Return all replies for a post.

**Logic**: Verify the parent post exists, then select all newsfeed_posts where parent_id=id and status='published', sort by created_at ascending, and for each reply add its likes_count.

**URL Parameters**:
- `id` (integer, required): The parent post ID

**Response**:
```json
{
  "success": true,
  "replies": [
    {
      "id": 2,
      "author_name": "Jane Smith",
      "author_email": "jane@example.com",
      "author_id": 456,
      "content": "Great post!",
      "parent_id": 1,
      "post_type": "reply",
      "status": "published",
      "likes_count": 2,
      "comments_count": 0,
      "created_at": "2025-10-26T12:05:00Z"
    }
  ],
  "total": 1
}
```

**Xano Implementation**:
```javascript
// GET /newsfeed_posts/{id}/replies
function getNewsfeedReplies(inputs) {
    // Verify the parent post exists
    const parentPost = this.query.newsfeed_posts
        .filter(item => item.id == inputs.id)
        .first();
    
    if (!parentPost) {
        return this.response.status(404).json({ 
            success: false, 
            error: 'Post not found' 
        });
    }
    
    // Select all replies where parent_id = id and status = 'published'
    const replies = this.query.newsfeed_posts
        .filter(item => item.parent_id == inputs.id && item.status == 'published')
        .sort((a, b) => a.created_at - b.created_at)
        .all();
    
    // For each reply, add its likes_count
    const repliesWithLikes = replies.map(reply => {
        const likesCount = this.query.newsfeed_likes
            .filter(item => item.post_id == reply.id)
            .count();
        
        return {
            ...reply,
            likes_count: likesCount
        };
    });
    
    return {
        success: true,
        replies: repliesWithLikes,
        total: repliesWithLikes.length
    };
}
```

---

### 5. GET /newsfeed_analytics

**Purpose**: Return engagement metrics over a specified period.

**Query param**: time_range ('7d', '30d', '90d'), default '7d'

**Logic**: Compute totals for posts, replies, likes and comments created within the time range; derive a top-contributors list (author_email or author_name) and calculate an engagement rate. Return the analytics object.

**Query Parameters**:
- `time_range` (string, optional): Time range for analytics. Options: '7d', '30d', '90d'. Default: '7d'

**Response**:
```json
{
  "success": true,
  "analytics": {
    "overview": {
      "total_posts": 45,
      "total_replies": 123,
      "total_likes": 567,
      "total_comments": 123,
      "engagement_rate": 1533
    },
    "top_contributors": [
      {
        "name": "john@example.com",
        "posts": 15
      },
      {
        "name": "jane@example.com",
        "posts": 12
      }
    ],
    "time_range": "7d"
  }
}
```

**Xano Implementation**:
```javascript
// GET /newsfeed_analytics
function getNewsfeedAnalytics(inputs) {
    const timeRange = inputs.time_range || '7d';
    let startDate = new Date();
    
    // Calculate start date based on time range
    switch (timeRange) {
        case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(startDate.getDate() - 90);
            break;
        default:
            startDate.setDate(startDate.getDate() - 7);
    }
    
    // Get all posts created within the time range
    const allPosts = this.query.newsfeed_posts
        .filter(item => item.created_at >= startDate && item.status == 'published')
        .all();
    
    // Compute total posts (top-level posts only, no replies)
    const totalPosts = allPosts.filter(post => post.parent_id == null).length;
    
    // Compute total replies
    const totalReplies = allPosts.filter(post => post.parent_id != null).length;
    
    // Compute total likes created within time range
    const totalLikes = this.query.newsfeed_likes
        .filter(item => item.created_at >= startDate)
        .count();
    
    // Compute total comments (same as total replies)
    const totalComments = totalReplies;
    
    // Calculate engagement rate: (likes + comments) / posts * 100
    const engagementRate = totalPosts > 0 
        ? Math.round(((totalLikes + totalComments) / totalPosts) * 100) 
        : 0;
    
    // Derive top contributors list
    const contributors = {};
    allPosts.forEach(post => {
        const key = post.author_email || post.author_name;
        if (key) {
            contributors[key] = (contributors[key] || 0) + 1;
        }
    });
    
    // Sort contributors by post count and take top 5
    const topContributors = Object.entries(contributors)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, posts]) => ({ name, posts }));
    
    return {
        success: true,
        analytics: {
            overview: {
                total_posts: totalPosts,
                total_replies: totalReplies,
                total_likes: totalLikes,
                total_comments: totalComments,
                engagement_rate: engagementRate
            },
            top_contributors: topContributors,
            time_range: timeRange
        }
    };
}
```

---

## Implementation Steps

### Step 1: Create Database Tables
1. Navigate to your Xano workspace
2. Go to the Database section
3. Create the `newsfeed_posts` table with all fields and indexes as specified above
4. Create the `newsfeed_likes` table with all fields and indexes as specified above

### Step 2: Create API Group (if not exists)
1. Navigate to the API section in Xano
2. Create or select the "EmailMarketing" API group
3. Ensure the API group is set to "Public" or configure authentication as needed

### Step 3: Create Endpoints
For each endpoint above:
1. Click "Add API Endpoint" in the EmailMarketing API group
2. Set the HTTP method (GET or POST)
3. Set the path (e.g., `/newsfeed_posts`, `/newsfeed_posts/{id}/like`)
4. Add the function code from the implementations above
5. Configure inputs/parameters as specified
6. Test the endpoint with sample data

### Step 4: Configure Inputs
For each endpoint, configure the inputs in Xano:

**GET /newsfeed_posts**:
- type (text, optional)
- author_id (integer, optional)
- author_email (text, optional)
- search (text, optional)
- limit (integer, optional)
- offset (integer, optional)
- visitor_email (text, optional)

**POST /newsfeed_posts**:
- author_name (text, required)
- content (text, required)
- author_email (text, optional)
- author_id (integer, optional)
- parent_id (integer, optional)
- session_id (text, optional)
- ip_address (text, optional)
- user_agent (text, optional)

**POST /newsfeed_posts/{id}/like**:
- id (integer, required, from path)
- author_email (text, required)
- author_id (integer, optional)
- ip_address (text, optional)
- user_agent (text, optional)

**GET /newsfeed_posts/{id}/replies**:
- id (integer, required, from path)

**GET /newsfeed_analytics**:
- time_range (text, optional, default: '7d')

### Step 5: Test Endpoints
Use Xano's built-in testing tools or external tools like Postman to test each endpoint:

1. Create sample posts
2. Create replies to posts
3. Like/unlike posts
4. Retrieve posts with various filters
5. Get replies for posts
6. Check analytics

### Step 6: Frontend Integration
Update your frontend code to use these endpoints:

```javascript
// Example: Fetch posts
const response = await fetch(`${XANO_BASE_URL}/newsfeed_posts?type=posts_only&limit=20&visitor_email=user@example.com`);
const data = await response.json();

// Example: Create a post
const response = await fetch(`${XANO_BASE_URL}/newsfeed_posts`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    author_name: 'John Doe',
    author_email: 'john@example.com',
    content: 'My post content'
  })
});

// Example: Like a post
const response = await fetch(`${XANO_BASE_URL}/newsfeed_posts/123/like`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    author_email: 'john@example.com'
  })
});

// Example: Get replies
const response = await fetch(`${XANO_BASE_URL}/newsfeed_posts/123/replies`);
const data = await response.json();

// Example: Get analytics
const response = await fetch(`${XANO_BASE_URL}/newsfeed_analytics?time_range=30d`);
const data = await response.json();
```

---

## Security Considerations

1. **Rate Limiting**: Implement rate limiting to prevent spam and abuse
2. **Email Validation**: Always validate email format before storing
3. **Content Moderation**: Consider implementing content moderation for posts
4. **Authentication**: Add authentication if needed to restrict access
5. **Input Sanitization**: Sanitize all user inputs to prevent XSS attacks
6. **CORS Configuration**: Configure CORS settings appropriately for your frontend

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation error)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

## Testing Checklist

- [ ] Create newsfeed_posts table with all fields and indexes
- [ ] Create newsfeed_likes table with all fields and indexes
- [ ] Create GET /newsfeed_posts endpoint
- [ ] Create POST /newsfeed_posts endpoint
- [ ] Create POST /newsfeed_posts/{id}/like endpoint
- [ ] Create GET /newsfeed_posts/{id}/replies endpoint
- [ ] Create GET /newsfeed_analytics endpoint
- [ ] Test creating top-level posts
- [ ] Test creating replies to posts
- [ ] Test liking posts
- [ ] Test unliking posts
- [ ] Test filtering posts by type
- [ ] Test filtering posts by author
- [ ] Test search functionality
- [ ] Test pagination
- [ ] Test visitor_liked flag
- [ ] Test getting replies
- [ ] Test analytics with different time ranges
- [ ] Test error cases (invalid data, missing fields, etc.)
- [ ] Integrate with frontend application
- [ ] Test end-to-end user flow

---

## Support and Troubleshooting

### Common Issues

**Issue**: Posts not appearing
- Check that status is set to 'published'
- Verify the query filters are correct
- Check database indexes are created

**Issue**: Likes not incrementing
- Verify the unique constraint on (post_id, author_email)
- Check that the post exists before liking
- Ensure likes_count is being updated correctly

**Issue**: Replies not showing
- Verify parent_id is set correctly
- Check that parent post exists
- Ensure status is 'published'

**Issue**: Analytics showing incorrect data
- Verify date calculations are correct
- Check that created_at timestamps are accurate
- Ensure time_range parameter is valid

---

## Maintenance and Updates

### Version History
- v1.0 (2025-10-26): Initial implementation with all 5 endpoints

### Future Enhancements
- Add post editing functionality
- Implement post deletion with soft delete
- Add post reporting/flagging system
- Implement user blocking
- Add rich media support (images, videos)
- Implement real-time updates with websockets
- Add notification system for replies and likes

---

This completes the implementation guide for the newsfeed endpoints in the EmailMarketing API group.
