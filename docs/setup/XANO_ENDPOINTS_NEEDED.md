# Xano API Endpoints - What We Need to Create

## ✅ Tables Created (Confirmed)

All 5 tables have been created in Xano:
1. ✅ email_contact
2. ✅ email_group
3. ✅ contact_group
4. ✅ email_campaign (updated)
5. ✅ campaign_send

All indexes and relationships are in place.

---

## 📋 Required API Endpoints

Now we need to create 11 API endpoints to make the email system functional.

### Contact Management Endpoints (5 endpoints)

#### 1. GET /email_contacts
**Purpose**: Get all contacts with optional filtering

**Query Parameters**:
- `status` (optional) - Filter by status
- `member_type` (optional) - Filter by member type
- `search` (optional) - Search in email, first_name, last_name

**Implementation**:
```javascript
// Get all contacts
let contacts = this.query.email_contact;

// Apply status filter
if (inputs.status) {
    contacts = contacts.filter(item => item.status == inputs.status);
}

// Apply member_type filter
if (inputs.member_type) {
    contacts = contacts.filter(item => item.member_type == inputs.member_type);
}

// Apply search filter
if (inputs.search) {
    const searchTerm = inputs.search.toLowerCase();
    contacts = contacts.filter(item => 
        item.email.toLowerCase().includes(searchTerm) ||
        (item.first_name && item.first_name.toLowerCase().includes(searchTerm)) ||
        (item.last_name && item.last_name.toLowerCase().includes(searchTerm))
    );
}

// Sort by created_at descending
return contacts.sort((a, b) => b.created_at - a.created_at);
```

---

#### 2. GET /email_contacts/{id}
**Purpose**: Get a single contact by ID

**Path Parameter**: `id` (integer)

**Implementation**:
```javascript
const contact = this.query.email_contact.filter(item => item.id == inputs.id).first();

if (!contact) {
    return this.response.status(404).json({ error: 'Contact not found' });
}

return contact;
```

---

#### 3. POST /email_contacts
**Purpose**: Create a new contact

**Body Parameters**:
- `email` (required, text)
- `first_name` (optional, text)
- `last_name` (optional, text)
- `status` (optional, text, default: "subscribed")
- `member_type` (optional, text)

**Implementation**:
```javascript
// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!inputs.email || !emailRegex.test(inputs.email)) {
    return this.response.status(400).json({ error: 'Invalid email format' });
}

// Check for duplicate email
const existing = this.query.email_contact.filter(item => item.email == inputs.email).first();
if (existing) {
    return this.response.status(409).json({ error: 'Email already exists' });
}

// Create contact
const contact = this.addRecord('email_contact', {
    email: inputs.email,
    first_name: inputs.first_name || null,
    last_name: inputs.last_name || null,
    status: inputs.status || 'subscribed',
    member_type: inputs.member_type || null
});

return contact;
```

---

#### 4. PATCH /email_contacts/{id}
**Purpose**: Update an existing contact

**Path Parameter**: `id` (integer)

**Body Parameters** (all optional):
- `email` (text)
- `first_name` (text)
- `last_name` (text)
- `status` (text)
- `member_type` (text)

**Implementation**:
```javascript
const contact = this.query.email_contact.filter(item => item.id == inputs.id).first();

if (!contact) {
    return this.response.status(404).json({ error: 'Contact not found' });
}

// Validate email if provided
if (inputs.email && inputs.email !== contact.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputs.email)) {
        return this.response.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check for duplicate
    const existing = this.query.email_contact.filter(item => 
        item.email == inputs.email && item.id != inputs.id
    ).first();
    if (existing) {
        return this.response.status(409).json({ error: 'Email already exists' });
    }
}

// Update contact
const updated = this.updateRecord('email_contact', inputs.id, {
    email: inputs.email !== undefined ? inputs.email : contact.email,
    first_name: inputs.first_name !== undefined ? inputs.first_name : contact.first_name,
    last_name: inputs.last_name !== undefined ? inputs.last_name : contact.last_name,
    status: inputs.status !== undefined ? inputs.status : contact.status,
    member_type: inputs.member_type !== undefined ? inputs.member_type : contact.member_type
});

return updated;
```

---

#### 5. DELETE /email_contacts/{id}
**Purpose**: Delete a contact

**Path Parameter**: `id` (integer)

**Implementation**:
```javascript
const contact = this.query.email_contact.filter(item => item.id == inputs.id).first();

if (!contact) {
    return this.response.status(404).json({ error: 'Contact not found' });
}

// Delete related contact_group records (cascade delete)
this.query.contact_group.filter(item => item.contact_id == inputs.id).delete();

// Delete contact
this.deleteRecord('email_contact', inputs.id);

return { success: true, message: 'Contact deleted successfully' };
```

---

### Group Management Endpoints (6 endpoints)

#### 6. GET /email_groups
**Purpose**: Get all groups with contact count

**Implementation**:
```javascript
const groups = this.query.email_group.all();

return groups.map(group => {
    const contactCount = this.query.contact_group.filter(item => item.group_id == group.id).count();
    return {
        ...group,
        contact_count: contactCount
    };
}).sort((a, b) => a.name.localeCompare(b.name));
```

---

#### 7. GET /email_groups/{id}
**Purpose**: Get a single group by ID with contact count

**Path Parameter**: `id` (integer)

**Implementation**:
```javascript
const group = this.query.email_group.filter(item => item.id == inputs.id).first();

if (!group) {
    return this.response.status(404).json({ error: 'Group not found' });
}

const contactCount = this.query.contact_group.filter(item => item.group_id == inputs.id).count();

return {
    ...group,
    contact_count: contactCount
};
```

---

#### 8. POST /email_groups
**Purpose**: Create a new group

**Body Parameters**:
- `name` (required, text)
- `description` (optional, text)

**Implementation**:
```javascript
if (!inputs.name || inputs.name.trim() === '') {
    return this.response.status(400).json({ error: 'Group name is required' });
}

const group = this.addRecord('email_group', {
    name: inputs.name,
    description: inputs.description || null
});

return group;
```

---

#### 9. PATCH /email_groups/{id}
**Purpose**: Update a group

**Path Parameter**: `id` (integer)

**Body Parameters** (all optional):
- `name` (text)
- `description` (text)

**Implementation**:
```javascript
const group = this.query.email_group.filter(item => item.id == inputs.id).first();

if (!group) {
    return this.response.status(404).json({ error: 'Group not found' });
}

const updated = this.updateRecord('email_group', inputs.id, {
    name: inputs.name !== undefined ? inputs.name : group.name,
    description: inputs.description !== undefined ? inputs.description : group.description
});

return updated;
```

---

#### 10. DELETE /email_groups/{id}
**Purpose**: Delete a group

**Path Parameter**: `id` (integer)

**Implementation**:
```javascript
const group = this.query.email_group.filter(item => item.id == inputs.id).first();

if (!group) {
    return this.response.status(404).json({ error: 'Group not found' });
}

// Delete related contact_group records (cascade delete)
this.query.contact_group.filter(item => item.group_id == inputs.id).delete();

// Delete group
this.deleteRecord('email_group', inputs.id);

return { success: true, message: 'Group deleted successfully' };
```

---

#### 11. GET /email_groups/{group_id}/contacts
**Purpose**: Get all contacts in a specific group

**Path Parameter**: `group_id` (integer)

**Implementation**:
```javascript
const group = this.query.email_group.filter(item => item.id == inputs.group_id).first();

if (!group) {
    return this.response.status(404).json({ error: 'Group not found' });
}

// Get contact IDs in this group
const contactIds = this.query.contact_group
    .filter(item => item.group_id == inputs.group_id)
    .all()
    .map(item => item.contact_id);

if (contactIds.length === 0) {
    return [];
}

// Get contacts
const contacts = this.query.email_contact
    .filter(item => contactIds.includes(item.id))
    .all()
    .sort((a, b) => {
        const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
        const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
        return nameA.localeCompare(nameB);
    });

return contacts;
```

---

## 🚀 How to Create These Endpoints in Xano

### Method 1: Manual Creation (Recommended for Learning)

For each endpoint:

1. Go to **API** section in Xano
2. Click **"Add API Endpoint"**
3. Set the method (GET, POST, PATCH, DELETE)
4. Set the path (e.g., `/email_contacts`)
5. Add path parameters if needed (e.g., `{id}`)
6. Add query parameters if needed (e.g., `status`, `search`)
7. Add body inputs if needed (e.g., `email`, `first_name`)
8. Click **"Add Function Stack"**
9. Copy the implementation code above
10. Paste into the function stack
11. Click **"Save"**
12. Test in the API playground

### Method 2: Use Xano AI (Faster)

Copy this prompt and paste into Xano AI:

```
Create 11 API endpoints for email marketing system:

1. GET /email_contacts - Query email_contact table, support filters: status, member_type, search (in email, first_name, last_name), sort by created_at desc
2. GET /email_contacts/{id} - Get single contact, return 404 if not found
3. POST /email_contacts - Create contact, validate email format, check for duplicates, inputs: email (required), first_name, last_name, status (default "subscribed"), member_type
4. PATCH /email_contacts/{id} - Update contact, validate email if changed, check duplicates, inputs: email, first_name, last_name, status, member_type
5. DELETE /email_contacts/{id} - Delete contact and related contact_group records

6. GET /email_groups - Get all groups with contact_count from contact_group table, sort by name
7. GET /email_groups/{id} - Get single group with contact_count, return 404 if not found
8. POST /email_groups - Create group, inputs: name (required), description
9. PATCH /email_groups/{id} - Update group, inputs: name, description
10. DELETE /email_groups/{id} - Delete group and related contact_group records

11. GET /email_groups/{group_id}/contacts - Get all contacts in group, join email_contact with contact_group, sort by name

Enable CORS for all endpoints.
```

---

## ✅ Verification Checklist

After creating the endpoints, test each one:

### Contact Endpoints:
- [ ] GET /email_contacts - Returns empty array or contacts
- [ ] POST /email_contacts - Creates contact successfully
- [ ] GET /email_contacts/{id} - Returns single contact
- [ ] PATCH /email_contacts/{id} - Updates contact
- [ ] DELETE /email_contacts/{id} - Deletes contact

### Group Endpoints:
- [ ] GET /email_groups - Returns empty array or groups
- [ ] POST /email_groups - Creates group successfully
- [ ] GET /email_groups/{id} - Returns single group
- [ ] PATCH /email_groups/{id} - Updates group
- [ ] DELETE /email_groups/{id} - Deletes group
- [ ] GET /email_groups/{group_id}/contacts - Returns contacts in group

---

## 🔧 After Creating Endpoints

1. **Get your Xano API URL**
   - Go to API → Settings
   - Copy the base URL
   - Format: `https://xxxx-xxxx-xxxx.n7.xano.io/api:xxxxxxxx`

2. **Configure CORS**
   - Go to API → Settings → CORS
   - Add: `https://deploy-preview-15--gleaming-cendol-417bf3.netlify.app`
   - Add: `https://gleaming-cendol-417bf3.netlify.app`
   - Enable all HTTP methods

3. **Add to Netlify**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add: `REACT_APP_XANO_BASE_URL` = [Your Xano API URL]
   - Trigger new deploy

4. **Test the Email System**
   - Navigate to: https://deploy-preview-15--gleaming-cendol-417bf3.netlify.app/email
   - Try adding a contact
   - Verify it saves to Xano

---

**Ready to create the endpoints?** Use Method 1 for manual creation or Method 2 for Xano AI!