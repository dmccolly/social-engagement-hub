# 🤖 Complete Xano Setup - Copy & Paste Instructions

## Quick Setup Using Xano AI

### Step 1: Create Tables First

Copy and paste this prompt into Xano AI:

```
Create 5 database tables for an email marketing system:

TABLE 1: email_contacts
Fields:
- id: integer, primary key, auto-increment
- email: text, required, unique
- first_name: text
- last_name: text
- status: text, required, default "subscribed"
- member_type: text
- created_at: timestamp, auto-set on create
- updated_at: timestamp, auto-update

Add indexes on: email (unique), status, member_type

TABLE 2: email_groups
Fields:
- id: integer, primary key, auto-increment
- name: text, required, max 100 characters
- description: text
- created_at: timestamp, auto-set on create

Add index on: name

TABLE 3: contact_groups
Fields:
- id: integer, primary key, auto-increment
- contact_id: integer, required, foreign key to email_contacts.id
- group_id: integer, required, foreign key to email_groups.id
- added_at: timestamp, auto-set on create

Add indexes on: contact_id, group_id
Add unique constraint on: (contact_id, group_id) combination

TABLE 4: email_campaigns
Fields:
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

Add indexes on: status, scheduled_at, sent_at

TABLE 5: campaign_sends
Fields:
- id: integer, primary key, auto-increment
- campaign_id: integer, required, foreign key to email_campaigns.id
- contact_id: integer, required, foreign key to email_contacts.id
- sendgrid_message_id: text
- sent_at: timestamp, auto-set on create
- opened_at: timestamp
- clicked_at: timestamp
- bounced: boolean, default false
- unsubscribed: boolean, default false

Add indexes on: campaign_id, contact_id, sent_at
```

---

### Step 2: Create API Endpoints

After tables are created, copy and paste this prompt into Xano AI:

```
Create 11 API endpoints for the email marketing system:

ENDPOINT 1: GET /email_contacts
- Query the email_contacts table
- Return all records ordered by created_at DESC
- Support optional query parameters:
  * status: filter by status field
  * member_type: filter by member_type field
  * search: search in email, first_name, or last_name fields (use LIKE with wildcards)
- Return array of contact objects

ENDPOINT 2: GET /email_contacts/{id}
- Query email_contacts table
- Filter by id parameter
- Return single contact object
- Return 404 if not found

ENDPOINT 3: POST /email_contacts
- Insert into email_contacts table
- Required input: email (validate email format)
- Optional inputs: first_name, last_name, status, member_type
- Set created_at and updated_at to current timestamp
- Return the created contact object with id

ENDPOINT 4: PATCH /email_contacts/{id}
- Update email_contacts table
- Filter by id parameter
- Accept partial updates for: email, first_name, last_name, status, member_type
- Update updated_at to current timestamp
- Return updated contact object
- Return 404 if not found

ENDPOINT 5: DELETE /email_contacts/{id}
- Delete from email_contacts table
- Filter by id parameter
- Also delete related records from contact_groups table (cascade delete)
- Return success message
- Return 404 if not found

ENDPOINT 6: GET /email_groups
- Query email_groups table
- Return all records ordered by name ASC
- For each group, include a count of contacts (count from contact_groups table)
- Return array of group objects

ENDPOINT 7: GET /email_groups/{id}
- Query email_groups table
- Filter by id parameter
- Include count of contacts in this group
- Return single group object
- Return 404 if not found

ENDPOINT 8: POST /email_groups
- Insert into email_groups table
- Required input: name
- Optional input: description
- Set created_at to current timestamp
- Return the created group object with id

ENDPOINT 9: PATCH /email_groups/{id}
- Update email_groups table
- Filter by id parameter
- Accept updates for: name, description
- Return updated group object
- Return 404 if not found

ENDPOINT 10: DELETE /email_groups/{id}
- Delete from email_groups table
- Filter by id parameter
- Also delete related records from contact_groups table (cascade delete)
- Return success message
- Return 404 if not found

ENDPOINT 11: GET /email_groups/{group_id}/contacts
- Join email_contacts with contact_groups tables
- Filter by group_id parameter
- Return all contacts in this group
- Order by contact first_name, last_name
- Return array of contact objects
- Return empty array if group has no contacts

For all endpoints:
- Enable CORS
- Add proper error handling
- Return appropriate HTTP status codes
- Validate required fields
```

---

### Step 3: Verify Tables Were Created

1. Go to **Database** section in Xano
2. Confirm you see these 5 tables:
   - ✅ email_contacts
   - ✅ email_groups
   - ✅ contact_groups
   - ✅ email_campaigns
   - ✅ campaign_sends

3. Click on **email_contacts** table
4. Verify fields are correct:
   - id, email, first_name, last_name, status, member_type, created_at, updated_at

---

### Step 4: Verify Endpoints Were Created

1. Go to **API** section in Xano
2. Confirm you see these 11 endpoints:
   - ✅ GET /email_contacts
   - ✅ GET /email_contacts/{id}
   - ✅ POST /email_contacts
   - ✅ PATCH /email_contacts/{id}
   - ✅ DELETE /email_contacts/{id}
   - ✅ GET /email_groups
   - ✅ GET /email_groups/{id}
   - ✅ POST /email_groups
   - ✅ PATCH /email_groups/{id}
   - ✅ DELETE /email_groups/{id}
   - ✅ GET /email_groups/{group_id}/contacts

---

### Step 5: Test Endpoints in Xano

#### Test 1: Create a Contact

1. Select **POST /email_contacts**
2. Click **"Run & Debug"**
3. Enter test data:
```json
{
  "email": "test@example.com",
  "first_name": "Test",
  "last_name": "User",
  "status": "subscribed",
  "member_type": "member"
}
```
4. Click **"Run"**
5. Should return the created contact with an ID

#### Test 2: Get All Contacts

1. Select **GET /email_contacts**
2. Click **"Run & Debug"**
3. Click **"Run"**
4. Should return array with your test contact

#### Test 3: Create a Group

1. Select **POST /email_groups**
2. Click **"Run & Debug"**
3. Enter test data:
```json
{
  "name": "Newsletter Subscribers",
  "description": "All newsletter subscribers"
}
```
4. Click **"Run"**
5. Should return the created group with an ID

---

### Step 6: Configure CORS

1. Go to **API** → **Settings** → **CORS**
2. Click **"Add Origin"**
3. Add these URLs (one at a time):
   - `https://deploy-preview-15--gleaming-cendol-417bf3.netlify.app`
   - `https://gleaming-cendol-417bf3.netlify.app`
4. For each origin, enable these methods:
   - ✅ GET
   - ✅ POST
   - ✅ PATCH
   - ✅ DELETE
   - ✅ PUT
   - ✅ HEAD
   - ✅ OPTIONS
5. Click **"Save"**

---

### Step 7: Get Your API URL

1. Go to **API** → **Settings**
2. Look for **"Base URL"** or **"API URL"**
3. Copy the URL - it looks like:
   ```
   https://xxxx-xxxx-xxxx.n7.xano.io/api:xxxxxxxx
   ```
4. Save this URL - you'll need it for Netlify

---

### Step 8: Add Sample Data (Optional but Recommended)

Create a few more test contacts so you have data to work with:

**Contact 2:**
```json
{
  "email": "jane@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "status": "subscribed",
  "member_type": "non-member"
}
```

**Contact 3:**
```json
{
  "email": "bob@example.com",
  "first_name": "Bob",
  "last_name": "Johnson",
  "status": "unsubscribed",
  "member_type": "member"
}
```

**Contact 4:**
```json
{
  "email": "alice@example.com",
  "first_name": "Alice",
  "last_name": "Williams",
  "status": "subscribed",
  "member_type": "member"
}
```

---

## ✅ Verification Checklist

Before proceeding to Netlify configuration:

- [ ] All 5 tables created in Xano
- [ ] All 11 endpoints created in Xano
- [ ] Successfully created a test contact via POST endpoint
- [ ] Successfully retrieved contacts via GET endpoint
- [ ] Successfully created a test group via POST endpoint
- [ ] CORS configured with both preview and production URLs
- [ ] All HTTP methods enabled in CORS
- [ ] API Base URL copied and saved
- [ ] At least 3-4 test contacts created

---

## 🎯 Next Step: Configure Netlify

Once all items above are checked, proceed to:
1. Add your Xano API URL to Netlify environment variables
2. Follow instructions in **FINAL_SETUP_STEPS.md**

---

## 🆘 Troubleshooting

### Issue: Xano AI didn't create tables
**Solution**: 
- Try creating tables manually using the field specifications
- Or break the prompt into smaller chunks (one table at a time)

### Issue: Endpoints return errors
**Solution**:
- Check that table names match exactly (email_contacts, not emailContacts)
- Verify foreign key relationships are set up correctly
- Test each endpoint individually in Xano playground

### Issue: Can't find API URL
**Solution**:
- Go to API section → Click on any endpoint → Look at the URL in the address bar
- The base URL is everything before the endpoint name

---

**Ready?** Start with Step 1 and work through each step! 🚀