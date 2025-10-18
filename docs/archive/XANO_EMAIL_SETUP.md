# 🗄️ Xano Database Setup for Email System

## Overview
This guide will help you set up the Xano database tables for the email marketing system. These tables are completely separate from your existing blog tables.

---

## 📋 Tables to Create

### 1. email_contacts

**Purpose**: Store all email contacts (members and non-members)

**Fields**:
| Field Name | Type | Properties | Description |
|------------|------|------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique identifier |
| email | Text | Required, Unique | Contact's email address |
| first_name | Text | Optional | Contact's first name |
| last_name | Text | Optional | Contact's last name |
| status | Text | Required, Default: 'subscribed' | Status: 'subscribed', 'unsubscribed', 'bounced' |
| member_type | Text | Optional | Type: 'member', 'non-member' |
| created_at | Timestamp | Auto-set on create | When contact was added |
| updated_at | Timestamp | Auto-update | When contact was last modified |

**Indexes**:
- email (unique)
- status
- member_type

---

### 2. email_groups

**Purpose**: Organize contacts into groups (e.g., "Newsletter Subscribers", "Members")

**Fields**:
| Field Name | Type | Properties | Description |
|------------|------|------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique identifier |
| name | Text | Required, Max: 100 | Group name |
| description | Text | Optional | Group description |
| created_at | Timestamp | Auto-set on create | When group was created |

**Indexes**:
- name

---

### 3. contact_groups

**Purpose**: Junction table linking contacts to groups (many-to-many relationship)

**Fields**:
| Field Name | Type | Properties | Description |
|------------|------|------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique identifier |
| contact_id | Integer | Required, Foreign Key | Reference to email_contacts.id |
| group_id | Integer | Required, Foreign Key | Reference to email_groups.id |
| added_at | Timestamp | Auto-set on create | When contact was added to group |

**Indexes**:
- contact_id
- group_id
- Unique constraint on (contact_id, group_id)

---

### 4. email_campaigns

**Purpose**: Store email campaigns and newsletters

**Fields**:
| Field Name | Type | Properties | Description |
|------------|------|------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique identifier |
| name | Text | Required | Campaign name (internal) |
| subject | Text | Required | Email subject line |
| preview_text | Text | Optional | Email preview/preheader text |
| html_content | Text (Long) | Required | Email HTML content |
| status | Text | Required, Default: 'draft' | Status: 'draft', 'scheduled', 'sent' |
| scheduled_at | Timestamp | Optional | When to send (if scheduled) |
| sent_at | Timestamp | Optional | When campaign was sent |
| recipient_count | Integer | Default: 0 | Number of recipients |
| created_at | Timestamp | Auto-set on create | When campaign was created |
| updated_at | Timestamp | Auto-update | When campaign was last modified |

**Indexes**:
- status
- scheduled_at
- sent_at

---

### 5. campaign_sends

**Purpose**: Track individual email sends and engagement

**Fields**:
| Field Name | Type | Properties | Description |
|------------|------|------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique identifier |
| campaign_id | Integer | Required, Foreign Key | Reference to email_campaigns.id |
| contact_id | Integer | Required, Foreign Key | Reference to email_contacts.id |
| sendgrid_message_id | Text | Optional | SendGrid message ID for tracking |
| sent_at | Timestamp | Auto-set on create | When email was sent |
| opened_at | Timestamp | Optional | When email was opened |
| clicked_at | Timestamp | Optional | When link was clicked |
| bounced | Boolean | Default: false | Whether email bounced |
| unsubscribed | Boolean | Default: false | Whether user unsubscribed |

**Indexes**:
- campaign_id
- contact_id
- sent_at

---

## 🔧 API Endpoints to Create

### Contact Management

#### 1. GET /email_contacts
**Purpose**: Get all contacts with optional filtering
**Query Parameters**:
- status (optional): Filter by status
- member_type (optional): Filter by member type
- group_id (optional): Filter by group
- search (optional): Search by name or email

#### 2. POST /email_contacts
**Purpose**: Create a new contact
**Body**:
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "member_type": "member",
  "status": "subscribed"
}
```

#### 3. GET /email_contacts/{id}
**Purpose**: Get a single contact by ID

#### 4. PATCH /email_contacts/{id}
**Purpose**: Update a contact
**Body**: Same as POST (partial updates allowed)

#### 5. DELETE /email_contacts/{id}
**Purpose**: Delete a contact

---

### Group Management

#### 6. GET /email_groups
**Purpose**: Get all groups

#### 7. POST /email_groups
**Purpose**: Create a new group
**Body**:
```json
{
  "name": "Newsletter Subscribers",
  "description": "People who signed up for the newsletter"
}
```

#### 8. PATCH /email_groups/{id}
**Purpose**: Update a group

#### 9. DELETE /email_groups/{id}
**Purpose**: Delete a group

#### 10. POST /email_groups/{group_id}/contacts
**Purpose**: Add contacts to a group
**Body**:
```json
{
  "contact_ids": [1, 2, 3, 4]
}
```

#### 11. DELETE /email_groups/{group_id}/contacts/{contact_id}
**Purpose**: Remove a contact from a group

#### 12. GET /email_groups/{group_id}/contacts
**Purpose**: Get all contacts in a group

---

### Campaign Management

#### 13. GET /email_campaigns
**Purpose**: Get all campaigns

#### 14. POST /email_campaigns
**Purpose**: Create a new campaign
**Body**:
```json
{
  "name": "October Newsletter",
  "subject": "Your Monthly Update",
  "preview_text": "Check out what's new this month",
  "html_content": "<html>...</html>",
  "status": "draft"
}
```

#### 15. GET /email_campaigns/{id}
**Purpose**: Get a single campaign

#### 16. PATCH /email_campaigns/{id}
**Purpose**: Update a campaign

#### 17. DELETE /email_campaigns/{id}
**Purpose**: Delete a campaign

#### 18. POST /email_campaigns/{id}/send
**Purpose**: Send a campaign
**Body**:
```json
{
  "group_ids": [1, 2],
  "contact_ids": [5, 6, 7]
}
```

---

## 🚀 Quick Setup Steps

### Step 1: Create Tables
1. Log into Xano
2. Go to Database
3. Create each table listed above
4. Add all fields with correct types
5. Set up indexes

### Step 2: Create API Endpoints
1. Go to API section
2. Create each endpoint listed above
3. Connect to appropriate tables
4. Test endpoints in Xano

### Step 3: Test Endpoints
Use Xano's built-in API tester to verify:
- Can create contacts
- Can create groups
- Can add contacts to groups
- Can create campaigns

### Step 4: Get API URL
Copy your Xano API base URL:
```
https://xajo-bs7d-cagt.n7e.xano.io/api:pYeQctVX
```

---

## 📝 Sample Data for Testing

### Sample Contacts
```json
[
  {
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "member_type": "member",
    "status": "subscribed"
  },
  {
    "email": "jane@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "member_type": "non-member",
    "status": "subscribed"
  }
]
```

### Sample Groups
```json
[
  {
    "name": "Newsletter Subscribers",
    "description": "All newsletter subscribers"
  },
  {
    "name": "Members",
    "description": "Active members"
  },
  {
    "name": "Non-Members",
    "description": "Non-member contacts"
  }
]
```

---

## ✅ Verification Checklist

Before proceeding with development:
- [ ] All 5 tables created
- [ ] All fields added with correct types
- [ ] Indexes created
- [ ] All 18 API endpoints created
- [ ] Endpoints tested in Xano
- [ ] Sample data added for testing
- [ ] API URL copied for use in app

---

## 🆘 Troubleshooting

### Issue: Can't create unique constraint on email
**Solution**: Make sure no duplicate emails exist before adding constraint

### Issue: Foreign key errors
**Solution**: Ensure referenced tables exist first (create email_contacts and email_groups before contact_groups)

### Issue: Endpoint returns empty
**Solution**: Check that table has data and query is correct

---

**Next Step**: Once Xano is set up, we'll integrate it with the React app!