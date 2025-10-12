# 📋 Required Xano Endpoints for Phase 1

## Minimum Endpoints Needed Right Now

For the current email system to work, you need **exactly 11 endpoints**:

---

## Contact Management (5 endpoints)

### 1. GET /email_contacts
**Purpose**: Get all contacts with filtering
**Query Parameters**:
- `status` (optional) - Filter by status
- `member_type` (optional) - Filter by member type
- `search` (optional) - Search in email, first_name, last_name

**Response**:
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "subscribed",
    "member_type": "member",
    "created_at": "2025-01-10T12:00:00Z",
    "updated_at": "2025-01-10T12:00:00Z"
  }
]
```

---

### 2. GET /email_contacts/{id}
**Purpose**: Get a single contact by ID

**Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "status": "subscribed",
  "member_type": "member",
  "created_at": "2025-01-10T12:00:00Z",
  "updated_at": "2025-01-10T12:00:00Z"
}
```

---

### 3. POST /email_contacts
**Purpose**: Create a new contact

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "status": "subscribed",
  "member_type": "member"
}
```

**Response**: Returns the created contact with ID

---

### 4. PATCH /email_contacts/{id}
**Purpose**: Update an existing contact

**Request Body** (all fields optional):
```json
{
  "email": "updated@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "status": "unsubscribed",
  "member_type": "non-member"
}
```

**Response**: Returns the updated contact

---

### 5. DELETE /email_contacts/{id}
**Purpose**: Delete a contact

**Response**:
```json
{
  "success": true,
  "message": "Contact deleted"
}
```

---

## Group Management (6 endpoints)

### 6. GET /email_groups
**Purpose**: Get all groups

**Response**:
```json
[
  {
    "id": 1,
    "name": "Newsletter Subscribers",
    "description": "All newsletter subscribers",
    "created_at": "2025-01-10T12:00:00Z"
  }
]
```

---

### 7. GET /email_groups/{id}
**Purpose**: Get a single group by ID

**Response**:
```json
{
  "id": 1,
  "name": "Newsletter Subscribers",
  "description": "All newsletter subscribers",
  "created_at": "2025-01-10T12:00:00Z"
}
```

---

### 8. POST /email_groups
**Purpose**: Create a new group

**Request Body**:
```json
{
  "name": "VIP Members",
  "description": "Premium members only"
}
```

**Response**: Returns the created group with ID

---

### 9. PATCH /email_groups/{id}
**Purpose**: Update a group

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response**: Returns the updated group

---

### 10. DELETE /email_groups/{id}
**Purpose**: Delete a group

**Response**:
```json
{
  "success": true,
  "message": "Group deleted"
}
```

---

### 11. GET /email_groups/{group_id}/contacts
**Purpose**: Get all contacts in a specific group

**Response**:
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "subscribed",
    "member_type": "member"
  }
]
```

---

## Optional (For Future Features)

These endpoints are in the code but not actively used yet:

### 12. POST /email_groups/{group_id}/contacts
**Purpose**: Add contacts to a group
**Request Body**:
```json
{
  "contact_ids": [1, 2, 3]
}
```

### 13. DELETE /email_groups/{group_id}/contacts/{contact_id}
**Purpose**: Remove a contact from a group

---

## Quick Setup for Xano AI

Copy this simplified prompt:

```
Create these 11 API endpoints for an email marketing system:

CONTACT ENDPOINTS:
1. GET /email_contacts - return all contacts from email_contacts table, support query params: status, member_type, search
2. GET /email_contacts/{id} - return single contact by id
3. POST /email_contacts - create contact, inputs: email (required), first_name, last_name, status, member_type
4. PATCH /email_contacts/{id} - update contact, inputs: email, first_name, last_name, status, member_type
5. DELETE /email_contacts/{id} - delete contact by id

GROUP ENDPOINTS:
6. GET /email_groups - return all groups from email_groups table
7. GET /email_groups/{id} - return single group by id
8. POST /email_groups - create group, inputs: name (required), description
9. PATCH /email_groups/{id} - update group, inputs: name, description
10. DELETE /email_groups/{id} - delete group by id
11. GET /email_groups/{group_id}/contacts - return all contacts in a group (join email_contacts with contact_groups table)

Enable CORS for all endpoints.
```

---

## After Creating Endpoints

1. **Test in Xano**: Use the API playground to test each endpoint
2. **Get API URL**: Copy your base URL from Xano settings
3. **Update App**: Add to `.env` file:
   ```
   REACT_APP_XANO_BASE_URL=https://your-workspace.xano.io/api:your-key
   ```
4. **Add CORS**: Add preview URL to Xano CORS settings:
   ```
   https://deploy-preview-15--gleaming-cendol-417bf3.netlify.app
   ```

---

## Testing Checklist

- [ ] Can create a contact (POST /email_contacts)
- [ ] Can view all contacts (GET /email_contacts)
- [ ] Can view single contact (GET /email_contacts/{id})
- [ ] Can update a contact (PATCH /email_contacts/{id})
- [ ] Can delete a contact (DELETE /email_contacts/{id})
- [ ] Can view all groups (GET /email_groups)
- [ ] Can create a group (POST /email_groups)

Once these work, your email system will be fully functional! 🎉