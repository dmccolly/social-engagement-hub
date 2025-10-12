# 🤖 Xano AI Setup Instructions - Email Marketing System

Copy and paste this entire prompt into Xano AI to automatically create all tables and endpoints.

---

## PROMPT FOR XANO AI:

```
Create a complete email marketing system database with the following specifications:

## TABLES TO CREATE:

### Table 1: email_contacts
Create a table named "email_contacts" with these fields:
- id: integer, primary key, auto-increment
- email: text, required, unique index
- first_name: text, optional
- last_name: text, optional
- status: text, required, default value "subscribed", indexed
- member_type: text, optional, indexed
- created_at: timestamp, auto-set on create
- updated_at: timestamp, auto-update on modify

### Table 2: email_groups
Create a table named "email_groups" with these fields:
- id: integer, primary key, auto-increment
- name: text, required, max length 100, indexed
- description: text, optional
- created_at: timestamp, auto-set on create

### Table 3: contact_groups
Create a table named "contact_groups" with these fields:
- id: integer, primary key, auto-increment
- contact_id: integer, required, foreign key to email_contacts.id, indexed
- group_id: integer, required, foreign key to email_groups.id, indexed
- added_at: timestamp, auto-set on create
- Add a unique constraint on the combination of contact_id and group_id

### Table 4: email_campaigns
Create a table named "email_campaigns" with these fields:
- id: integer, primary key, auto-increment
- name: text, required
- subject: text, required
- preview_text: text, optional
- html_content: text (long text), required
- status: text, required, default value "draft", indexed
- scheduled_at: timestamp, optional, indexed
- sent_at: timestamp, optional, indexed
- recipient_count: integer, default value 0
- created_at: timestamp, auto-set on create
- updated_at: timestamp, auto-update on modify

### Table 5: campaign_sends
Create a table named "campaign_sends" with these fields:
- id: integer, primary key, auto-increment
- campaign_id: integer, required, foreign key to email_campaigns.id, indexed
- contact_id: integer, required, foreign key to email_contacts.id, indexed
- sendgrid_message_id: text, optional
- sent_at: timestamp, auto-set on create, indexed
- opened_at: timestamp, optional
- clicked_at: timestamp, optional
- bounced: boolean, default value false
- unsubscribed: boolean, default value false

## API ENDPOINTS TO CREATE:

### Contact Management Endpoints:

1. GET /email_contacts
   - Return all contacts from email_contacts table
   - Order by created_at descending
   - Support optional query parameters: status, member_type, search (search in email, first_name, last_name)

2. POST /email_contacts
   - Create new contact in email_contacts table
   - Required input: email
   - Optional inputs: first_name, last_name, status, member_type
   - Return the created contact

3. GET /email_contacts/{id}
   - Return single contact by id from email_contacts table
   - Return 404 if not found

4. PATCH /email_contacts/{id}
   - Update contact in email_contacts table
   - Accept partial updates for: email, first_name, last_name, status, member_type
   - Return updated contact

5. DELETE /email_contacts/{id}
   - Delete contact from email_contacts table
   - Also delete related records in contact_groups table
   - Return success message

6. POST /email_contacts/bulk_delete
   - Accept array of contact IDs
   - Delete multiple contacts and their related records
   - Return count of deleted contacts

### Group Management Endpoints:

7. GET /email_groups
   - Return all groups from email_groups table
   - Order by name ascending
   - Include count of contacts in each group

8. POST /email_groups
   - Create new group in email_groups table
   - Required input: name
   - Optional input: description
   - Return the created group

9. GET /email_groups/{id}
   - Return single group by id
   - Include count of contacts in the group
   - Return 404 if not found

10. PATCH /email_groups/{id}
    - Update group in email_groups table
    - Accept updates for: name, description
    - Return updated group

11. DELETE /email_groups/{id}
    - Delete group from email_groups table
    - Also delete related records in contact_groups table
    - Return success message

12. GET /email_groups/{group_id}/contacts
    - Return all contacts in a specific group
    - Join email_contacts with contact_groups
    - Order by contact name

13. POST /email_groups/{group_id}/contacts
    - Add contacts to a group
    - Accept array of contact_ids
    - Create records in contact_groups table
    - Skip if contact already in group
    - Return count of contacts added

14. DELETE /email_groups/{group_id}/contacts/{contact_id}
    - Remove contact from group
    - Delete record from contact_groups table
    - Return success message

### Campaign Management Endpoints:

15. GET /email_campaigns
    - Return all campaigns from email_campaigns table
    - Order by created_at descending
    - Support optional query parameter: status

16. POST /email_campaigns
    - Create new campaign in email_campaigns table
    - Required inputs: name, subject, html_content
    - Optional inputs: preview_text, status, scheduled_at
    - Return the created campaign

17. GET /email_campaigns/{id}
    - Return single campaign by id
    - Include recipient_count
    - Return 404 if not found

18. PATCH /email_campaigns/{id}
    - Update campaign in email_campaigns table
    - Accept updates for: name, subject, preview_text, html_content, status, scheduled_at
    - Return updated campaign

19. DELETE /email_campaigns/{id}
    - Delete campaign from email_campaigns table
    - Also delete related records in campaign_sends table
    - Return success message

20. POST /email_campaigns/{id}/send
    - Mark campaign as sent
    - Update status to "sent"
    - Set sent_at to current timestamp
    - Accept group_ids and/or contact_ids arrays
    - Create records in campaign_sends table for each recipient
    - Update recipient_count
    - Return campaign with send statistics

## ADDITIONAL REQUIREMENTS:

- Enable CORS for all endpoints
- Set up proper error handling for all endpoints
- Add validation for email format in email_contacts
- Ensure foreign key constraints are properly enforced
- Add cascade delete for related records

Please create all tables and endpoints as specified above.
```

---

## After Xano AI Creates Everything:

### Step 1: Verify Tables
Go to Database section and confirm all 5 tables exist with correct fields.

### Step 2: Verify Endpoints
Go to API section and confirm all 20 endpoints exist.

### Step 3: Test an Endpoint
1. Select `POST /email_contacts`
2. Click "Run & Debug"
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
4. Click "Run" - should create contact successfully

### Step 4: Get Your API URL
1. Go to API → Settings
2. Copy your base URL (looks like: `https://xxxx-xxxx-xxxx.n7e.xano.io/api:xxxxxxxx`)
3. Save this URL - you'll need it for the app

### Step 5: Configure CORS
1. Go to API → Settings → CORS
2. Add this URL: `https://deploy-preview-15--gleaming-cendol-417bf3.netlify.app`
3. Enable all methods: GET, POST, PATCH, DELETE, PUT, HEAD

### Step 6: Update the App
Update the API URL in `src/services/email/emailContactService.js`:
```javascript
const BASE_URL = 'YOUR_XANO_API_URL_HERE';
```

---

## 🎯 That's It!

Once Xano AI creates everything and you update the API URL, your email system will be fully functional!

**Test it at**: https://deploy-preview-15--gleaming-cendol-417bf3.netlify.app/email