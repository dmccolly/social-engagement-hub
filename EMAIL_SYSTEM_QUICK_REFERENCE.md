# Email System Quick Reference

## 📊 Database Schema

```
┌─────────────────────────┐
│   email_contacts        │
├─────────────────────────┤
│ • id (PK)              │
│ • email (unique)       │
│ • first_name           │
│ • last_name            │
│ • member_type          │
│ • status               │
│ • created_at           │
│ • updated_at           │
└─────────────────────────┘
           │
           │ Many-to-Many
           │
┌──────────▼──────────────┐
│ email_group_contacts    │
├─────────────────────────┤
│ • id (PK)              │
│ • group_id (FK)        │
│ • contact_id (FK)      │
│ • added_at             │
└─────────────────────────┘
           │
           │
┌──────────▼──────────────┐
│   email_groups          │
├─────────────────────────┤
│ • id (PK)              │
│ • name                 │
│ • description          │
│ • created_at           │
│ • updated_at           │
└─────────────────────────┘
```

## 🔌 API Endpoints Summary

### Contacts
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/email_contacts` | List all contacts |
| POST | `/email_contacts` | Create contact |
| GET | `/email_contacts/{id}` | Get single contact |
| PATCH | `/email_contacts/{id}` | Update contact |
| DELETE | `/email_contacts/{id}` | Delete contact |

### Groups
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/email_groups` | List all groups |
| POST | `/email_groups` | Create group |
| GET | `/email_groups/{id}` | Get single group |
| PATCH | `/email_groups/{id}` | Update group |
| DELETE | `/email_groups/{id}` | Delete group |

### Group-Contact Relations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/email_groups/{id}/contacts` | Get group contacts |
| POST | `/email_groups/{id}/contacts` | Add contacts to group |
| DELETE | `/email_groups/{id}/contacts/{contact_id}` | Remove contact |

## 📝 Example API Calls

### Create a Contact
```bash
curl -X POST https://your-xano-url/api:branch/email_contacts \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "member_type": "member",
    "status": "subscribed"
  }'
```

### Create a Group
```bash
curl -X POST https://your-xano-url/api:branch/email_groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Newsletter Subscribers",
    "description": "Monthly newsletter recipients"
  }'
```

### Add Contacts to Group
```bash
curl -X POST https://your-xano-url/api:branch/email_groups/1/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "contact_ids": [1, 2, 3, 4, 5]
  }'
```

### Get All Contacts in a Group
```bash
curl https://your-xano-url/api:branch/email_groups/1/contacts
```

### Filter Contacts by Status
```bash
curl "https://your-xano-url/api:branch/email_contacts?status=subscribed"
```

### Search Contacts
```bash
curl "https://your-xano-url/api:branch/email_contacts?search=john"
```

## 🎯 Common Use Cases

### 1. Import Contacts from CSV
```javascript
import { importContacts } from './services/email/emailContactService';

const contacts = [
  { email: 'user1@example.com', first_name: 'User', last_name: 'One' },
  { email: 'user2@example.com', first_name: 'User', last_name: 'Two' }
];

const result = await importContacts(contacts);
console.log(`Imported: ${result.results.success}, Failed: ${result.results.failed}`);
```

### 2. Create a Group and Add Contacts
```javascript
import { createGroup, addContactsToGroup } from './services/email/emailGroupService';

// Create group
const groupResult = await createGroup({
  name: 'VIP Members',
  description: 'Our most valued members'
});

// Add contacts
await addContactsToGroup(groupResult.group.id, [1, 2, 3, 4, 5]);
```

### 3. Get Group Statistics
```javascript
import { getGroupStats } from './services/email/emailGroupService';

const stats = await getGroupStats(1);
console.log(`Total: ${stats.stats.total}`);
console.log(`Subscribed: ${stats.stats.subscribed}`);
console.log(`Members: ${stats.stats.members}`);
```

### 4. Bulk Update Contact Status
```javascript
import { bulkUpdateStatus } from './services/email/emailContactService';

// Unsubscribe multiple contacts
const result = await bulkUpdateStatus([1, 2, 3], 'unsubscribed');
console.log(`Updated: ${result.results.success}`);
```

### 5. Export Contacts to CSV
```javascript
import { exportContacts } from './services/email/emailContactService';

const result = await exportContacts({ status: 'subscribed' });
if (result.success) {
  // Download CSV
  const blob = new Blob([result.csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'contacts.csv';
  a.click();
}
```

## 🔍 Status Values

### Contact Status
- `subscribed` - Active, can receive emails
- `unsubscribed` - Opted out, cannot receive emails
- `bounced` - Email bounced, invalid address

### Member Type
- `member` - Registered member
- `non-member` - Newsletter subscriber only

## ⚡ Performance Tips

1. **Indexing:** Ensure indexes on frequently queried fields (status, member_type)
2. **Pagination:** Use limit/offset for large contact lists
3. **Caching:** Cache group statistics for better performance
4. **Batch Operations:** Use bulk functions for multiple operations

## 🚨 Error Handling

### Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| 404 Not Found | Endpoint doesn't exist | Verify endpoint path |
| 409 Conflict | Duplicate email | Check if email exists first |
| 400 Bad Request | Invalid data | Validate input before sending |
| 500 Server Error | Database issue | Check Xano logs |

## 📱 React Components

### Available Components
- `EmailDashboard` - Main dashboard with stats
- `ContactManagement` - Contact list and management
- `ContactForm` - Add/edit contact form

### Usage Example
```javascript
import EmailDashboard from './components/email/EmailDashboard';

function App() {
  return <EmailDashboard />;
}
```

## 🧪 Testing

Run the test suite:
```bash
node test-email-functions.js
```

Expected output:
```
✅ Test 1: Get Contacts
✅ Test 2: Get Groups
✅ Test 3: Create Contact
✅ Test 4: Create Group
✅ Test 5: Update Contact
✅ Test 6: Delete Contact

✅ Passed: 6
❌ Failed: 0
📈 Total: 6
```

## 📚 Additional Resources

- Full Setup Guide: `EMAIL_SYSTEM_SETUP.md`
- Service Files: `src/services/email/`
- Component Files: `src/components/email/`
- Test Script: `test-email-functions.js`