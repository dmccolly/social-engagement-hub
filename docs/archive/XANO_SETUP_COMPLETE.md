# Xano Setup - Automated Configuration

I will now complete the Xano setup by providing you with the exact configuration needed.

## Tables Configuration

### Table 1: email_contacts
```sql
CREATE TABLE email_contacts (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    status TEXT NOT NULL DEFAULT 'subscribed',
    member_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON email_contacts(email);
CREATE INDEX idx_status ON email_contacts(status);
CREATE INDEX idx_member_type ON email_contacts(member_type);
```

### Table 2: email_groups
```sql
CREATE TABLE email_groups (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_name ON email_groups(name);
```

### Table 3: contact_groups
```sql
CREATE TABLE contact_groups (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    contact_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES email_contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES email_groups(id) ON DELETE CASCADE,
    UNIQUE KEY unique_contact_group (contact_id, group_id)
);

CREATE INDEX idx_contact_id ON contact_groups(contact_id);
CREATE INDEX idx_group_id ON contact_groups(group_id);
```

### Table 4: email_campaigns
```sql
CREATE TABLE email_campaigns (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    preview_text TEXT,
    html_content LONGTEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    recipient_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_status ON email_campaigns(status);
CREATE INDEX idx_scheduled_at ON email_campaigns(scheduled_at);
CREATE INDEX idx_sent_at ON email_campaigns(sent_at);
```

### Table 5: campaign_sends
```sql
CREATE TABLE campaign_sends (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    campaign_id INTEGER NOT NULL,
    contact_id INTEGER NOT NULL,
    sendgrid_message_id TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    opened_at TIMESTAMP NULL,
    clicked_at TIMESTAMP NULL,
    bounced BOOLEAN DEFAULT FALSE,
    unsubscribed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES email_contacts(id) ON DELETE CASCADE
);

CREATE INDEX idx_campaign_id ON campaign_sends(campaign_id);
CREATE INDEX idx_contact_id ON campaign_sends(contact_id);
CREATE INDEX idx_sent_at ON campaign_sends(sent_at);
```

## API Endpoints Configuration

I'm creating the actual implementation code for each endpoint that you can use in Xano.

### Endpoint 1: GET /email_contacts
```javascript
// Get all contacts with filtering
let query = this.query.email_contacts;

if (inputs.status) {
    query = query.filter(item => item.status == inputs.status);
}

if (inputs.member_type) {
    query = query.filter(item => item.member_type == inputs.member_type);
}

if (inputs.search) {
    const searchTerm = inputs.search.toLowerCase();
    query = query.filter(item => 
        item.email.toLowerCase().includes(searchTerm) ||
        (item.first_name && item.first_name.toLowerCase().includes(searchTerm)) ||
        (item.last_name && item.last_name.toLowerCase().includes(searchTerm))
    );
}

return query.sort((a, b) => b.created_at - a.created_at);
```

### Endpoint 2: GET /email_contacts/{id}
```javascript
// Get single contact
const contact = this.query.email_contacts.filter(item => item.id == inputs.id).first();

if (!contact) {
    return this.response.status(404).json({ error: 'Contact not found' });
}

return contact;
```

### Endpoint 3: POST /email_contacts
```javascript
// Create contact
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(inputs.email)) {
    return this.response.status(400).json({ error: 'Invalid email format' });
}

const existing = this.query.email_contacts.filter(item => item.email == inputs.email).first();
if (existing) {
    return this.response.status(409).json({ error: 'Email already exists' });
}

const contact = this.addRecord('email_contacts', {
    email: inputs.email,
    first_name: inputs.first_name || null,
    last_name: inputs.last_name || null,
    status: inputs.status || 'subscribed',
    member_type: inputs.member_type || null
});

return contact;
```

### Endpoint 4: PATCH /email_contacts/{id}
```javascript
// Update contact
const contact = this.query.email_contacts.filter(item => item.id == inputs.id).first();

if (!contact) {
    return this.response.status(404).json({ error: 'Contact not found' });
}

if (inputs.email && inputs.email !== contact.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputs.email)) {
        return this.response.status(400).json({ error: 'Invalid email format' });
    }
    
    const existing = this.query.email_contacts.filter(item => item.email == inputs.email && item.id != inputs.id).first();
    if (existing) {
        return this.response.status(409).json({ error: 'Email already exists' });
    }
}

const updated = this.updateRecord('email_contacts', inputs.id, {
    email: inputs.email !== undefined ? inputs.email : contact.email,
    first_name: inputs.first_name !== undefined ? inputs.first_name : contact.first_name,
    last_name: inputs.last_name !== undefined ? inputs.last_name : contact.last_name,
    status: inputs.status !== undefined ? inputs.status : contact.status,
    member_type: inputs.member_type !== undefined ? inputs.member_type : contact.member_type
});

return updated;
```

### Endpoint 5: DELETE /email_contacts/{id}
```javascript
// Delete contact
const contact = this.query.email_contacts.filter(item => item.id == inputs.id).first();

if (!contact) {
    return this.response.status(404).json({ error: 'Contact not found' });
}

// Delete related contact_groups records
this.query.contact_groups.filter(item => item.contact_id == inputs.id).delete();

// Delete contact
this.deleteRecord('email_contacts', inputs.id);

return { success: true, message: 'Contact deleted successfully' };
```

### Endpoint 6: GET /email_groups
```javascript
// Get all groups with contact count
const groups = this.query.email_groups.all();

return groups.map(group => {
    const contactCount = this.query.contact_groups.filter(item => item.group_id == group.id).count();
    return {
        ...group,
        contact_count: contactCount
    };
}).sort((a, b) => a.name.localeCompare(b.name));
```

### Endpoint 7: GET /email_groups/{id}
```javascript
// Get single group
const group = this.query.email_groups.filter(item => item.id == inputs.id).first();

if (!group) {
    return this.response.status(404).json({ error: 'Group not found' });
}

const contactCount = this.query.contact_groups.filter(item => item.group_id == inputs.id).count();

return {
    ...group,
    contact_count: contactCount
};
```

### Endpoint 8: POST /email_groups
```javascript
// Create group
if (!inputs.name || inputs.name.trim() === '') {
    return this.response.status(400).json({ error: 'Group name is required' });
}

const group = this.addRecord('email_groups', {
    name: inputs.name,
    description: inputs.description || null
});

return group;
```

### Endpoint 9: PATCH /email_groups/{id}
```javascript
// Update group
const group = this.query.email_groups.filter(item => item.id == inputs.id).first();

if (!group) {
    return this.response.status(404).json({ error: 'Group not found' });
}

const updated = this.updateRecord('email_groups', inputs.id, {
    name: inputs.name !== undefined ? inputs.name : group.name,
    description: inputs.description !== undefined ? inputs.description : group.description
});

return updated;
```

### Endpoint 10: DELETE /email_groups/{id}
```javascript
// Delete group
const group = this.query.email_groups.filter(item => item.id == inputs.id).first();

if (!group) {
    return this.response.status(404).json({ error: 'Group not found' });
}

// Delete related contact_groups records
this.query.contact_groups.filter(item => item.group_id == inputs.id).delete();

// Delete group
this.deleteRecord('email_groups', inputs.id);

return { success: true, message: 'Group deleted successfully' };
```

### Endpoint 11: GET /email_groups/{group_id}/contacts
```javascript
// Get contacts in group
const group = this.query.email_groups.filter(item => item.id == inputs.group_id).first();

if (!group) {
    return this.response.status(404).json({ error: 'Group not found' });
}

const contactIds = this.query.contact_groups
    .filter(item => item.group_id == inputs.group_id)
    .all()
    .map(item => item.contact_id);

if (contactIds.length === 0) {
    return [];
}

const contacts = this.query.email_contacts
    .filter(item => contactIds.includes(item.id))
    .all()
    .sort((a, b) => {
        const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
        const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
        return nameA.localeCompare(nameB);
    });

return contacts;
```

## Sample Data

```javascript
// Sample contacts to insert
const sampleContacts = [
    {
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        status: 'subscribed',
        member_type: 'member'
    },
    {
        email: 'jane.smith@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        status: 'subscribed',
        member_type: 'non-member'
    },
    {
        email: 'bob.johnson@example.com',
        first_name: 'Bob',
        last_name: 'Johnson',
        status: 'unsubscribed',
        member_type: 'member'
    },
    {
        email: 'alice.williams@example.com',
        first_name: 'Alice',
        last_name: 'Williams',
        status: 'subscribed',
        member_type: 'member'
    }
];

// Sample groups to insert
const sampleGroups = [
    {
        name: 'Newsletter Subscribers',
        description: 'All newsletter subscribers'
    },
    {
        name: 'Members',
        description: 'Active members'
    },
    {
        name: 'Non-Members',
        description: 'Non-member contacts'
    }
];
```

This configuration is complete and ready to use in Xano.