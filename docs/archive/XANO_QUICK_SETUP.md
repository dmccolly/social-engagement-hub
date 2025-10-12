# 🚀 Quick Xano Setup Guide - Copy & Paste Ready

## Table 1: email_contacts

**Create these fields in order:**

```
id              → Integer, Primary Key, Auto-increment
email           → Text, Required, Unique
first_name      → Text
last_name       → Text
status          → Text, Required, Default: "subscribed"
member_type     → Text
created_at      → Timestamp, Auto-set on create
updated_at      → Timestamp, Auto-update
```

**Add Indexes:**
- email (unique)
- status
- member_type

---

## Table 2: email_groups

```
id              → Integer, Primary Key, Auto-increment
name            → Text, Required, Max: 100
description     → Text
created_at      → Timestamp, Auto-set on create
```

**Add Index:**
- name

---

## Table 3: contact_groups

```
id              → Integer, Primary Key, Auto-increment
contact_id      → Integer, Required, Foreign Key → email_contacts.id
group_id        → Integer, Required, Foreign Key → email_groups.id
added_at        → Timestamp, Auto-set on create
```

**Add Indexes:**
- contact_id
- group_id
- Unique constraint on (contact_id + group_id)

---

## Table 4: email_campaigns

```
id                  → Integer, Primary Key, Auto-increment
name                → Text, Required
subject             → Text, Required
preview_text        → Text
html_content        → Text (Long)
status              → Text, Required, Default: "draft"
scheduled_at        → Timestamp
sent_at             → Timestamp
recipient_count     → Integer, Default: 0
created_at          → Timestamp, Auto-set on create
updated_at          → Timestamp, Auto-update
```

**Add Indexes:**
- status
- scheduled_at
- sent_at

---

## Table 5: campaign_sends

```
id                      → Integer, Primary Key, Auto-increment
campaign_id             → Integer, Required, Foreign Key → email_campaigns.id
contact_id              → Integer, Required, Foreign Key → email_contacts.id
sendgrid_message_id     → Text
sent_at                 → Timestamp, Auto-set on create
opened_at               → Timestamp
clicked_at              → Timestamp
bounced                 → Boolean, Default: false
unsubscribed            → Boolean, Default: false
```

**Add Indexes:**
- campaign_id
- contact_id
- sent_at

---

## 📝 Step-by-Step Instructions

### Creating Tables in Xano:

1. **Log into Xano** → Go to your workspace
2. **Click "Database"** in left sidebar
3. **Click "+ Add Table"**
4. **Name the table** (e.g., "email_contacts")
5. **Add fields one by one:**
   - Click "+ Add Field"
   - Enter field name
   - Select field type
   - Set properties (Required, Unique, Default, etc.)
   - Click "Save"
6. **Add Indexes:**
   - Click "Indexes" tab
   - Click "+ Add Index"
   - Select field(s)
   - Set unique if needed
7. **Repeat for all 5 tables**

### Creating API Endpoints:

For now, you only need **6 basic endpoints** to test Phase 1:

#### 1. GET /email_contacts
- **Function**: Get all contacts
- **Query**: `SELECT * FROM email_contacts ORDER BY created_at DESC`

#### 2. POST /email_contacts
- **Function**: Create contact
- **Inputs**: email, first_name, last_name, status, member_type
- **Query**: `INSERT INTO email_contacts`

#### 3. GET /email_contacts/{id}
- **Function**: Get one contact
- **Query**: `SELECT * FROM email_contacts WHERE id = {id}`

#### 4. PATCH /email_contacts/{id}
- **Function**: Update contact
- **Inputs**: email, first_name, last_name, status, member_type
- **Query**: `UPDATE email_contacts WHERE id = {id}`

#### 5. DELETE /email_contacts/{id}
- **Function**: Delete contact
- **Query**: `DELETE FROM email_contacts WHERE id = {id}`

#### 6. GET /email_groups
- **Function**: Get all groups
- **Query**: `SELECT * FROM email_groups ORDER BY name`

---

## ⚡ Fastest Setup Path

**For immediate testing, you only need:**

1. ✅ Create `email_contacts` table (Table 1)
2. ✅ Create `email_groups` table (Table 2)
3. ✅ Create 6 API endpoints listed above
4. ✅ Add preview URL to CORS settings

**You can add the other tables later when we build Phase 2-6!**

---

## 🧪 Test Your Setup

After creating the tables and endpoints, test in Xano:

1. Go to API → Select `POST /email_contacts`
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
4. Click "Run"
5. Should return the created contact with ID

Then test GET:
1. Select `GET /email_contacts`
2. Click "Run"
3. Should return array with your test contact

---

## 🔗 Update Your App

Once Xano is set up, update the API URL in your app:

**File**: `src/services/email/emailContactService.js`

Find this line:
```javascript
const BASE_URL = 'https://xajo-bs7d-cagt.n7e.xano.io/api:pYeQctVX';
```

Replace with your Xano API URL (found in Xano → API → Settings)

---

## ✅ Quick Checklist

- [ ] Created `email_contacts` table with 8 fields
- [ ] Created `email_groups` table with 4 fields
- [ ] Added indexes to both tables
- [ ] Created 6 API endpoints
- [ ] Tested endpoints in Xano
- [ ] Added preview URL to CORS: `https://deploy-preview-15--gleaming-cendol-417bf3.netlify.app`
- [ ] Updated API URL in `emailContactService.js`
- [ ] Ready to test!

---

**Need help?** The full detailed guide is in `XANO_EMAIL_SETUP.md`