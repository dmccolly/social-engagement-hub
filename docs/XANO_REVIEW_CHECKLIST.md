# Xano Tables Review & Setup Checklist

## Purpose
Review existing Xano tables and verify they match requirements for the email marketing system.

---

## Required Tables for Email System

### Phase 1 (Immediate Need - Contact Management)
These tables are needed NOW for the current email system to work:

#### ✅ Table 1: email_contacts
**Purpose**: Store all email contacts (members and non-members)

**Required Fields**:
```
- id: integer, primary key, auto-increment
- email: text, required, unique
- first_name: text
- last_name: text
- status: text, required, default "subscribed"
- member_type: text
- created_at: timestamp, auto-set on create
- updated_at: timestamp, auto-update
```

**Indexes**:
- email (unique)
- status
- member_type

**Status**: ⏳ NEEDS VERIFICATION

---

#### ✅ Table 2: email_groups
**Purpose**: Organize contacts into groups

**Required Fields**:
```
- id: integer, primary key, auto-increment
- name: text, required, max 100 characters
- description: text
- created_at: timestamp, auto-set on create
```

**Indexes**:
- name

**Status**: ⏳ NEEDS VERIFICATION

---

#### ✅ Table 3: contact_groups
**Purpose**: Junction table linking contacts to groups (many-to-many)

**Required Fields**:
```
- id: integer, primary key, auto-increment
- contact_id: integer, required, foreign key to email_contacts.id
- group_id: integer, required, foreign key to email_groups.id
- added_at: timestamp, auto-set on create
```

**Indexes**:
- contact_id
- group_id
- Unique constraint on (contact_id, group_id)

**Status**: ⏳ NEEDS VERIFICATION

---

### Phase 2+ (Future - Campaign Management)
These tables are for future phases but can be created now:

#### ⏳ Table 4: email_campaigns
**Purpose**: Store email campaigns and newsletters

**Required Fields**:
```
- id: integer, primary key, auto-increment
- name: text, required
- subject: text, required
- preview_text: text
- html_content: text (long text), required
- status: text, required, default "draft"
- scheduled_at: timestamp
- sent_at: timestamp
- recipient_count: integer, default 0
- created_at: timestamp, auto-set on create
- updated_at: timestamp, auto-update
```

**Indexes**:
- status
- scheduled_at
- sent_at

**Status**: ⏳ OPTIONAL FOR NOW

---

#### ⏳ Table 5: campaign_sends
**Purpose**: Track individual email sends and engagement

**Required Fields**:
```
- id: integer, primary key, auto-increment
- campaign_id: integer, required, foreign key to email_campaigns.id
- contact_id: integer, required, foreign key to email_contacts.id
- sendgrid_message_id: text
- sent_at: timestamp, auto-set on create
- opened_at: timestamp
- clicked_at: timestamp
- bounced: boolean, default false
- unsubscribed: boolean, default false
```

**Indexes**:
- campaign_id
- contact_id
- sent_at

**Status**: ⏳ OPTIONAL FOR NOW

---

## Existing Blog Tables (Do Not Modify)

Your Xano workspace likely already has these tables for the blog system:

- `blog_posts` - Blog post content
- `blog_categories` - Post categories
- `blog_tags` - Post tags
- `blog_authors` - Author information
- (and possibly others)

**IMPORTANT**: Do NOT modify or delete these tables. The email system tables are completely separate.

---

## Review Process

### Step 1: Log into Xano
1. Go to https://app.xano.com
2. Log into your workspace
3. Navigate to the **Database** section

### Step 2: Check Existing Tables
Look for these tables and mark which ones exist:

**Email System Tables**:
- [ ] email_contacts
- [ ] email_groups
- [ ] contact_groups
- [ ] email_campaigns
- [ ] campaign_sends

**Blog System Tables** (should already exist):
- [ ] blog_posts (or similar)
- [ ] Other blog-related tables

### Step 3: Verify Table Structure
For each email table that exists, verify:

**For email_contacts**:
- [ ] Has all required fields
- [ ] Email field is unique
- [ ] Status has default value "subscribed"
- [ ] Has proper indexes

**For email_groups**:
- [ ] Has all required fields
- [ ] Name field has max length
- [ ] Has proper indexes

**For contact_groups**:
- [ ] Has all required fields
- [ ] Has foreign keys to email_contacts and email_groups
- [ ] Has unique constraint on (contact_id, group_id)
- [ ] Has proper indexes

### Step 4: Check API Endpoints
Navigate to **API** section and verify these endpoints exist:

**Contact Endpoints** (Required for Phase 1):
- [ ] GET /email_contacts
- [ ] GET /email_contacts/{id}
- [ ] POST /email_contacts
- [ ] PATCH /email_contacts/{id}
- [ ] DELETE /email_contacts/{id}

**Group Endpoints** (Required for Phase 1):
- [ ] GET /email_groups
- [ ] GET /email_groups/{id}
- [ ] POST /email_groups
- [ ] PATCH /email_groups/{id}
- [ ] DELETE /email_groups/{id}
- [ ] GET /email_groups/{group_id}/contacts

### Step 5: Test Endpoints
In Xano's API playground, test:

1. **Create a test contact**:
   - Endpoint: POST /email_contacts
   - Body: `{"email": "test@example.com", "first_name": "Test", "last_name": "User", "status": "subscribed", "member_type": "member"}`
   - Expected: Returns created contact with ID

2. **Get all contacts**:
   - Endpoint: GET /email_contacts
   - Expected: Returns array with test contact

3. **Create a test group**:
   - Endpoint: POST /email_groups
   - Body: `{"name": "Test Group", "description": "Testing"}`
   - Expected: Returns created group with ID

---

## What to Report Back

Please provide this information:

### Existing Tables:
```
Email System Tables Found:
- [ ] email_contacts - [YES/NO] - [Issues if any]
- [ ] email_groups - [YES/NO] - [Issues if any]
- [ ] contact_groups - [YES/NO] - [Issues if any]
- [ ] email_campaigns - [YES/NO] - [Issues if any]
- [ ] campaign_sends - [YES/NO] - [Issues if any]

Blog System Tables Found:
- [ ] [List any blog-related tables]
```

### Existing Endpoints:
```
Contact Endpoints:
- [ ] GET /email_contacts - [YES/NO]
- [ ] POST /email_contacts - [YES/NO]
- [ ] PATCH /email_contacts/{id} - [YES/NO]
- [ ] DELETE /email_contacts/{id} - [YES/NO]

Group Endpoints:
- [ ] GET /email_groups - [YES/NO]
- [ ] POST /email_groups - [YES/NO]
- [ ] GET /email_groups/{group_id}/contacts - [YES/NO]
```

### Test Results:
```
- [ ] Successfully created test contact
- [ ] Successfully retrieved contacts
- [ ] Successfully created test group
```

### Your Xano API URL:
```
Base URL: [Your Xano API URL here]
Example: https://xxxx-xxxx-xxxx.n7.xano.io/api:xxxxxxxx
```

---

## Next Steps Based on Review

### Scenario A: No Email Tables Exist
**Action**: Create all tables using Xano AI
- Follow: docs/setup/XANO_COMPLETE_SETUP.md
- Time: ~15 minutes
- Create tables 1-3 (Phase 1)
- Optionally create tables 4-5 (Phase 2+)

### Scenario B: Some Email Tables Exist
**Action**: Review and complete missing tables
- Check which tables are missing
- Verify existing tables match requirements
- Create missing tables manually or with Xano AI

### Scenario C: All Email Tables Exist
**Action**: Verify structure and test
- Verify all fields match requirements
- Test all endpoints
- Add sample data
- Configure CORS
- Connect to application

### Scenario D: Tables Exist But Structure is Wrong
**Action**: Modify or recreate tables
- Document differences
- Decide: modify existing or create new
- Update table structure
- Re-test endpoints

---

## After Review is Complete

Once you've verified the tables, we need to:

1. **Get your Xano API URL**
   - Copy from Xano API settings
   - Format: `https://xxxx-xxxx-xxxx.n7.xano.io/api:xxxxxxxx`

2. **Configure CORS**
   - Add preview URL: `https://deploy-preview-15--gleaming-cendol-417bf3.netlify.app`
   - Add production URL: `https://gleaming-cendol-417bf3.netlify.app`
   - Enable all HTTP methods

3. **Update Netlify Environment Variable**
   - Add `REACT_APP_XANO_BASE_URL` with your API URL
   - Trigger new deployment

4. **Test the Email System**
   - Navigate to `/email` route
   - Try adding a contact
   - Verify it saves to Xano

---

## Quick Reference

**Documentation**:
- Full setup guide: docs/setup/XANO_COMPLETE_SETUP.md
- Required endpoints: docs/setup/REQUIRED_ENDPOINTS.md
- Setup steps: docs/setup/FINAL_SETUP_STEPS.md

**Mock Server** (for testing without Xano):
- URL: https://3001-5d9e7734-3a2f-413f-9e26-1be62a873c8e.proxy.daytona.works
- Status: Running with sample data
- Use this to test the UI while setting up Xano

---

**Please review your Xano workspace and report back with the checklist results!**