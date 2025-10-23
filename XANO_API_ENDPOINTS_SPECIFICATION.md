# Xano API Endpoints Specification

This document specifies all API endpoints for the Social Engagement Hub platform, including Email Campaigns and Member Management systems.

## Base URL

```
https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5
```

---

## Email Campaigns Endpoints (9 endpoints)

### 1. GET /email_campaigns
List all campaigns with filters

**Query Parameters:**
- `status` (optional): Filter by campaign status (`draft`, `sent`, `scheduled`)
- `type` (optional): Filter by campaign type
- `search` (optional): Search in campaign name or subject
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Items per page (default: 20)

**Response:**
```json
{
  "campaigns": [
    {
      "id": 1,
      "name": "Campaign Name",
      "subject": "Email Subject",
      "from_name": "Sender Name",
      "from_email": "sender@example.com",
      "reply_to": "reply@example.com",
      "html_content": "<html>...</html>",
      "plain_text_content": "Plain text version",
      "type": "newsletter",
      "status": "draft",
      "recipient_count": 0,
      "created_at": "2025-10-23T12:00:00Z",
      "sent_at": null
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

---

### 2. POST /email_campaigns
Create new campaign

**Request Body:**
```json
{
  "name": "Campaign Name",
  "subject": "Email Subject",
  "from_name": "Sender Name",
  "from_email": "sender@example.com",
  "reply_to": "reply@example.com",
  "html_content": "<html>...</html>",
  "plain_text_content": "Plain text version",
  "type": "newsletter"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Campaign Name",
  "subject": "Email Subject",
  "from_name": "Sender Name",
  "from_email": "sender@example.com",
  "reply_to": "reply@example.com",
  "html_content": "<html>...</html>",
  "plain_text_content": "Plain text version",
  "type": "newsletter",
  "status": "draft",
  "recipient_count": 0,
  "created_at": "2025-10-23T12:00:00Z"
}
```

---

### 3. GET /email_campaigns/{campaign_id}
Get single campaign with statistics

**Path Parameters:**
- `campaign_id`: Campaign ID

**Response:**
```json
{
  "id": 1,
  "name": "Campaign Name",
  "subject": "Email Subject",
  "from_name": "Sender Name",
  "from_email": "sender@example.com",
  "reply_to": "reply@example.com",
  "html_content": "<html>...</html>",
  "plain_text_content": "Plain text version",
  "type": "newsletter",
  "status": "sent",
  "recipient_count": 1500,
  "created_at": "2025-10-23T12:00:00Z",
  "sent_at": "2025-10-23T14:00:00Z",
  "statistics": {
    "sent": 1500,
    "delivered": 1480,
    "opened": 750,
    "clicked": 320,
    "bounced": 20,
    "open_rate": 50.68,
    "click_rate": 21.62,
    "bounce_rate": 1.35
  }
}
```

---

### 4. PATCH /email_campaigns/{campaign_id}
Update campaign

**Path Parameters:**
- `campaign_id`: Campaign ID

**Request Body:**
```json
{
  "name": "Updated Campaign Name",
  "subject": "Updated Subject",
  "from_name": "Updated Sender",
  "from_email": "updated@example.com",
  "reply_to": "reply@example.com",
  "html_content": "<html>...</html>",
  "plain_text_content": "Plain text version",
  "type": "newsletter",
  "status": "draft"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated Campaign Name",
  "subject": "Updated Subject",
  "status": "draft",
  "updated_at": "2025-10-23T15:00:00Z"
}
```

---

### 5. DELETE /email_campaigns/{campaign_id}
Delete campaign

**Path Parameters:**
- `campaign_id`: Campaign ID

**Response:**
```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

---

### 6. POST /email_campaigns/{campaign_id}/send
Send campaign to recipients

**Path Parameters:**
- `campaign_id`: Campaign ID

**Request Body:**
```json
{
  "group_ids": [1, 2, 3],
  "contact_ids": [10, 20, 30],
  "send_to_all": false,
  "schedule_for": "2025-10-24T10:00:00Z"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Campaign Name",
  "status": "sent",
  "recipient_count": 1500,
  "sent_at": "2025-10-23T14:00:00Z",
  "scheduled_for": null
}
```

---

### 7. GET /email_campaigns/{campaign_id}/analytics
Get campaign analytics with open/click rates

**Path Parameters:**
- `campaign_id`: Campaign ID

**Response:**
```json
{
  "campaign_id": 1,
  "campaign_name": "Campaign Name",
  "sent_at": "2025-10-23T14:00:00Z",
  "statistics": {
    "sent": 1500,
    "delivered": 1480,
    "opened": 750,
    "clicked": 320,
    "bounced": 20,
    "unsubscribed": 5,
    "open_rate": 50.68,
    "click_rate": 21.62,
    "bounce_rate": 1.35,
    "unsubscribe_rate": 0.34
  },
  "top_links": [
    {
      "url": "https://example.com/product",
      "clicks": 180
    },
    {
      "url": "https://example.com/blog",
      "clicks": 140
    }
  ],
  "engagement_timeline": [
    {
      "date": "2025-10-23",
      "opens": 450,
      "clicks": 200
    },
    {
      "date": "2025-10-24",
      "opens": 200,
      "clicks": 80
    }
  ]
}
```

---

### 8. GET /track/open/{tracking_token}
Track email open

**Path Parameters:**
- `tracking_token`: Unique tracking token for the email send

**Response:**
Returns a 1x1 transparent GIF image with `Content-Type: image/gif`

**Side Effects:**
- Records the open event in `campaign_sends` table
- Updates `opened_at` timestamp if not already set

---

### 9. GET /track/click/{tracking_token}
Track link click and redirect

**Path Parameters:**
- `tracking_token`: Unique tracking token for the email send

**Query Parameters:**
- `url`: The destination URL to redirect to

**Response:**
Returns a 302 redirect to the specified URL

**Side Effects:**
- Records the click event in `campaign_sends` table
- Updates `clicked_at` timestamp if not already set

---

## Member Management Endpoints (10 endpoints)

### 1. GET /members
List all members with filters

**Query Parameters:**
- `role` (optional): Filter by member role (`admin`, `moderator`, `member`, `contributor`)
- `status` (optional): Filter by status (`active`, `inactive`, `suspended`)
- `search` (optional): Search in name or email
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Items per page (default: 20)

**Response:**
```json
{
  "members": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member",
      "status": "active",
      "phone": "+1234567890",
      "bio": "Member bio text",
      "location": "New York, NY",
      "website": "https://johndoe.com",
      "social_links": {
        "twitter": "https://twitter.com/johndoe",
        "linkedin": "https://linkedin.com/in/johndoe"
      },
      "preferences": {
        "email_notifications": true,
        "newsletter": true
      },
      "avatar_url": "https://example.com/avatar.jpg",
      "last_active": "2025-10-23T12:00:00Z",
      "created_at": "2025-01-15T10:00:00Z",
      "activity_counts": {
        "posts": 45,
        "comments": 120,
        "likes": 350
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 500,
    "total_pages": 25
  }
}
```

---

### 2. POST /members
Create new member

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "member",
  "status": "active",
  "phone": "+1234567890",
  "bio": "Member bio text",
  "location": "New York, NY",
  "website": "https://johndoe.com",
  "social_links": {
    "twitter": "https://twitter.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  },
  "preferences": {
    "email_notifications": true,
    "newsletter": true
  },
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "member",
  "status": "active",
  "created_at": "2025-10-23T12:00:00Z"
}
```

---

### 3. GET /members/{member_id}
Get single member

**Path Parameters:**
- `member_id`: Member ID

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "member",
  "status": "active",
  "phone": "+1234567890",
  "bio": "Member bio text",
  "location": "New York, NY",
  "website": "https://johndoe.com",
  "social_links": {
    "twitter": "https://twitter.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  },
  "preferences": {
    "email_notifications": true,
    "newsletter": true
  },
  "avatar_url": "https://example.com/avatar.jpg",
  "last_active": "2025-10-23T12:00:00Z",
  "created_at": "2025-01-15T10:00:00Z",
  "activity_counts": {
    "posts": 45,
    "comments": 120,
    "likes": 350
  },
  "recent_activity": [
    {
      "type": "post",
      "content": "Posted a new article",
      "timestamp": "2025-10-23T11:00:00Z"
    },
    {
      "type": "comment",
      "content": "Commented on a discussion",
      "timestamp": "2025-10-23T10:30:00Z"
    }
  ]
}
```

---

### 4. PATCH /members/{member_id}
Update member

**Path Parameters:**
- `member_id`: Member ID

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "role": "moderator",
  "status": "active",
  "phone": "+1234567890",
  "bio": "Updated bio text",
  "location": "San Francisco, CA",
  "website": "https://johndoe-updated.com",
  "social_links": {
    "twitter": "https://twitter.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  },
  "preferences": {
    "email_notifications": false,
    "newsletter": true
  },
  "avatar_url": "https://example.com/new-avatar.jpg",
  "last_active": "2025-10-23T12:00:00Z"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "role": "moderator",
  "status": "active",
  "updated_at": "2025-10-23T12:00:00Z"
}
```

---

### 5. DELETE /members/{member_id}
Delete member

**Path Parameters:**
- `member_id`: Member ID

**Response:**
```json
{
  "success": true,
  "message": "Member deleted successfully"
}
```

---

### 6. POST /members/bulk-update
Update multiple members

**Request Body:**
```json
{
  "member_ids": [1, 2, 3, 4, 5],
  "updates": {
    "status": "active",
    "role": "member"
  }
}
```

**Response:**
```json
{
  "success": true,
  "updated_count": 5,
  "message": "5 members updated successfully"
}
```

---

### 7. POST /members/{member_id}/activity
Update activity counters

**Path Parameters:**
- `member_id`: Member ID

**Request Body:**
```json
{
  "activity_type": "post",
  "increment": 1
}
```

**Valid activity_type values:**
- `post`: Increment post count
- `comment`: Increment comment count
- `like`: Increment like count

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "activity_counts": {
    "posts": 46,
    "comments": 120,
    "likes": 350
  },
  "last_active": "2025-10-23T12:00:00Z"
}
```

---

### 8. GET /members/stats
Get member statistics

**Response:**
```json
{
  "total": 500,
  "active": 450,
  "inactive": 30,
  "suspended": 20,
  "new_this_month": 45,
  "by_role": {
    "admin": 5,
    "moderator": 15,
    "member": 450,
    "contributor": 30
  },
  "by_status": {
    "active": 450,
    "inactive": 30,
    "suspended": 20
  },
  "top_contributors": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "total_activity": 515,
      "posts": 45,
      "comments": 120,
      "likes": 350
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "total_activity": 480,
      "posts": 60,
      "comments": 200,
      "likes": 220
    }
  ]
}
```

---

### 9. GET /members/search
Search members

**Query Parameters:**
- `q`: Search query (searches in name, email, bio)
- `limit` (optional): Maximum number of results (default: 10)

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member",
      "status": "active",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  ],
  "count": 1
}
```

---

### 10. GET /members/export
Export members to CSV

**Query Parameters:**
- `role` (optional): Filter by role
- `status` (optional): Filter by status

**Response:**
Returns a CSV file with `Content-Type: text/csv`

**CSV Format:**
```csv
ID,Name,Email,Role,Status,Phone,Location,Created At,Last Active,Posts,Comments,Likes
1,John Doe,john@example.com,member,active,+1234567890,"New York, NY",2025-01-15T10:00:00Z,2025-10-23T12:00:00Z,45,120,350
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "details": "Specific error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "Campaign/Member with ID X not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Authentication

All API endpoints require authentication using an API key passed in the request headers:

```
Authorization: Bearer YOUR_API_KEY
```

Or via query parameter:

```
?api_key=YOUR_API_KEY
```

---

## Rate Limiting

- Rate limit: 1000 requests per hour per API key
- Rate limit headers are included in all responses:
  - `X-RateLimit-Limit`: Maximum requests per hour
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Timestamp when the rate limit resets

---

## Pagination

Endpoints that return lists support pagination with the following parameters:

- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

Pagination metadata is included in the response:

```json
{
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 500,
    "total_pages": 25
  }
}
```
