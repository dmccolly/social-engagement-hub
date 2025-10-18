# Member Management & Email System Backend Requirements

## Overview
This document outlines the backend requirements to complete the member management and email campaign systems for the social engagement hub. The frontend implementations are complete, but backend APIs and database storage are missing.

## Current State
- ✅ Frontend Member Management UI (Complete)
- ✅ Frontend Email Campaign UI with Rich Editor (Complete)
- ✅ Cloudinary Integration (Complete)
- ❌ Backend Member APIs (Missing)
- ❌ Backend Email APIs (Missing)
- ❌ Database Tables (Missing)
- ❌ Email Sending Service (Missing)

## Required XANO Database Tables

### 1. Members Table
```sql
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'Member',
  status VARCHAR(50) DEFAULT 'Active',
  join_date DATE,
  last_active DATE,
  avatar_url VARCHAR(500),
  posts_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  email_verified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(50),
  bio TEXT,
  location VARCHAR(255),
  website VARCHAR(500),
  social_links JSON,
  preferences JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_role ON members(role);
CREATE INDEX idx_members_join_date ON members(join_date);
```

### 2. Email Campaigns Table
```sql
CREATE TABLE email_campaigns (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  content HTML_TEXT,
  html_content HTML_TEXT,
  plain_text_content TEXT,
  type VARCHAR(50) DEFAULT 'Newsletter',
  status VARCHAR(50) DEFAULT 'Draft',
  recipients_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  template_id INTEGER,
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),
  reply_to VARCHAR(255),
  scheduled_for TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. Email Groups/Segments Table
```sql
CREATE TABLE email_groups (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  criteria JSON,
  member_count INTEGER DEFAULT 0,
  is_dynamic BOOLEAN DEFAULT FALSE,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. Member-Group Relationships Table
```sql
CREATE TABLE member_email_groups (
  member_id INTEGER NOT NULL,
  group_id INTEGER NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP NULL,
  subscription_source VARCHAR(100),
  PRIMARY KEY (member_id, group_id),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES email_groups(id) ON DELETE CASCADE
);
```

### 5. Email Campaign Recipients Table
```sql
CREATE TABLE email_campaign_recipients (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  campaign_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  opened_at TIMESTAMP NULL,
  clicked_at TIMESTAMP NULL,
  bounced_at TIMESTAMP NULL,
  unsubscribed_at TIMESTAMP NULL,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  user_agent VARCHAR(500),
  ip_address VARCHAR(45),
  tracking_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_recipients_campaign ON email_campaign_recipients(campaign_id);
CREATE INDEX idx_recipients_member ON email_campaign_recipients(member_id);
CREATE INDEX idx_recipients_email ON email_campaign_recipients(email);
CREATE INDEX idx_recipients_token ON email_campaign_recipients(tracking_token);
```

### 6. Email Templates Table
```sql
CREATE TABLE email_templates (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  html_content HTML_TEXT,
  plain_text_content TEXT,
  category VARCHAR(100),
  thumbnail_url VARCHAR(500),
  variables JSON,
  is_system BOOLEAN DEFAULT FALSE,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 7. Member Activity Log Table
```sql
CREATE TABLE member_activity_log (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  member_id INTEGER NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  activity_description TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Index
CREATE INDEX idx_activity_member ON member_activity_log(member_id);
CREATE INDEX idx_activity_type ON member_activity_log(activity_type);
CREATE INDEX idx_activity_created ON member_activity_log(created_at);
```

## Required XANO API Endpoints

### Member Management Endpoints

#### 1. Create Member
```
POST /api/members
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Member",
  "phone": "+1234567890",
  "bio": "Member bio",
  "location": "New York, USA",
  "website": "https://johndoe.com",
  "social_links": {
    "twitter": "@johndoe",
    "linkedin": "john-doe"
  },
  "preferences": {
    "newsletter": true,
    "notifications": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "member": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Member",
    "status": "Active",
    "join_date": "2025-10-15",
    "last_active": "2025-10-15",
    "avatar_url": null,
    "posts_count": 0,
    "comments_count": 0,
    "likes_count": 0,
    "created_at": "2025-10-15T04:00:00Z"
  }
}
```

#### 2. List Members
```
GET /api/members?role=all&status=all&search=&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "members": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

#### 3. Update Member
```
PATCH /api/members/:id
```

#### 4. Delete Member
```
DELETE /api/members/:id
```

#### 5. Bulk Member Operations
```
POST /api/members/bulk
```
**Request:**
```json
{
  "operation": "update_role",
  "member_ids": [1, 2, 3],
  "role": "Editor"
}
```

### Email Campaign Endpoints

#### 1. Create Email Campaign
```
POST /api/campaigns
```
**Request Body:**
```json
{
  "name": "Welcome Newsletter",
  "subject": "Welcome to our community!",
  "content": "<html><body>...</body></html>",
  "plain_text_content": "Plain text version",
  "type": "Newsletter",
  "sender_name": "Community Team",
  "sender_email": "team@example.com",
  "reply_to": "support@example.com",
  "template_id": 1
}
```

#### 2. Send Campaign
```
POST /api/campaigns/:id/send
```
**Request:**
```json
{
  "recipient_groups": [1, 2],
  "send_to_all": false,
  "scheduled_for": "2025-10-16T10:00:00Z"
}
```

#### 3. Campaign Analytics
```
GET /api/campaigns/:id/analytics
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "recipients": 1000,
    "sent": 950,
    "opened": 475,
    "clicked": 95,
    "bounced": 20,
    "unsubscribed": 5,
    "open_rate": 50.0,
    "click_rate": 10.0,
    "bounce_rate": 2.1,
    "unsubscribe_rate": 0.5
  }
}
```

### Email Group Management

#### 1. Create Email Group
```
POST /api/email-groups
```

#### 2. Add Members to Group
```
POST /api/email-groups/:id/members
```
**Request:**
```json
{
  "member_ids": [1, 2, 3, 4, 5],
  "source": "manual_add"
}
```

#### 3. Get Group Members
```
GET /api/email-groups/:id/members?page=1&limit=50
```

## Email Service Integration Requirements

### 1. Email Service Provider Integration
- **Primary Recommendation**: SendGrid or Mailgun
- **Backup Option**: AWS SES or Postmark
- **Required Features**:
  - Bulk email sending
  - Delivery tracking
  - Bounce handling
  - Unsubscribe management
  - Template support
  - Analytics API

### 2. Email Queue System
- Implement queued sending for large campaigns
- Rate limiting (e.g., 100 emails per batch)
- Retry failed sends
- Priority queuing for urgent campaigns

### 3. Tracking System
- Open tracking (1x1 pixel)
- Click tracking (redirect URLs)
- Unsubscribe handling
- Bounce processing

## Security Requirements

### 1. Authentication
- JWT token-based authentication
- API key management for external services
- Role-based access control

### 2. Data Protection
- Email encryption in transit and at rest
- GDPR compliance for EU members
- Unsubscribe compliance (CAN-SPAM, CASL)

### 3. Rate Limiting
- API rate limiting per user
- Email sending limits per campaign
- Bulk operation limits

## Implementation Priority

### Phase 1: Core Member Management (Week 1)
1. Create members table and basic CRUD endpoints
2. Implement member search and filtering
3. Add member activity tracking

### Phase 2: Email Campaign Basics (Week 2)
1. Create email campaigns table and endpoints
2. Implement campaign creation and editing
3. Add email template management

### Phase 3: Email Sending (Week 3)
1. Integrate email service provider
2. Implement campaign sending functionality
3. Add basic tracking (opens, clicks)

### Phase 4: Advanced Features (Week 4)
1. Email groups and segmentation
2. Advanced analytics and reporting
3. Automation and scheduling
4. A/B testing capabilities

## Testing Requirements

### 1. Unit Tests
- All API endpoints
- Database operations
- Email service integration

### 2. Integration Tests
- End-to-end campaign creation and sending
- Member signup and management workflows
- Analytics tracking accuracy

### 3. Performance Tests
- Bulk email sending (10,000+ recipients)
- Large member database queries
- Concurrent user handling

## Monitoring and Maintenance

### 1. Monitoring
- Email delivery rates
- API response times
- Database performance
- Error rates and logging

### 2. Maintenance
- Regular database optimization
- Email list hygiene
- Bounce and unsubscribe processing
- Analytics data retention policies

This backend implementation will transform the current frontend-only member management and email systems into a fully functional, production-ready platform.