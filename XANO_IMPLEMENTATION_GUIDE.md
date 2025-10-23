# Xano API Implementation Guide

This guide provides step-by-step instructions for implementing the Email Campaigns and Member Management endpoints in Xano.

## Overview

This implementation adds 19 new API endpoints:
- **Email Campaigns**: 9 endpoints
- **Member Management**: 10 endpoints

## Prerequisites

1. Access to Xano workspace: `https://xajo-bs7d-cagt.n7e.xano.io`
2. API Group: `api:iZd1_fI5`
3. Existing database tables (see Database Schema section)

---

## Database Schema

### Email Campaigns Tables

#### Table: `email_campaigns`
```
id (integer, auto-increment, primary key)
name (text, required)
subject (text, required)
from_name (text)
from_email (text)
reply_to (text)
html_content (text)
plain_text_content (text)
type (text, default: 'newsletter')
status (text, default: 'draft')
recipient_count (integer, default: 0)
created_at (timestamp, auto)
updated_at (timestamp, auto)
sent_at (timestamp, nullable)
```

#### Table: `campaign_sends`
```
id (integer, auto-increment, primary key)
campaign_id (integer, foreign key -> email_campaigns.id)
contact_id (integer, foreign key -> email_contacts.id)
tracking_token (text, unique, indexed)
opened_at (timestamp, nullable)
clicked_at (timestamp, nullable)
bounced_at (timestamp, nullable)
created_at (timestamp, auto)
```

### Member Management Tables

#### Table: `members`
```
id (integer, auto-increment, primary key)
name (text, required)
email (text, required, unique, indexed)
role (text, default: 'member')
status (text, default: 'active')
phone (text)
bio (text)
location (text)
website (text)
social_links (json)
preferences (json)
avatar_url (text)
last_active (timestamp)
created_at (timestamp, auto)
updated_at (timestamp, auto)
```

#### Table: `member_activity`
```
id (integer, auto-increment, primary key)
member_id (integer, foreign key -> members.id)
posts (integer, default: 0)
comments (integer, default: 0)
likes (integer, default: 0)
updated_at (timestamp, auto)
```

---

## Email Campaign Endpoints Implementation

### 1. GET /email_campaigns

**Purpose**: List all campaigns with filters and pagination

**Implementation Steps**:
1. Create new API endpoint in Xano
2. Add query parameters: `status`, `type`, `search`, `page`, `per_page`
3. Query `email_campaigns` table with filters
4. Apply pagination logic
5. Return campaigns array with pagination metadata

**Xano Function Stack**:
```
1. Get Query Parameters
   - status (optional)
   - type (optional)
   - search (optional)
   - page (default: 1)
   - per_page (default: 20)

2. Query Database
   - Table: email_campaigns
   - Filters:
     * status = {status} (if provided)
     * type = {type} (if provided)
     * name LIKE %{search}% OR subject LIKE %{search}% (if search provided)
   - Sort: created_at DESC
   - Pagination: offset = (page - 1) * per_page, limit = per_page

3. Count Total Records
   - Same filters as query
   - Get total count for pagination

4. Return Response
   {
     "campaigns": [...],
     "pagination": {
       "page": page,
       "per_page": per_page,
       "total": total_count,
       "total_pages": ceil(total_count / per_page)
     }
   }
```

---

### 2. POST /email_campaigns

**Purpose**: Create new campaign

**Implementation Steps**:
1. Create POST endpoint
2. Parse request body
3. Validate required fields (name, subject)
4. Insert into `email_campaigns` table
5. Return created campaign

**Xano Function Stack**:
```
1. Get Request Body
   - name (required)
   - subject (required)
   - from_name
   - from_email
   - reply_to
   - html_content
   - plain_text_content
   - type (default: 'newsletter')

2. Validate Input
   - Check name is not empty
   - Check subject is not empty

3. Insert Record
   - Table: email_campaigns
   - Set status = 'draft'
   - Set recipient_count = 0
   - Set created_at = now()

4. Return Created Campaign
```

---

### 3. GET /email_campaigns/{campaign_id}

**Purpose**: Get single campaign with statistics

**Implementation Steps**:
1. Create GET endpoint with path parameter
2. Query campaign by ID
3. Calculate statistics from `campaign_sends`
4. Return campaign with stats

**Xano Function Stack**:
```
1. Get Path Parameter
   - campaign_id

2. Query Campaign
   - Table: email_campaigns
   - Filter: id = campaign_id

3. Calculate Statistics (if campaign is sent)
   - Query campaign_sends where campaign_id = campaign_id
   - Count total sends
   - Count opened (opened_at IS NOT NULL)
   - Count clicked (clicked_at IS NOT NULL)
   - Count bounced (bounced_at IS NOT NULL)
   - Calculate rates:
     * open_rate = (opened / total) * 100
     * click_rate = (clicked / total) * 100
     * bounce_rate = (bounced / total) * 100

4. Return Campaign with Statistics
   {
     ...campaign_fields,
     "statistics": {
       "sent": total,
       "delivered": total - bounced,
       "opened": opened_count,
       "clicked": clicked_count,
       "bounced": bounced_count,
       "open_rate": open_rate,
       "click_rate": click_rate,
       "bounce_rate": bounce_rate
     }
   }
```

---

### 4. PATCH /email_campaigns/{campaign_id}

**Purpose**: Update campaign

**Implementation Steps**:
1. Create PATCH endpoint
2. Get campaign by ID
3. Validate campaign can be updated (status = 'draft')
4. Update fields
5. Return updated campaign

**Xano Function Stack**:
```
1. Get Path Parameter & Body
   - campaign_id
   - Update fields from body

2. Query Campaign
   - Check if exists
   - Check if status = 'draft' (only drafts can be updated)

3. Update Record
   - Table: email_campaigns
   - Update provided fields
   - Set updated_at = now()

4. Return Updated Campaign
```

---

### 5. DELETE /email_campaigns/{campaign_id}

**Purpose**: Delete campaign

**Implementation Steps**:
1. Create DELETE endpoint
2. Check if campaign exists
3. Delete related `campaign_sends` records
4. Delete campaign
5. Return success message

**Xano Function Stack**:
```
1. Get Path Parameter
   - campaign_id

2. Delete Related Records
   - Table: campaign_sends
   - Filter: campaign_id = campaign_id

3. Delete Campaign
   - Table: email_campaigns
   - Filter: id = campaign_id

4. Return Success
   {
     "success": true,
     "message": "Campaign deleted successfully"
   }
```

---

### 6. POST /email_campaigns/{campaign_id}/send

**Purpose**: Send campaign to recipients

**Implementation Steps**:
1. Create POST endpoint
2. Get campaign and validate
3. Get recipients (from groups, contacts, or all)
4. Create `campaign_sends` records with tracking tokens
5. Update campaign status and recipient_count
6. Return campaign with recipient count

**Xano Function Stack**:
```
1. Get Path Parameter & Body
   - campaign_id
   - group_ids (array)
   - contact_ids (array)
   - send_to_all (boolean)
   - schedule_for (timestamp, optional)

2. Query Campaign
   - Validate exists
   - Validate status = 'draft'

3. Get Recipients
   - If send_to_all: Get all contacts with status = 'subscribed'
   - If group_ids: Get contacts from email_group_contacts
   - If contact_ids: Get specific contacts
   - Deduplicate recipients

4. Create Campaign Sends
   - For each recipient:
     * Generate unique tracking_token (UUID or hash)
     * Insert into campaign_sends table
     * Fields: campaign_id, contact_id, tracking_token

5. Update Campaign
   - Set status = 'sent' (or 'scheduled' if schedule_for provided)
   - Set recipient_count = count of recipients
   - Set sent_at = now() (or schedule_for)

6. Return Updated Campaign
```

---

### 7. GET /email_campaigns/{campaign_id}/analytics

**Purpose**: Get detailed campaign analytics

**Implementation Steps**:
1. Create GET endpoint
2. Query campaign and campaign_sends
3. Calculate detailed statistics
4. Return analytics data

**Xano Function Stack**:
```
1. Get Path Parameter
   - campaign_id

2. Query Campaign
   - Validate exists

3. Query Campaign Sends
   - Table: campaign_sends
   - Filter: campaign_id = campaign_id
   - Join with email_contacts

4. Calculate Analytics
   - Total sent
   - Opened count and rate
   - Clicked count and rate
   - Bounced count and rate
   - Unsubscribed count and rate
   - Engagement timeline (group by date)

5. Return Analytics
   {
     "campaign_id": campaign_id,
     "campaign_name": name,
     "sent_at": sent_at,
     "statistics": {...},
     "engagement_timeline": [...]
   }
```

---

### 8. GET /track/open/{tracking_token}

**Purpose**: Track email open and return tracking pixel

**Implementation Steps**:
1. Create GET endpoint
2. Find campaign_send by tracking_token
3. Update opened_at if not already set
4. Return 1x1 transparent GIF

**Xano Function Stack**:
```
1. Get Path Parameter
   - tracking_token

2. Query Campaign Send
   - Table: campaign_sends
   - Filter: tracking_token = tracking_token

3. Update Opened Timestamp
   - If opened_at IS NULL:
     * Set opened_at = now()

4. Return Tracking Pixel
   - Content-Type: image/gif
   - Body: Base64 encoded 1x1 transparent GIF
   - GIF data: R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7
```

---

### 9. GET /track/click/{tracking_token}

**Purpose**: Track link click and redirect

**Implementation Steps**:
1. Create GET endpoint
2. Get tracking_token and target URL
3. Update clicked_at
4. Redirect to target URL

**Xano Function Stack**:
```
1. Get Path Parameter & Query
   - tracking_token
   - url (query parameter)

2. Query Campaign Send
   - Table: campaign_sends
   - Filter: tracking_token = tracking_token

3. Update Clicked Timestamp
   - If clicked_at IS NULL:
     * Set clicked_at = now()

4. Redirect
   - Status: 302 Found
   - Location header: url
```

---

## Member Management Endpoints Implementation

### 1. GET /members

**Purpose**: List all members with filters and pagination

**Implementation Steps**:
1. Create GET endpoint
2. Add query parameters for filtering
3. Query members table with joins to activity
4. Apply pagination
5. Return members with pagination

**Xano Function Stack**:
```
1. Get Query Parameters
   - role (optional)
   - status (optional)
   - search (optional)
   - page (default: 1)
   - per_page (default: 20)

2. Query Database
   - Table: members
   - Left Join: member_activity on member_id
   - Filters:
     * role = {role} (if provided)
     * status = {status} (if provided)
     * name LIKE %{search}% OR email LIKE %{search}% (if search)
   - Sort: created_at DESC
   - Pagination: offset, limit

3. Count Total Records

4. Return Response
   {
     "members": [...],
     "pagination": {...}
   }
```

---

### 2. POST /members

**Purpose**: Create new member

**Implementation Steps**:
1. Create POST endpoint
2. Validate required fields
3. Check email uniqueness
4. Insert member record
5. Create member_activity record
6. Return created member

**Xano Function Stack**:
```
1. Get Request Body
   - name (required)
   - email (required)
   - role (default: 'member')
   - status (default: 'active')
   - phone, bio, location, website
   - social_links (json)
   - preferences (json)
   - avatar_url

2. Validate Input
   - Check name not empty
   - Check email not empty
   - Check email format
   - Check email uniqueness

3. Insert Member
   - Table: members
   - Set created_at = now()

4. Create Activity Record
   - Table: member_activity
   - member_id = new member id
   - posts = 0, comments = 0, likes = 0

5. Return Created Member
```

---

### 3. GET /members/{member_id}

**Purpose**: Get single member with details

**Implementation Steps**:
1. Create GET endpoint
2. Query member by ID
3. Join with activity data
4. Get recent activity
5. Return member with full details

**Xano Function Stack**:
```
1. Get Path Parameter
   - member_id

2. Query Member
   - Table: members
   - Join: member_activity
   - Filter: id = member_id

3. Get Recent Activity (optional)
   - Query recent posts, comments from other tables
   - Limit to last 10 activities

4. Return Member
   {
     ...member_fields,
     "activity_counts": {
       "posts": posts,
       "comments": comments,
       "likes": likes
     },
     "recent_activity": [...]
   }
```

---

### 4. PATCH /members/{member_id}

**Purpose**: Update member

**Implementation Steps**:
1. Create PATCH endpoint
2. Query member
3. Update provided fields
4. Return updated member

**Xano Function Stack**:
```
1. Get Path Parameter & Body
   - member_id
   - Update fields

2. Query Member
   - Validate exists

3. Update Record
   - Table: members
   - Update provided fields
   - Set updated_at = now()

4. Return Updated Member
```

---

### 5. DELETE /members/{member_id}

**Purpose**: Delete member

**Implementation Steps**:
1. Create DELETE endpoint
2. Delete member_activity record
3. Delete member record
4. Return success

**Xano Function Stack**:
```
1. Get Path Parameter
   - member_id

2. Delete Activity Record
   - Table: member_activity
   - Filter: member_id = member_id

3. Delete Member
   - Table: members
   - Filter: id = member_id

4. Return Success
```

---

### 6. POST /members/bulk-update

**Purpose**: Update multiple members at once

**Implementation Steps**:
1. Create POST endpoint
2. Get member IDs and updates
3. Loop through members and update
4. Return count of updated members

**Xano Function Stack**:
```
1. Get Request Body
   - member_ids (array)
   - updates (object)

2. Validate Input
   - Check member_ids is array
   - Check updates is object

3. Update Members
   - For each member_id:
     * Update members table
     * Apply updates object fields
     * Set updated_at = now()

4. Return Result
   {
     "success": true,
     "updated_count": count
   }
```

---

### 7. POST /members/{member_id}/activity

**Purpose**: Update activity counters

**Implementation Steps**:
1. Create POST endpoint
2. Get activity type and increment
3. Update member_activity record
4. Update last_active timestamp
5. Return updated member

**Xano Function Stack**:
```
1. Get Path Parameter & Body
   - member_id
   - activity_type ('post', 'comment', 'like')
   - increment (default: 1)

2. Query Member Activity
   - Table: member_activity
   - Filter: member_id = member_id

3. Update Activity Counter
   - Increment the appropriate field:
     * If activity_type = 'post': posts = posts + increment
     * If activity_type = 'comment': comments = comments + increment
     * If activity_type = 'like': likes = likes + increment

4. Update Member Last Active
   - Table: members
   - Set last_active = now()

5. Return Updated Member with Activity Counts
```

---

### 8. GET /members/stats

**Purpose**: Get member statistics

**Implementation Steps**:
1. Create GET endpoint
2. Calculate various statistics
3. Get top contributors
4. Return stats object

**Xano Function Stack**:
```
1. Calculate Statistics
   - Total members: COUNT(*)
   - Active: COUNT WHERE status = 'active'
   - Inactive: COUNT WHERE status = 'inactive'
   - Suspended: COUNT WHERE status = 'suspended'
   - New this month: COUNT WHERE created_at >= start of month
   - By role: GROUP BY role
   - By status: GROUP BY status

2. Get Top Contributors
   - Query members
   - Join member_activity
   - Calculate total_activity = posts + comments + likes
   - Order by total_activity DESC
   - Limit 10

3. Return Statistics
   {
     "total": total,
     "active": active_count,
     "inactive": inactive_count,
     "suspended": suspended_count,
     "new_this_month": new_count,
     "by_role": {...},
     "by_status": {...},
     "top_contributors": [...]
   }
```

---

### 9. GET /members/search

**Purpose**: Search members

**Implementation Steps**:
1. Create GET endpoint
2. Get search query and limit
3. Search in name, email, bio
4. Return matching members

**Xano Function Stack**:
```
1. Get Query Parameters
   - q (search query, required)
   - limit (default: 10)

2. Search Members
   - Table: members
   - Filter: 
     * name LIKE %{q}% OR
     * email LIKE %{q}% OR
     * bio LIKE %{q}%
   - Limit: limit

3. Return Results
   {
     "results": [...],
     "count": count
   }
```

---

### 10. GET /members/export

**Purpose**: Export members to CSV

**Implementation Steps**:
1. Create GET endpoint
2. Query members with filters
3. Format as CSV
4. Return CSV file

**Xano Function Stack**:
```
1. Get Query Parameters
   - role (optional)
   - status (optional)

2. Query Members
   - Table: members
   - Join: member_activity
   - Apply filters

3. Format as CSV
   - Headers: ID, Name, Email, Role, Status, Phone, Location, Created At, Last Active, Posts, Comments, Likes
   - Rows: Format each member as CSV row

4. Return CSV
   - Content-Type: text/csv
   - Content-Disposition: attachment; filename="members-export.csv"
   - Body: CSV string
```

---

## Testing the Implementation

After implementing the endpoints in Xano, run the test scripts:

```bash
# Test Email Campaign endpoints
node test-email-campaign-endpoints.js

# Test Member Management endpoints
node test-member-management-endpoints.js
```

Both test scripts will:
- Test all CRUD operations
- Validate request/response formats
- Check error handling
- Verify data integrity

---

## Integration with Frontend

The frontend services are already implemented and ready to use:

### Email Campaigns
```javascript
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  sendCampaign,
  getCampaignAnalytics,
  trackEmailOpen,
  trackLinkClick
} from './services/email/emailCampaignService';
```

### Member Management
```javascript
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  bulkUpdateMembers,
  updateMemberActivity,
  getMemberStats,
  searchMembers,
  exportMembers
} from './services/memberManagementService';
```

---

## Security Considerations

1. **Authentication**: All endpoints should require API key authentication
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Input Validation**: Validate all input data in Xano
4. **SQL Injection**: Use parameterized queries (Xano handles this automatically)
5. **Email Validation**: Validate email formats before storing
6. **Tracking Tokens**: Use UUIDs or secure hashes for tracking tokens

---

## Next Steps

1. Implement all endpoints in Xano following this guide
2. Test each endpoint using the provided test scripts
3. Integrate with SendGrid for actual email sending
4. Set up webhook handlers for email events (opens, clicks, bounces)
5. Configure CORS settings in Xano for frontend access
6. Set up monitoring and logging for production use

---

## Support

For questions or issues:
- Review the API specification: `XANO_API_ENDPOINTS_SPECIFICATION.md`
- Check test scripts for expected behavior
- Refer to existing Xano documentation
- Contact the development team
