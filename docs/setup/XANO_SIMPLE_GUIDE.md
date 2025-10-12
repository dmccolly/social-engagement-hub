# 🎯 Simple Xano Endpoint Setup - No Code Required

## Overview
Create 11 API endpoints using only Xano's visual interface. No coding needed!

---

## Endpoint 1: GET /email_contacts

### Step 1: Create Endpoint
1. Go to **API** section
2. Click **"Add API Endpoint"**
3. Method: **GET**
4. Path: `/email_contacts`
5. Click **"Create"**

### Step 2: Add Query Parameters
1. Click **"Add Input"**
2. Name: `status`, Type: **text**, Required: **No**
3. Click **"Add Input"** again
4. Name: `member_type`, Type: **text**, Required: **No**
5. Click **"Add Input"** again
6. Name: `search`, Type: **text**, Required: **No**

### Step 3: Add Function Stack
1. Click **"Add Function Stack"**
2. Select **"Query all records"**
3. Table: **email_contact**
4. Click **"Add"**

### Step 4: Add Filters (Optional)
1. In the function stack, click **"Add Filter"**
2. If `status` is provided: Filter where `status` equals `inputs.status`
3. If `member_type` is provided: Filter where `member_type` equals `inputs.member_type`
4. If `search` is provided: Filter where `email` contains `inputs.search`

### Step 5: Add Sort
1. Click **"Add Sort"**
2. Field: **created_at**
3. Order: **Descending**

### Step 6: Save
1. Click **"Save"**
2. Test in API playground

---

## Endpoint 2: GET /email_contacts/{id}

### Step 1: Create Endpoint
1. Go to **API** section
2. Click **"Add API Endpoint"**
3. Method: **GET**
4. Path: `/email_contacts/{id}`
5. Click **"Create"**

### Step 2: Add Path Parameter
1. Xano automatically creates `id` parameter
2. Type: **integer**

### Step 3: Add Function Stack
1. Click **"Add Function Stack"**
2. Select **"Query single record"**
3. Table: **email_contact**
4. Filter: `id` equals `inputs.id`
5. Click **"Add"**

### Step 4: Save
1. Click **"Save"**
2. Test with a contact ID

---

## Endpoint 3: POST /email_contacts

### Step 1: Create Endpoint
1. Go to **API** section
2. Click **"Add API Endpoint"**
3. Method: **POST**
4. Path: `/email_contacts`
5. Click **"Create"**

### Step 2: Add Body Inputs
1. Click **"Add Input"**
2. Name: `email`, Type: **text**, Required: **Yes**
3. Click **"Add Input"**
4. Name: `first_name`, Type: **text**, Required: **No**
5. Click **"Add Input"**
6. Name: `last_name`, Type: **text**, Required: **No**
7. Click **"Add Input"**
8. Name: `status`, Type: **text**, Required: **No**, Default: `"subscribed"`
9. Click **"Add Input"**
10. Name: `member_type`, Type: **text**, Required: **No**

### Step 3: Add Function Stack
1. Click **"Add Function Stack"**
2. Select **"Add Record"**
3. Table: **email_contact**
4. Map fields:
   - `email` → `inputs.email`
   - `first_name` → `inputs.first_name`
   - `last_name` → `inputs.last_name`
   - `status` → `inputs.status` (or "subscribed" if empty)
   - `member_type` → `inputs.member_type`
5. Click **"Add"**

### Step 4: Save
1. Click **"Save"**
2. Test by creating a contact

---

## Endpoint 4: PATCH /email_contacts/{id}

### Step 1: Create Endpoint
1. Go to **API** section
2. Click **"Add API Endpoint"**
3. Method: **PATCH**
4. Path: `/email_contacts/{id}`
5. Click **"Create"**

### Step 2: Add Path Parameter
1. Xano automatically creates `id` parameter
2. Type: **integer**

### Step 3: Add Body Inputs
1. Click **"Add Input"**
2. Name: `email`, Type: **text**, Required: **No**
3. Click **"Add Input"**
4. Name: `first_name`, Type: **text**, Required: **No**
5. Click **"Add Input"**
6. Name: `last_name`, Type: **text**, Required: **No**
7. Click **"Add Input"**
8. Name: `status`, Type: **text**, Required: **No**
9. Click **"Add Input"**
10. Name: `member_type`, Type: **text**, Required: **No**

### Step 4: Add Function Stack
1. Click **"Add Function Stack"**
2. Select **"Edit Record"**
3. Table: **email_contact**
4. Filter: `id` equals `inputs.id`
5. Map fields (only update if provided):
   - `email` → `inputs.email`
   - `first_name` → `inputs.first_name`
   - `last_name` → `inputs.last_name`
   - `status` → `inputs.status`
   - `member_type` → `inputs.member_type`
6. Click **"Add"**

### Step 5: Save
1. Click **"Save"**
2. Test by updating a contact

---

## Endpoint 5: DELETE /email_contacts/{id}

### Step 1: Create Endpoint
1. Go to **API** section
2. Click **"Add API Endpoint"**
3. Method: **DELETE**
4. Path: `/email_contacts/{id}`
5. Click **"Create"**

### Step 2: Add Path Parameter
1. Xano automatically creates `id` parameter
2. Type: **integer**

### Step 3: Add Function Stack - Delete Related Records
1. Click **"Add Function Stack"**
2. Select **"Query all records"**
3. Table: **contact_group**
4. Filter: `contact_id` equals `inputs.id`
5. Click **"Add"**
6. Then select **"Delete Records"** (for the query result)

### Step 4: Add Function Stack - Delete Contact
1. Click **"Add Function Stack"**
2. Select **"Delete Record"**
3. Table: **email_contact**
4. Filter: `id` equals `inputs.id`
5. Click **"Add"**

### Step 5: Save
1. Click **"Save"**
2. Test by deleting a contact

---

## Endpoint 6: GET /email_groups

### Step 1: Create Endpoint
1. Go to **API** section
2. Click **"Add API Endpoint"**
3. Method: **GET**
4. Path: `/email_groups`
5. Click **"Create"**

### Step 2: Add Function Stack
1. Click **"Add Function Stack"**
2. Select **"Query all records"**
3. Table: **email_group**
4. Click **"Add"**

### Step 3: Add Sort
1. Click **"Add Sort"**
2. Field: **name**
3. Order: **Ascending**

### Step 4: Save
1. Click **"Save"**
2. Test in API playground

---

## Endpoint 7: GET /email_groups/{id}

### Step 1: Create Endpoint
1. Go to **API** section
2. Click **"Add API Endpoint"**
3. Method: **GET**
4. Path: `/email_groups/{id}`
5. Click **"Create"**

### Step 2: Add Path Parameter
1. Xano automatically creates `id` parameter
2. Type: **integer**

### Step 3: Add Function Stack
1. Click **"Add Function Stack"**
2. Select **"Query single record"**
3. Table: **email_group**
4. Filter: `id` equals `inputs.id`
5. Click **"Add"**

### Step 4: Save
1. Click **"Save"**
2. Test with a group ID

---

## Endpoint 8: POST /email_groups

### Step 1: Create Endpoint
1. Go to **API** section
2. Click **"Add API Endpoint"**
3. Method: **POST**
4. Path: `/email_groups`
5. Click **"Create"**

### Step 2: Add Body Inputs
1. Click **"Add Input"**
2. Name: `name`, Type: **text**, Required: **Yes**
3. Click **"Add Input"**
4. Name: `description`, Type: **text**, Required: **No**

### Step 3: Add Function Stack
1. Click **"Add Function Stack"**
2. Select **"Add Record"**
3. Table: **email_group**
4. Map fields:
   - `name` → `inputs.name`
   - `description` → `inputs.description`
5. Click **"Add"**

### Step 4: Save
1. Click **"Save"**
2. Test by creating a group

---

## Endpoint 9: PATCH /email_groups/{id}

### Step 1: Create Endpoint
1. Go to **API** section
2. Click **"Add API Endpoint"**
3. Method: **PATCH**
4. Path: `/email_groups/{id}`
5. Click **"Create"**

### Step 2: Add Path Parameter
1. Xano automatically creates `id` parameter
2. Type: **integer**

### Step 3: Add Body Inputs
1. Click **"Add Input"**
2. Name: `name`, Type: **text**, Required: **No**
3. Click **"Add Input"**
4. Name: `description`, Type: **text**, Required: **No**

### Step 4: Add Function Stack
1. Click **"Add Function Stack"**
2. Select **"Edit Record"**
3. Table: **email_group**
4. Filter: `id` equals `inputs.id`
5. Map fields:
   - `name` → `inputs.name`
   - `description` → `inputs.description`
6. Click **"Add"**

### Step 5: Save
1. Click **"Save"**
2. Test by updating a group

---

## Endpoint 10: DELETE /email_groups/{id}

### Step 1: Create Endpoint
1. Go to **API** section
2. Click **"Add API Endpoint"**
3. Method: **DELETE**
4. Path: `/email_groups/{id}`
5. Click **"Create"**

### Step 2: Add Path Parameter
1. Xano automatically creates `id` parameter
2. Type: **integer**

### Step 3: Add Function Stack - Delete Related Records
1. Click **"Add Function Stack"**
2. Select **"Query all records"**
3. Table: **contact_group**
4. Filter: `group_id` equals `inputs.id`
5. Click **"Add"**
6. Then select **"Delete Records"** (for the query result)

### Step 4: Add Function Stack - Delete Group
1. Click **"Add Function Stack"**
2. Select **"Delete Record"**
3. Table: **email_group**
4. Filter: `id` equals `inputs.id`
5. Click **"Add"**

### Step 5: Save
1. Click **"Save"**
2. Test by deleting a group

---

## Endpoint 11: GET /email_groups/{group_id}/contacts

### Step 1: Create Endpoint
1. Go to **API** section
2. Click **"Add API Endpoint"**
3. Method: **GET**
4. Path: `/email_groups/{group_id}/contacts`
5. Click **"Create"**

### Step 2: Add Path Parameter
1. Xano automatically creates `group_id` parameter
2. Type: **integer**

### Step 3: Add Function Stack - Get Contact IDs
1. Click **"Add Function Stack"**
2. Select **"Query all records"**
3. Table: **contact_group**
4. Filter: `group_id` equals `inputs.group_id`
5. Click **"Add"**

### Step 4: Add Function Stack - Get Contacts
1. Click **"Add Function Stack"**
2. Select **"Query all records"**
3. Table: **email_contact**
4. Filter: `id` is in the list of contact_ids from previous step
5. Click **"Add"**

### Step 5: Add Sort
1. Click **"Add Sort"**
2. Field: **first_name**
3. Order: **Ascending**

### Step 6: Save
1. Click **"Save"**
2. Test with a group ID

---

## After Creating All Endpoints

### 1. Test Each Endpoint
1. Go to **API** section
2. Click on each endpoint
3. Click **"Run & Debug"**
4. Enter test data
5. Click **"Run"**
6. Verify response

### 2. Configure CORS
1. Go to **API** → **Settings** → **CORS**
2. Click **"Add Origin"**
3. Add: `https://deploy-preview-15--gleaming-cendol-417bf3.netlify.app`
4. Click **"Add Origin"** again
5. Add: `https://gleaming-cendol-417bf3.netlify.app`
6. Enable all methods:
   - ✅ GET
   - ✅ POST
   - ✅ PATCH
   - ✅ DELETE
   - ✅ PUT
   - ✅ HEAD
7. Click **"Save"**

### 3. Get Your API URL
1. Go to **API** → **Settings**
2. Look for **"Base URL"** or **"API URL"**
3. Copy the URL (looks like: `https://xxxx-xxxx-xxxx.n7.xano.io/api:xxxxxxxx`)
4. Save this - you'll need it for Netlify

### 4. Add Sample Data
Test by creating:
- 2-3 contacts
- 1-2 groups

---

## Quick Reference

### Endpoint Summary:
1. ✅ GET /email_contacts - List all contacts
2. ✅ GET /email_contacts/{id} - Get one contact
3. ✅ POST /email_contacts - Create contact
4. ✅ PATCH /email_contacts/{id} - Update contact
5. ✅ DELETE /email_contacts/{id} - Delete contact
6. ✅ GET /email_groups - List all groups
7. ✅ GET /email_groups/{id} - Get one group
8. ✅ POST /email_groups - Create group
9. ✅ PATCH /email_groups/{id} - Update group
10. ✅ DELETE /email_groups/{id} - Delete group
11. ✅ GET /email_groups/{group_id}/contacts - Get contacts in group

### Time Estimate:
- Each endpoint: ~2-3 minutes
- Total time: ~25-35 minutes
- CORS setup: ~2 minutes
- Testing: ~5 minutes

**Total: ~30-45 minutes**

---

## Need Help?

### Common Issues:

**Can't find "Add API Endpoint"**
- Make sure you're in the **API** section (not Database)
- Look for a blue **"+"** button or **"Add"** button

**Don't see "Query all records"**
- Look for **"Database Request"** or **"Query"** in the function stack options
- Select your table from the dropdown

**Filters not working**
- Make sure you're using the correct field names
- Check that input names match exactly

**CORS errors**
- Double-check URLs are added correctly
- Make sure all HTTP methods are enabled
- Save and wait a minute for changes to apply

---

**Ready to start?** Begin with Endpoint 1 and work through each one! 🚀