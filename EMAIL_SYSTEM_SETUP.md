# Email System Setup Guide

## Overview
This guide will help you set up the complete email marketing system in Xano, including database tables and API endpoints.

## 📋 Prerequisites
- Access to your Xano workspace
- Admin permissions to create tables and endpoints

## 🗄️ Step 1: Create Database Tables

### Table 1: email_contacts
This table stores all email contacts/subscribers.

**Fields:**
| Field Name | Type | Settings |
|------------|------|----------|
| id | int | Auto-increment, Primary Key |
| email | text | Unique, Required |
| first_name | text | Optional |
| last_name | text | Optional |
| member_type | text | Default: 'non-member' |
| status | text | Default: 'subscribed' |
| created_at | timestamp | Auto-generated on create |
| updated_at | timestamp | Auto-updated on edit |

**Indexes:**
- Primary: id
- Unique: email
- Index: status (for filtering)
- Index: member_type (for filtering)

### Table 2: email_groups
This table stores contact groups/lists.

**Fields:**
| Field Name | Type | Settings |
|------------|------|----------|
| id | int | Auto-increment, Primary Key |
| name | text | Required |
| description | text | Optional |
| created_at | timestamp | Auto-generated on create |
| updated_at | timestamp | Auto-updated on edit |

**Indexes:**
- Primary: id

### Table 3: email_group_contacts
This is a junction table linking contacts to groups (many-to-many relationship).

**Fields:**
| Field Name | Type | Settings |
|------------|------|----------|
| id | int | Auto-increment, Primary Key |
| group_id | int | Foreign Key to email_groups.id |
| contact_id | int | Foreign Key to email_contacts.id |
| added_at | timestamp | Auto-generated on create |

**Indexes:**
- Primary: id
- Index: group_id
- Index: contact_id
- Unique: (group_id, contact_id) - prevents duplicate entries

## 🔌 Step 2: Create API Endpoints

### Contact Endpoints

#### 1. GET /email_contacts
**Purpose:** Get all contacts with optional filtering

**Query Parameters:**
- status (optional) - Filter by status
- member_type (optional) - Filter by member type
- group_id (optional) - Filter by group membership
- search (optional) - Search in email, first_name, last_name

**Function Stack:**
```
1. Query email_contacts table
2. Apply filters if provided
3. Return results
```

**Response:** Array of contact objects

---

#### 2. POST /email_contacts
**Purpose:** Create a new contact

**Input (JSON):**
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "member_type": "non-member",
  "status": "subscribed"
}
```

**Function Stack:**
```
1. Validate email is provided
2. Check if email already exists (return error if duplicate)
3. Add record to email_contacts
4. Return created contact
```

**Response:** Created contact object

---

#### 3. GET /email_contacts/{id}
**Purpose:** Get a single contact by ID

**Path Parameter:** id (contact ID)

**Function Stack:**
```
1. Query email_contacts where id = {id}
2. Return contact or 404 if not found
```

**Response:** Contact object

---

#### 4. PATCH /email_contacts/{id}
**Purpose:** Update an existing contact

**Path Parameter:** id (contact ID)

**Input (JSON):** Any contact fields to update

**Function Stack:**
```
1. Query email_contacts where id = {id}
2. Update provided fields
3. Return updated contact
```

**Response:** Updated contact object

---

#### 5. DELETE /email_contacts/{id}
**Purpose:** Delete a contact

**Path Parameter:** id (contact ID)

**Function Stack:**
```
1. Delete from email_group_contacts where contact_id = {id}
2. Delete from email_contacts where id = {id}
3. Return success message
```

**Response:** 204 No Content or success message

---

### Group Endpoints

#### 6. GET /email_groups
**Purpose:** Get all groups

**Function Stack:**
```
1. Query email_groups table
2. For each group, count contacts (optional)
3. Return results
```

**Response:** Array of group objects

---

#### 7. POST /email_groups
**Purpose:** Create a new group

**Input (JSON):**
```json
{
  "name": "Newsletter Subscribers",
  "description": "Monthly newsletter recipients"
}
```

**Function Stack:**
```
1. Validate name is provided
2. Add record to email_groups
3. Return created group
```

**Response:** Created group object

---

#### 8. GET /email_groups/{id}
**Purpose:** Get a single group by ID

**Path Parameter:** id (group ID)

**Function Stack:**
```
1. Query email_groups where id = {id}
2. Count contacts in group
3. Return group with contact count
```

**Response:** Group object with contact count

---

#### 9. PATCH /email_groups/{id}
**Purpose:** Update an existing group

**Path Parameter:** id (group ID)

**Input (JSON):** Any group fields to update

**Function Stack:**
```
1. Query email_groups where id = {id}
2. Update provided fields
3. Return updated group
```

**Response:** Updated group object

---

#### 10. DELETE /email_groups/{id}
**Purpose:** Delete a group

**Path Parameter:** id (group ID)

**Function Stack:**
```
1. Delete from email_group_contacts where group_id = {id}
2. Delete from email_groups where id = {id}
3. Return success message
```

**Response:** 204 No Content or success message

---

### Group-Contact Relationship Endpoints

#### 11. GET /email_groups/{id}/contacts
**Purpose:** Get all contacts in a group

**Path Parameter:** id (group ID)

**Function Stack:**
```
1. Query email_group_contacts where group_id = {id}
2. Join with email_contacts to get full contact details
3. Return array of contacts
```

**Response:** Array of contact objects

---

#### 12. POST /email_groups/{id}/contacts
**Purpose:** Add contacts to a group

**Path Parameter:** id (group ID)

**Input (JSON):**
```json
{
  "contact_ids": [1, 2, 3, 4, 5]
}
```

**Function Stack:**
```
1. Validate group exists
2. For each contact_id:
   - Check if contact exists
   - Check if already in group (skip if yes)
   - Add to email_group_contacts
3. Return count of added contacts
```

**Response:** 
```json
{
  "added": 5,
  "skipped": 0,
  "message": "5 contacts added to group"
}
```

---

#### 13. DELETE /email_groups/{id}/contacts/{contact_id}
**Purpose:** Remove a contact from a group

**Path Parameters:** 
- id (group ID)
- contact_id (contact ID)

**Function Stack:**
```
1. Delete from email_group_contacts 
   where group_id = {id} AND contact_id = {contact_id}
2. Return success message
```

**Response:** 204 No Content or success message

---

## 🧪 Step 3: Test the Endpoints

After creating all tables and endpoints, run the test script:

```bash
cd social-engagement-hub
node test-email-functions.js
```

Expected output: All tests should pass ✅

## 📊 Step 4: Verify in Dashboard

1. Start the React app: `npm start`
2. Navigate to the Email section
3. The dashboard should load and display:
   - Total Contacts: 0
   - Subscribed: 0
   - Groups: 0
   - Campaigns Sent: 0

## 🔐 Security Considerations

1. **Email Validation:** Ensure emails are validated before insertion
2. **Rate Limiting:** Consider adding rate limits to prevent abuse
3. **Authentication:** Add authentication to protect endpoints (if needed)
4. **CORS:** Configure CORS settings appropriately

## 📝 Notes

- All timestamps are in UTC
- Email addresses are case-insensitive (store lowercase)
- Status values: 'subscribed', 'unsubscribed', 'bounced'
- Member type values: 'member', 'non-member'

## 🆘 Troubleshooting

### Issue: 404 Errors
**Solution:** Verify endpoints are created with exact paths as specified

### Issue: Duplicate Email Error
**Solution:** Check if email already exists before creating

### Issue: Foreign Key Errors
**Solution:** Ensure relationships are properly configured in Xano

## 📞 Support

If you encounter issues:
1. Check Xano logs for detailed error messages
2. Verify table structures match specifications
3. Test endpoints individually in Xano's API testing tool
4. Review the test script output for specific error details