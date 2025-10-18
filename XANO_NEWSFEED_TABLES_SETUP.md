# XANO Newsfeed Tables Setup for Visitor Interaction

## Step 1: Create newsfeed_posts Table

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
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES members(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES newsfeed_posts(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_posts_author ON newsfeed_posts(author_id);
CREATE INDEX idx_posts_parent ON newsfeed_posts(parent_id);
CREATE INDEX idx_posts_status ON newsfeed_posts(status);
CREATE INDEX idx_posts_created ON newsfeed_posts(created_at);
CREATE INDEX idx_posts_type ON newsfeed_posts(post_type);
```

## Step 2: Create newsfeed_likes Table

```sql
CREATE TABLE newsfeed_likes (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    post_id INTEGER NOT NULL,
    author_email VARCHAR(255),
    author_id INTEGER,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES newsfeed_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (post_id, author_email)
);

CREATE INDEX idx_likes_post ON newsfeed_likes(post_id);
CREATE INDEX idx_likes_author ON newsfeed_likes(author_id);
CREATE INDEX idx_likes_created ON newsfeed_likes(created_at);
```

## Step 3: Create visitor_sessions Table (for tracking)

```sql
CREATE TABLE visitor_sessions (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    post_count INTEGER DEFAULT 0,
    is_member BOOLEAN DEFAULT FALSE,
    member_id INTEGER,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE INDEX idx_sessions_email ON visitor_sessions(email);
CREATE INDEX idx_sessions_session ON visitor_sessions(session_id);
CREATE INDEX idx_sessions_member ON visitor_sessions(member_id);
```

## Step 4: XANO API Endpoints Implementation

### GET /newsfeed_posts - List Posts with Threading
```javascript
// GET /newsfeed_posts - Get posts with optional filtering and threading
function getNewsfeedPosts(inputs) {
    let query = this.query.newsfeed_posts.filter(item => item.status == 'published');
    
    // Filter by type (posts only, not replies)
    if (inputs.type === 'posts_only') {
        query = query.filter(item => item.parent_id == null);
    }
    
    // Filter by author
    if (inputs.author_id) {
        query = query.filter(item => item.author_id == inputs.author_id);
    }
    
    // Filter by email (for visitor's own posts)
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
    
    // Get posts with pagination
    const limit = Math.min(inputs.limit || 20, 100);
    const offset = inputs.offset || 0;
    
    const posts = query
        .sort((a, b) => b.created_at - a.created_at)
        .limit(limit)
        .offset(offset)
        .all();
    
    // Add like status for current visitor
    const postsWithLikes = posts.map(post => {
        const likeCount = this.query.newsfeed_likes.filter(item => item.post_id == post.id).count();
        const commentCount = this.query.newsfeed_posts.filter(item => item.parent_id == post.id).count();
        
        // Check if current visitor liked this post
        let visitorLiked = false;
        if (inputs.visitor_email) {
            visitorLiked = this.query.newsfeed_likes
                .filter(item => item.post_id == post.id && item.author_email == inputs.visitor_email)
                .count() > 0;
        }
        
        return {
            ...post,
            likes_count: likeCount,
            comments_count: commentCount,
            visitor_liked: visitorLiked
        };
    });
    
    return {
        success: true,
        posts: postsWithLikes,
        total: query.count(),
        pagination: {
            limit: limit,
            offset: offset,
            has_more: (offset + limit) < query.count()
        }
    };
}
```

### POST /newsfeed_posts - Create Post/Reply
```javascript
// POST /newsfeed_posts - Create new post or reply
function createNewsfeedPost(inputs) {
    // Validate required fields
    if (!inputs.content || inputs.content.trim() === '') {
        return this.response.status(400).json({ 
            success: false, 
            error: 'Post content is required' 
        });
    }
    
    if (!inputs.author_name || inputs.author_name.trim() === '') {
        return this.response.status(400).json({ 
            success: false, 
            error: 'Author name is required' 
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
    
    // Check if this is a reply to existing post
    if (inputs.parent_id) {
        const parentPost = this.query.newsfeed_posts.filter(item => item.id == inputs.parent_id).first();
        if (!parentPost) {
            return this.response.status(404).json({ 
                success: false, 
                error: 'Parent post not found' 
            });
        }
    }
    
    // Create the post
    const post = this.addRecord('newsfeed_posts', {
        author_name: inputs.author_name.trim(),
        author_email: inputs.author_email ? inputs.author_email.trim() : null,
        author_id: inputs.author_id || null,
        content: inputs.content.trim(),
        parent_id: inputs.parent_id || null,
        post_type: inputs.parent_id ? 'reply' : 'post',
        status: 'published',
        likes_count: 0,
        comments_count: 0,
        is_pinned: false,
        is_featured: false
    });
    
    // Update parent post comment count if this is a reply
    if (inputs.parent_id) {
        const parent = this.query.newsfeed_posts.filter(item => item.id == inputs.parent_id).first();
        if (parent) {
            this.updateRecord('newsfeed_posts', inputs.parent_id, {
                comments_count: parent.comments_count + 1
            });
        }
    }
    
    // Record visitor session if email provided
    if (inputs.author_email) {
        this.addRecord('visitor_sessions', {
            session_id: inputs.session_id || Math.random().toString(36).substring(2, 15),
            email: inputs.author_email,
            name: inputs.author_name,
            ip_address: inputs.ip_address || null,
            user_agent: inputs.user_agent || null,
            post_count: 1,
            is_member: inputs.author_id ? true : false,
            member_id: inputs.author_id || null
        });
    }
    
    return {
        success: true,
        post: post,
        message: inputs.parent_id ? 'Reply posted successfully' : 'Post created successfully'
    };
}
```

### POST /newsfeed_posts/{id}/like - Like/Unlike Post
```javascript
// POST /newsfeed_posts/{id}/like - Toggle like on post
function likeNewsfeedPost(inputs) {
    const post = this.query.newsfeed_posts.filter(item => item.id == inputs.id).first();
    
    if (!post) {
        return this.response.status(404).json({ 
            success: false, 
            error: 'Post not found' 
        });
    }
    
    // Check if already liked
    const existingLike = this.query.newsfeed_likes
        .filter(item => item.post_id == inputs.id && item.author_email == inputs.author_email)
        .first();
    
    if (existingLike) {
        // Unlike: remove the like
        this.deleteRecord('newsfeed_likes', existingLike.id);
        
        // Update post like count
        this.updateRecord('newsfeed_posts', inputs.id, {
            likes_count: Math.max(0, post.likes_count - 1)
        });
        
        return {
            success: true,
            liked: false,
            likes_count: Math.max(0, post.likes_count - 1)
        };
    } else {
        // Like: add new like
        this.addRecord('newsfeed_likes', {
            post_id: inputs.id,
            author_email: inputs.author_email,
            author_id: inputs.author_id || null,
            ip_address: inputs.ip_address || null,
            user_agent: inputs.user_agent || null
        });
        
        // Update post like count
        this.updateRecord('newsfeed_posts', inputs.id, {
            likes_count: post.likes_count + 1
        });
        
        return {
            success: true,
            liked: true,
            likes_count: post.likes_count + 1
        };
    }
}
```

### GET /newsfeed_posts/{id}/replies - Get Replies to Post
```javascript
// GET /newsfeed_posts/{id}/replies - Get all replies to a post
function getNewsfeedReplies(inputs) {
    const parentPost = this.query.newsfeed_posts.filter(item => item.id == inputs.id).first();
    
    if (!parentPost) {
        return this.response.status(404).json({ 
            success: false, 
            error: 'Post not found' 
        });
    }
    
    const replies = this.query.newsfeed_posts
        .filter(item => item.parent_id == inputs.id && item.status == 'published')
        .sort((a, b) => a.created_at - b.created_at)
        .all();
    
    // Add like counts to replies
    const repliesWithLikes = replies.map(reply => {
        const likeCount = this.query.newsfeed_likes.filter(item => item.post_id == reply.id).count();
        return {
            ...reply,
            likes_count: likeCount
        };
    });
    
    return {
        success: true,
        replies: repliesWithLikes,
        total: repliesWithLikes.length
    };
}
```

### GET /newsfeed_analytics - Get Analytics
```javascript
// GET /newsfeed_analytics - Get newsfeed engagement analytics
function getNewsfeedAnalytics(inputs) {
    const timeRange = inputs.time_range || '7d'; // 7d, 30d, 90d
    let startDate = new Date();
    
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
    
    // Get posts in time range
    const posts = this.query.newsfeed_posts
        .filter(item => item.created_at >= startDate && item.status == 'published')
        .all();
    
    // Calculate metrics
    const totalPosts = posts.length;
    const totalReplies = this.query.newsfeed_posts
        .filter(item => item.created_at >= startDate && item.parent_id != null && item.status == 'published')
        .count();
    
    const totalLikes = posts.reduce((sum, post) => sum + post.likes_count, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments_count, 0);
    
    // Get top contributors
    const contributors = {};
    posts.forEach(post => {
        const key = post.author_email || post.author_name;
        contributors[key] = (contributors[key] || 0) + 1;
    });
    
    const topContributors = Object.entries(contributors)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, posts: count }));
    
    return {
        success: true,
        analytics: {
            overview: {
                total_posts: totalPosts,
                total_replies: totalReplies,
                total_likes: totalLikes,
                total_comments: totalComments,
                engagement_rate: totalPosts > 0 ? Math.round(((totalLikes + totalComments) / totalPosts) * 100) : 0
            },
            top_contributors: topContributors,
            time_range: timeRange
        }
    };
}
```

## Step 5: Sample Data for Testing

```javascript
// Sample posts for testing
const samplePosts = [
    {
        author_name: 'Sarah Johnson',
        author_email: 'sarah@example.com',
        content: 'Just discovered this amazing community! Looking forward to learning and sharing with everyone. 🎉',
        post_type: 'post'
    },
    {
        author_name: 'Mike Chen',
        author_email: 'mike@example.com',
        content: 'Welcome Sarah! What brings you to our community?',
        parent_id: 1,
        post_type: 'reply'
    }
];
```

This setup provides a complete visitor interaction system with membership capture, real-time engagement, and professional analytics.