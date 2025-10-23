# Xano Email Groups Setup Guide

## Overview

This guide sets up the Email Groups (Lists) system in Xano. Email groups allow you to segment your contacts for targeted campaigns. The frontend service and UI components are already complete.

## Prerequisites

- ✅ Contact Management backend must be set up first
- ✅ `email_contacts` table must exist

## Step 1: Create Database Tables

### 1.1 Create `email_groups` Table

**Table Name:** `email_groups`

**Fields:**

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `id` | integer | Auto-increment, Primary Key | Unique group ID |
| `name` | text | Required | Group name |
| `description` | text | Optional | Group description |
| `contact_count` | integer | Default: 0 | Number of contacts |
| `is_active` | boolean | Default: true | Active status |
| `created_by` | integer | Optional | Creator user ID |
| `created_at` | timestamp | Auto-set on create | Creation date |
| `updated_at` | timestamp | Auto-update | Last update date |

**Field Details:**

1. **id** (integer)
   - Check "Auto Increment"
   - Check "Primary Key"

2. **name** (text)
   - Check "Required"
   - Group name (e.g., "Newsletter Subscribers", "VIP Customers")

3. **description** (text)
   - Optional description of the group

4. **contact_count** (integer)
   - Default value: `0`
   - Will be updated automatically when contacts are added/removed

5. **is_active** (boolean)
   - Default value: `true`
   - Allows soft-disabling groups

6. **created_at** (timestamp)
   - Check "Set on Create"

7. **updated_at** (timestamp)
   - Check "Set on Create"
   - Check "Set on Update"

---

### 1.2 Create `email_group_contacts` Junction Table

This table links contacts to groups (many-to-many relationship).

**Table Name:** `email_group_contacts`

**Fields:**

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `id` | integer | Auto-increment, Primary Key | Unique relationship ID |
| `group_id` | integer | Required | Foreign key to email_groups |
| `contact_id` | integer | Required | Foreign key to email_contacts |
| `added_at` | timestamp | Auto-set on create | When contact was added |
| `added_by` | integer | Optional | Who added the contact |

**Field Details:**

1. **id** (integer)
   - Check "Auto Increment"
   - Check "Primary Key"

2. **group_id** (integer)
   - Required
   - References `email_groups.id`

3. **contact_id** (integer)
   - Required
   - References `email_contacts.id`

4. **added_at** (timestamp)
   - Check "Set on Create"

**Add Unique Constraint:**
- Create a unique index on (`group_id`, `contact_id`) to prevent duplicate assignments

---

## Step 2: Create API Endpoints

### 2.1 Get All Groups

**Endpoint:** `GET /email_groups`

**Setup:**
1. Name: `Get All Email Groups`
2. Path: `/email_groups`
3. Method: `GET`

**Add Query Parameter:**
- `search` (text, optional) - Search by name or description

**Function Stack:**

1. **Query all records** from `email_groups`
   - If `search` provided: Add filter `name contains $search OR description contains $search`
   - Order by: `created_at DESC`

2. **Response**
   ```json
   {
     "success": true,
     "groups": [query_results]
   }
   ```

---

### 2.2 Create Group

**Endpoint:** `POST /email_groups`

**Setup:**
1. Name: `Create Email Group`
2. Path: `/email_groups`
3. Method: `POST`

**Add Body Parameters:**
- `name` (text, required)
- `description` (text, optional)
- `is_active` (boolean, optional, default: true)

**Function Stack:**

1. **Check for duplicate name**
   - Query `email_groups` where `name = $name`
   - If found: Return error
     ```json
     {
       "success": false,
       "error": "Group name already exists"
     }
     ```

2. **Add Record** to `email_groups`
   - Set `contact_count = 0`
   - Map all input fields

3. **Response**
   ```json
   {
     "success": true,
     "group": {created_group}
   }
   ```

---

### 2.3 Get Single Group

**Endpoint:** `GET /email_groups/{group_id}`

**Setup:**
1. Name: `Get Email Group`
2. Path: `/email_groups/{group_id}`
3. Method: `GET`

**Add Path Parameter:**
- `group_id` (integer, required)

**Function Stack:**

1. **Query single record** from `email_groups`
   - Filter: `id = $group_id`

2. **Check if found**
   - If not found: Return 404 error

3. **Get contact count**
   - Count records in `email_group_contacts` where `group_id = $group_id`
   - Update `contact_count` field

4. **Response**
   ```json
   {
     "success": true,
     "group": {group_with_updated_count}
   }
   ```

---

### 2.4 Update Group

**Endpoint:** `PATCH /email_groups/{group_id}`

**Setup:**
1. Name: `Update Email Group`
2. Path: `/email_groups/{group_id}`
3. Method: `PATCH`

**Add Path Parameter:**
- `group_id` (integer, required)

**Add Body Parameters (all optional):**
- `name` (text)
- `description` (text)
- `is_active` (boolean)

**Function Stack:**

1. **Get existing record**
   - Query `email_groups` where `id = $group_id`
   - If not found: Return 404 error

2. **Check name uniqueness** (if name is being updated)
   - If `$name` provided and different:
   - Query `email_groups` where `name = $name` AND `id != $group_id`
   - If found: Return duplicate error

3. **Update Record** in `email_groups`
   - Update only provided fields

4. **Response**
   ```json
   {
     "success": true,
     "group": {updated_group}
   }
   ```

---

### 2.5 Delete Group

**Endpoint:** `DELETE /email_groups/{group_id}`

**Setup:**
1. Name: `Delete Email Group`
2. Path: `/email_groups/{group_id}`
3. Method: `DELETE`

**Add Path Parameter:**
- `group_id` (integer, required)

**Function Stack:**

1. **Check if exists**
   - Query `email_groups` where `id = $group_id`
   - If not found: Return 404 error

2. **Delete all group-contact relationships**
   - Delete from `email_group_contacts` where `group_id = $group_id`

3. **Delete the group**
   - Delete from `email_groups` where `id = $group_id`

4. **Response**
   ```json
   {
     "success": true,
     "message": "Group deleted successfully"
   }
   ```

---

### 2.6 Get Contacts in Group

**Endpoint:** `GET /email_groups/{group_id}/contacts`

**Setup:**
1. Name: `Get Group Contacts`
2. Path: `/email_groups/{group_id}/contacts`
3. Method: `GET`

**Add Path Parameter:**
- `group_id` (integer, required)

**Add Query Parameters:**
- `page` (integer, optional, default: 1)
- `limit` (integer, optional, default: 50)

**Function Stack:**

1. **Verify group exists**
   - Query `email_groups` where `id = $group_id`
   - If not found: Return 404 error

2. **Get contacts**
   - Query `email_group_contacts` where `group_id = $group_id`
   - Join with `email_contacts` table
   - Apply pagination: offset = (page - 1) * limit, limit = limit
   - Order by: `added_at DESC`

3. **Get total count**
   - Count records in `email_group_contacts` where `group_id = $group_id`

4. **Response**
   ```json
   {
     "success": true,
     "contacts": [array_of_contacts],
     "pagination": {
       "page": 1,
       "limit": 50,
       "total": 150,
       "total_pages": 3
     }
   }
   ```

---

### 2.7 Add Contacts to Group

**Endpoint:** `POST /email_groups/{group_id}/contacts`

**Setup:**
1. Name: `Add Contacts to Group`
2. Path: `/email_groups/{group_id}/contacts`
3. Method: `POST`

**Add Path Parameter:**
- `group_id` (integer, required)

**Add Body Parameter:**
- `contact_ids` (json array of integers, required)

**Function Stack:**

1. **Verify group exists**
   - Query `email_groups` where `id = $group_id`
   - If not found: Return 404 error

2. **Initialize counter**
   - Variable: `added = 0`

3. **Loop through contact_ids**
   - For each `contact_id`:
   
   a. **Verify contact exists**
      - Query `email_contacts` where `id = contact_id`
      - If not found: Skip
   
   b. **Check if already in group**
      - Query `email_group_contacts` where `group_id = $group_id` AND `contact_id = contact_id`
      - If found: Skip
   
   c. **Add relationship**
      - Add record to `email_group_contacts`
      - Set `group_id = $group_id`
      - Set `contact_id = contact_id`
      - Increment `added`

4. **Update group contact count**
   - Count records in `email_group_contacts` where `group_id = $group_id`
   - Update `email_groups` set `contact_count = count` where `id = $group_id`

5. **Response**
   ```json
   {
     "success": true,
     "added": {added_count},
     "total": {total_contacts_in_group}
   }
   ```

---

### 2.8 Remove Contacts from Group

**Endpoint:** `DELETE /email_groups/{group_id}/contacts`

**Setup:**
1. Name: `Remove Contacts from Group`
2. Path: `/email_groups/{group_id}/contacts`
3. Method: `DELETE`

**Add Path Parameter:**
- `group_id` (integer, required)

**Add Body Parameter:**
- `contact_ids` (json array of integers, required)

**Function Stack:**

1. **Verify group exists**
   - Query `email_groups` where `id = $group_id`
   - If not found: Return 404 error

2. **Delete relationships**
   - Delete from `email_group_contacts` 
   - Where `group_id = $group_id` AND `contact_id IN $contact_ids`

3. **Update group contact count**
   - Count records in `email_group_contacts` where `group_id = $group_id`
   - Update `email_groups` set `contact_count = count` where `id = $group_id`

4. **Response**
   ```json
   {
     "success": true,
     "removed": {removed_count},
     "total": {remaining_contacts_in_group}
   }
   ```

---

### 2.9 Get Group Statistics

**Endpoint:** `GET /email_groups/{group_id}/stats`

**Setup:**
1. Name: `Get Group Statistics`
2. Path: `/email_groups/{group_id}/stats`
3. Method: `GET`

**Add Path Parameter:**
- `group_id` (integer, required)

**Function Stack:**

1. **Verify group exists**
   - Query `email_groups` where `id = $group_id`
   - If not found: Return 404 error

2. **Get total contacts**
   - Count records in `email_group_contacts` where `group_id = $group_id`

3. **Get subscribed contacts**
   - Join `email_group_contacts` with `email_contacts`
   - Count where `group_id = $group_id` AND `status = 'subscribed'`

4. **Get members vs contacts**
   - Count where `group_id = $group_id` AND `member_type = 'member'`
   - Count where `group_id = $group_id` AND `member_type = 'contact'`

5. **Get recent additions**
   - Query `email_group_contacts` where `group_id = $group_id`
   - Order by `added_at DESC`
   - Limit 10

6. **Response**
   ```json
   {
     "success": true,
     "stats": {
       "total_contacts": 150,
       "subscribed": 145,
       "unsubscribed": 5,
       "members": 80,
       "contacts": 70,
       "recent_additions": [array_of_recent_contacts]
     }
   }
   ```

---

## Step 3: Create Helper Function (Optional)

### Update Contact Count Function

This function can be called after any operation that changes group membership.

**Function Name:** `update_group_contact_count`

**Inputs:**
- `group_id` (integer)

**Function Stack:**

1. **Count contacts**
   - Count records in `email_group_contacts` where `group_id = $group_id`

2. **Update group**
   - Update `email_groups` set `contact_count = count` where `id = $group_id`

3. **Return**
   - Return the updated count

---

## Step 4: Configure CORS

Same as Contact Management - ensure CORS is enabled for your frontend domain.

---

## Step 5: Test the Endpoints

### Using Xano's Built-in Tester

Test each endpoint in Xano:

1. **Create a test group:**
   ```json
   POST /email_groups
   {
     "name": "Test Group",
     "description": "Testing email groups"
   }
   ```

2. **Add contacts to group:**
   ```json
   POST /email_groups/1/contacts
   {
     "contact_ids": [1, 2, 3]
   }
   ```

3. **Get group contacts:**
   ```
   GET /email_groups/1/contacts
   ```

4. **Get group stats:**
   ```
   GET /email_groups/1/stats
   ```

---

## Step 6: Test in the UI

1. Start your development server
2. Navigate to Email → Groups (or Contact Management)
3. Test these features:
   - ✅ Create new group
   - ✅ View group list
   - ✅ Edit group name/description
   - ✅ Delete group
   - ✅ Add contacts to group
   - ✅ Remove contacts from group
   - ✅ View group statistics
   - ✅ Filter contacts by group

---

## Integration with Contact Management

### Update Contact Management UI

The `ContactManagement.js` component already has group assignment functionality. It will automatically work once the backend is set up.

**Features that will now work:**
- Assign contacts to groups during creation
- Bulk assign contacts to groups
- View which groups a contact belongs to
- Filter contacts by group membership

---

## Troubleshooting

### Issue: "Group name already exists"

**Expected behavior** - Prevents duplicate group names.

**Solution:** Use a different name or update the existing group.

### Issue: Contacts not appearing in group

**Solutions:**
1. Verify contact IDs are valid
2. Check `email_group_contacts` table for relationships
3. Verify `contact_count` is being updated
4. Check for unique constraint violations

### Issue: Contact count not updating

**Solution:** 
- Run the `update_group_contact_count` function manually
- Or add it to the add/remove contacts endpoints

---

## API Endpoint Summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/email_groups` | List all groups |
| POST | `/email_groups` | Create new group |
| GET | `/email_groups/{id}` | Get single group |
| PATCH | `/email_groups/{id}` | Update group |
| DELETE | `/email_groups/{id}` | Delete group |
| GET | `/email_groups/{id}/contacts` | Get contacts in group |
| POST | `/email_groups/{id}/contacts` | Add contacts to group |
| DELETE | `/email_groups/{id}/contacts` | Remove contacts from group |
| GET | `/email_groups/{id}/stats` | Get group statistics |

---

## Database Schema Diagram

```
email_groups                email_group_contacts           email_contacts
┌─────────────┐            ┌──────────────────┐          ┌─────────────┐
│ id          │◄───────────│ group_id         │          │ id          │
│ name        │            │ contact_id       │──────────►│ email       │
│ description │            │ added_at         │          │ first_name  │
│ contact_count│           │ added_by         │          │ last_name   │
│ is_active   │            └──────────────────┘          │ status      │
│ created_at  │                                           │ ...         │
│ updated_at  │                                           └─────────────┘
└─────────────┘
```

---

## Next Steps

After completing Email Groups setup:

1. ✅ Test all group operations
2. ✅ Create some test groups
3. ✅ Add contacts to groups
4. ➡️ **Move to Email Campaigns setup** (next guide)
5. Start planning your first campaign!

---

## Estimated Setup Time

- **Database tables creation:** 10-15 minutes
- **API endpoints creation:** 45-60 minutes
- **Testing:** 15-20 minutes
- **Total:** ~1.5 hours

---

**Email Groups are now ready!** You can now segment your contacts for targeted email campaigns. Next, we'll set up the Email Campaigns system to actually send emails to these groups.

