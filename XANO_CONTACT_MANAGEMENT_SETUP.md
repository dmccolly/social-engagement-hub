# Xano Contact Management Setup Guide

## Overview

This guide will walk you through setting up the Contact Management backend in Xano. The frontend is already complete and ready to use once the backend is configured.

## Step 1: Create the Database Table

### 1.1 Navigate to Database

1. Log in to your Xano workspace
2. Click on **Database** in the left sidebar
3. Click **Add Table** button

### 1.2 Create `email_contacts` Table

**Table Name:** `email_contacts`

**Fields to Add:**

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `id` | integer | Auto-increment, Primary Key | Unique contact ID |
| `email` | text | Required, Unique | Contact email address |
| `first_name` | text | Optional | Contact first name |
| `last_name` | text | Optional | Contact last name |
| `status` | text | Default: "subscribed" | Subscription status |
| `member_type` | text | Default: "contact" | Member or contact |
| `phone` | text | Optional | Phone number |
| `location` | text | Optional | Location/address |
| `tags` | text | Optional | Comma-separated tags |
| `custom_fields` | json | Optional | Additional custom data |
| `subscribed_at` | timestamp | Auto-set on create | Subscription date |
| `unsubscribed_at` | timestamp | Optional | Unsubscribe date |
| `created_at` | timestamp | Auto-set on create | Record creation date |
| `updated_at` | timestamp | Auto-update | Last update date |

**Field Details:**

1. **id** (integer)
   - Check "Auto Increment"
   - Check "Primary Key"

2. **email** (text)
   - Check "Required"
   - Check "Unique"
   - This ensures no duplicate emails

3. **status** (text)
   - Default value: `subscribed`
   - Valid values: `subscribed`, `unsubscribed`, `bounced`

4. **member_type** (text)
   - Default value: `contact`
   - Valid values: `contact`, `member`

5. **subscribed_at** (timestamp)
   - Check "Set on Create"

6. **unsubscribed_at** (timestamp)
   - Leave unchecked (only set when unsubscribing)

7. **created_at** (timestamp)
   - Check "Set on Create"

8. **updated_at** (timestamp)
   - Check "Set on Create"
   - Check "Set on Update"

### 1.3 Add Indexes (Optional but Recommended)

For better performance, add indexes on frequently queried fields:

1. Click on the table name
2. Go to **Indexes** tab
3. Add indexes for:
   - `email` (already indexed due to unique constraint)
   - `status`
   - `member_type`
   - `created_at`

---

## Step 2: Create API Endpoints

### 2.1 Get All Contacts

**Endpoint:** `GET /email_contacts`

**Setup:**
1. Go to **API** → Click **Add API Endpoint**
2. Name: `Get All Contacts`
3. Path: `/email_contacts`
4. Method: `GET`

**Add Query Parameters:**
1. Click **Add Input** → **Query Parameter**
   - Name: `status` (optional)
   - Type: text
   
2. Add another Query Parameter:
   - Name: `member_type` (optional)
   - Type: text

3. Add another Query Parameter:
   - Name: `search` (optional)
   - Type: text

**Function Stack:**

1. **Query all records** from `email_contacts`
   - Add filters if parameters provided:
   - If `status` exists: Add filter `status = $status`
   - If `member_type` exists: Add filter `member_type = $member_type`
   - If `search` exists: Add filter `email contains $search OR first_name contains $search OR last_name contains $search`
   - Order by: `created_at DESC`

2. **Response**
   - Return the query results

**Test:**
```bash
GET https://your-workspace.xano.io/api:your-api-group/email_contacts
```

---

### 2.2 Create Contact

**Endpoint:** `POST /email_contacts`

**Setup:**
1. Name: `Create Contact`
2. Path: `/email_contacts`
3. Method: `POST`

**Add Inputs (Body Parameters):**
1. `email` (text, required)
2. `first_name` (text, optional)
3. `last_name` (text, optional)
4. `status` (text, optional, default: "subscribed")
5. `member_type` (text, optional, default: "contact")
6. `phone` (text, optional)
7. `location` (text, optional)
8. `tags` (text, optional)
9. `custom_fields` (json, optional)

**Function Stack:**

1. **Check for duplicate email**
   - Query `email_contacts` where `email = $email`
   - If found: Return error response
     ```json
     {
       "success": false,
       "error": "Email already exists",
       "code": "DUPLICATE_EMAIL"
     }
     ```

2. **Add Record** to `email_contacts`
   - Map all input fields
   - Set `subscribed_at` to current timestamp

3. **Response**
   ```json
   {
     "success": true,
     "contact": {result_from_add_record}
   }
   ```

**Test:**
```bash
POST https://your-workspace.xano.io/api:your-api-group/email_contacts
Content-Type: application/json

{
  "email": "test@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "status": "subscribed"
}
```

---

### 2.3 Get Single Contact

**Endpoint:** `GET /email_contacts/{contact_id}`

**Setup:**
1. Name: `Get Contact`
2. Path: `/email_contacts/{contact_id}`
3. Method: `GET`

**Add Path Parameter:**
- `contact_id` (integer, required)

**Function Stack:**

1. **Query single record** from `email_contacts`
   - Filter: `id = $contact_id`

2. **Check if found**
   - If not found: Return 404 error

3. **Response**
   ```json
   {
     "success": true,
     "contact": {query_result}
   }
   ```

---

### 2.4 Update Contact

**Endpoint:** `PATCH /email_contacts/{contact_id}`

**Setup:**
1. Name: `Update Contact`
2. Path: `/email_contacts/{contact_id}`
3. Method: `PATCH`

**Add Path Parameter:**
- `contact_id` (integer, required)

**Add Body Parameters (all optional):**
- `email` (text)
- `first_name` (text)
- `last_name` (text)
- `status` (text)
- `member_type` (text)
- `phone` (text)
- `location` (text)
- `tags` (text)
- `custom_fields` (json)

**Function Stack:**

1. **Get existing record**
   - Query `email_contacts` where `id = $contact_id`
   - If not found: Return 404 error

2. **Check email uniqueness** (if email is being updated)
   - If `$email` is provided and different from current:
   - Query `email_contacts` where `email = $email` AND `id != $contact_id`
   - If found: Return duplicate error

3. **Update Record** in `email_contacts`
   - Set `id = $contact_id`
   - Update only provided fields

4. **Response**
   ```json
   {
     "success": true,
     "contact": {updated_record}
   }
   ```

---

### 2.5 Delete Contact

**Endpoint:** `DELETE /email_contacts/{contact_id}`

**Setup:**
1. Name: `Delete Contact`
2. Path: `/email_contacts/{contact_id}`
3. Method: `DELETE`

**Add Path Parameter:**
- `contact_id` (integer, required)

**Function Stack:**

1. **Check if exists**
   - Query `email_contacts` where `id = $contact_id`
   - If not found: Return 404 error

2. **Delete Record** from `email_contacts`
   - Where `id = $contact_id`

3. **Response**
   ```json
   {
     "success": true,
     "message": "Contact deleted successfully"
   }
   ```

---

### 2.6 Import Contacts (CSV)

**Endpoint:** `POST /email_contacts/import`

**Setup:**
1. Name: `Import Contacts`
2. Path: `/email_contacts/import`
3. Method: `POST`

**Add Body Parameter:**
- `contacts` (json array, required) - Array of contact objects

**Function Stack:**

1. **Initialize counters**
   - Variable: `imported = 0`
   - Variable: `skipped = 0`
   - Variable: `errors = []`

2. **Loop through contacts array**
   - For each contact in `$contacts`:
   
   a. **Check if email exists**
      - Query `email_contacts` where `email = contact.email`
      
   b. **If exists**: 
      - Increment `skipped`
      - Add to `errors` array
      
   c. **If not exists**:
      - Add record to `email_contacts`
      - Increment `imported`

3. **Response**
   ```json
   {
     "success": true,
     "imported": {imported},
     "skipped": {skipped},
     "errors": {errors}
   }
   ```

---

### 2.7 Export Contacts (CSV)

**Endpoint:** `GET /email_contacts/export`

**Setup:**
1. Name: `Export Contacts`
2. Path: `/email_contacts/export`
3. Method: `GET`

**Add Query Parameters:**
- `status` (text, optional)
- `member_type` (text, optional)

**Function Stack:**

1. **Query all records** from `email_contacts`
   - Apply filters if provided
   - Order by: `created_at DESC`

2. **Response**
   - Return query results (frontend will convert to CSV)

---

### 2.8 Bulk Update Contacts

**Endpoint:** `POST /email_contacts/bulk-update`

**Setup:**
1. Name: `Bulk Update Contacts`
2. Path: `/email_contacts/bulk-update`
3. Method: `POST`

**Add Body Parameters:**
- `contact_ids` (json array of integers, required)
- `updates` (json object, required) - Fields to update

**Function Stack:**

1. **Validate inputs**
   - Check `contact_ids` is not empty
   - Check `updates` has at least one field

2. **Loop through contact_ids**
   - For each `contact_id`:
   - Update record in `email_contacts` where `id = contact_id`
   - Apply all fields from `updates` object

3. **Response**
   ```json
   {
     "success": true,
     "updated": {count_of_updated_records}
   }
   ```

---

### 2.9 Bulk Delete Contacts

**Endpoint:** `POST /email_contacts/bulk-delete`

**Setup:**
1. Name: `Bulk Delete Contacts`
2. Path: `/email_contacts/bulk-delete`
3. Method: `POST`

**Add Body Parameter:**
- `contact_ids` (json array of integers, required)

**Function Stack:**

1. **Validate input**
   - Check `contact_ids` is not empty

2. **Delete records**
   - Delete from `email_contacts` where `id IN $contact_ids`

3. **Response**
   ```json
   {
     "success": true,
     "deleted": {count_of_deleted_records}
   }
   ```

---

## Step 3: Configure CORS

To allow your frontend to access these endpoints:

1. Go to **Settings** → **API Settings**
2. Enable **CORS**
3. Add your frontend URL to allowed origins:
   - `http://localhost:3000` (for development)
   - Your production domain

---

## Step 4: Get API Base URL

1. Go to **API** section
2. Click on your API group
3. Copy the **Base URL** (e.g., `https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5`)
4. Update your `.env` file:
   ```env
   REACT_APP_XANO_BASE_URL=https://your-workspace.xano.io/api:your-api-group
   ```

---

## Step 5: Test the Endpoints

### Using the Test Script

The repository includes a test script. Run it to verify all endpoints:

```bash
cd social-engagement-hub
node test-email-functions.js
```

Expected output:
```
🧪 Testing Email Contact Management API

✅ GET /email_contacts - Success
✅ POST /email_contacts - Success
✅ GET /email_contacts/:id - Success
✅ PATCH /email_contacts/:id - Success
✅ DELETE /email_contacts/:id - Success
✅ POST /email_contacts/import - Success
✅ GET /email_contacts/export - Success

🎉 All tests passed!
```

### Manual Testing with Xano

1. Go to each endpoint in Xano
2. Click **Run & Debug**
3. Enter test data
4. Click **Run**
5. Verify the response

---

## Step 6: Update Frontend Configuration

The frontend service is already configured. Just update the base URL:

**File:** `src/services/email/emailContactService.js`

The service already points to:
```javascript
const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';
```

Make sure your `.env` file has the correct URL.

---

## Step 7: Test in the UI

1. Start your development server:
   ```bash
   npm start
   ```

2. Navigate to the Email section

3. Click on **Contacts** or **Contact Management**

4. Test these features:
   - ✅ View contact list
   - ✅ Add new contact
   - ✅ Edit contact
   - ✅ Delete contact
   - ✅ Search contacts
   - ✅ Filter by status
   - ✅ Filter by member type
   - ✅ Import from CSV
   - ✅ Export to CSV
   - ✅ Bulk update
   - ✅ Bulk delete

---

## Troubleshooting

### Issue: "Failed to fetch contacts"

**Solutions:**
1. Check CORS is enabled in Xano
2. Verify API base URL is correct
3. Check browser console for errors
4. Verify endpoint paths match exactly

### Issue: "Email already exists" error

**Expected behavior** - This prevents duplicate contacts.

**Solution:** Use update instead of create, or delete the existing contact first.

### Issue: Import fails

**Solutions:**
1. Check CSV format matches expected structure
2. Verify all required fields (email) are present
3. Check for duplicate emails in import file

### Issue: 404 errors

**Solutions:**
1. Verify endpoint paths in Xano match the service
2. Check API group name in base URL
3. Ensure endpoints are published

---

## API Endpoint Summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/email_contacts` | List all contacts |
| POST | `/email_contacts` | Create new contact |
| GET | `/email_contacts/{id}` | Get single contact |
| PATCH | `/email_contacts/{id}` | Update contact |
| DELETE | `/email_contacts/{id}` | Delete contact |
| POST | `/email_contacts/import` | Import contacts from CSV |
| GET | `/email_contacts/export` | Export contacts to CSV |
| POST | `/email_contacts/bulk-update` | Update multiple contacts |
| POST | `/email_contacts/bulk-delete` | Delete multiple contacts |

---

## Next Steps

After completing Contact Management setup:

1. ✅ Test all endpoints
2. ✅ Verify UI functionality
3. ➡️ **Move to Email Groups setup** (next guide)
4. Import some test contacts
5. Start building your email list!

---

## Estimated Setup Time

- **Database table creation:** 5-10 minutes
- **API endpoints creation:** 30-45 minutes
- **Testing:** 10-15 minutes
- **Total:** ~1 hour

---

**You're now ready to manage contacts!** The Contact Management system is the foundation for your email marketing platform. Once this is working, you can move on to Email Groups.

