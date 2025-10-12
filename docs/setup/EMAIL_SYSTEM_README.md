# 📧 Email Marketing System - Development Guide

## 🎯 Overview
This is an isolated email marketing system being developed separately from the existing blog functionality. It's built on the `feature/email-system` branch and won't affect production until merged.

## 🔒 Isolation Strategy
- **Separate Branch**: `feature/email-system`
- **Separate Routes**: All under `/email/*`
- **Separate Components**: In `src/components/email/`
- **Separate Services**: In `src/services/email/`
- **Separate Xano Tables**: No overlap with blog tables

## 📁 File Structure
```
src/
├── components/email/
│   ├── EmailDashboard.js       - Main email system dashboard
│   ├── ContactManagement.js    - Contact list and management
│   ├── ContactList.js          - Display contacts
│   ├── ContactForm.js          - Add/edit contacts
│   ├── GroupManagement.js      - Create and manage groups
│   ├── EmailEditor.js          - Email composition (reuses blog editor)
│   ├── CampaignBuilder.js      - Campaign creation
│   ├── NewsletterBuilder.js    - Newsletter composition
│   └── CampaignAnalytics.js    - Campaign statistics
│
├── services/email/
│   ├── emailContactService.js  - Contact CRUD operations
│   ├── emailGroupService.js    - Group management
│   ├── emailCampaignService.js - Campaign operations
│   └── sendgridService.js      - SendGrid API integration
│
└── styles/email/
    └── email.css               - Email system styles
```

## 🗄️ Xano Database Tables

### email_contacts
- id (integer, primary key)
- email (text, unique, required)
- first_name (text)
- last_name (text)
- status (text: 'subscribed', 'unsubscribed', 'bounced')
- member_type (text: 'member', 'non-member')
- created_at (timestamp)
- updated_at (timestamp)

### email_groups
- id (integer, primary key)
- name (text, required)
- description (text)
- created_at (timestamp)

### contact_groups (junction table)
- contact_id (integer, foreign key)
- group_id (integer, foreign key)

### email_campaigns
- id (integer, primary key)
- name (text, required)
- subject (text, required)
- preview_text (text)
- html_content (text, required)
- status (text: 'draft', 'scheduled', 'sent')
- scheduled_at (timestamp)
- sent_at (timestamp)
- recipient_count (integer)
- created_at (timestamp)

### campaign_sends
- id (integer, primary key)
- campaign_id (integer, foreign key)
- contact_id (integer, foreign key)
- sent_at (timestamp)
- opened_at (timestamp)
- clicked_at (timestamp)
- bounced (boolean)

## 🚀 Routes

All email system routes are under `/email/*`:

- `/email` - Dashboard
- `/email/contacts` - Contact management
- `/email/contacts/new` - Add new contact
- `/email/contacts/:id/edit` - Edit contact
- `/email/groups` - Group management
- `/email/campaigns` - Campaign list
- `/email/campaigns/new` - Create campaign
- `/email/campaigns/:id` - View campaign
- `/email/newsletters/new` - Create newsletter
- `/email/analytics` - Analytics dashboard

## 🧪 Testing

### Preview URL
Netlify automatically creates a preview URL for this branch:
```
https://feature-email-system--gleaming-cendol-417bf3.netlify.app/
```

### Testing Routes
- Dashboard: `/email`
- Contacts: `/email/contacts`
- Campaigns: `/email/campaigns`

### Production (Unchanged)
```
https://gleaming-cendol-417bf3.netlify.app/
```

## 📅 Development Timeline

### Week 1-2: Contact Management ✅ IN PROGRESS
- [x] Create feature branch
- [x] Set up file structure
- [ ] Create Xano tables
- [ ] Build contact list UI
- [ ] Build contact form
- [ ] Implement group management
- [ ] CSV import functionality

### Week 3-4: Email Editor
- [ ] Reuse blog editor components
- [ ] Add email-specific features
- [ ] SendGrid integration
- [ ] Test email sending
- [ ] Personalization tags

### Week 5: Campaign Management
- [ ] Campaign builder UI
- [ ] Recipient selection
- [ ] Campaign dashboard
- [ ] Send functionality

### Week 6-7: Newsletter Builder (Optional)
- [ ] Template system
- [ ] Multi-section layout
- [ ] Blog post insertion

## 🔧 Environment Variables

Add to Netlify (for preview and production):
```
REACT_APP_SENDGRID_API_KEY=your_sendgrid_api_key
REACT_APP_SENDGRID_FROM_EMAIL=your-email@domain.com
REACT_APP_SENDGRID_FROM_NAME=Your Name
```

## 📊 SendGrid Setup

### Free Tier Limits
- 100 emails/day
- 3,000 emails/month
- Perfect for your volume (1,500/month)

### Required Setup
1. Verify sender email in SendGrid
2. Get API key
3. Add to environment variables

## 🔒 Safety Features

### Isolation Guarantees
- ✅ Separate branch (won't affect main)
- ✅ Separate routes (won't conflict)
- ✅ Separate Xano tables (won't touch blog data)
- ✅ Separate components (won't modify blog code)
- ✅ Preview URL for testing (won't affect production)

### Rollback Plan
If anything goes wrong:
1. Simply don't merge the branch
2. Delete the branch if needed
3. Production remains untouched

## 🚀 Deployment Strategy

### Phase 1: Preview Testing
- Build features on feature branch
- Test on preview URL
- Iterate based on feedback

### Phase 2: Staging (Optional)
- Can create staging environment
- Full testing before production

### Phase 3: Production Merge
- Only when approved
- Merge to main
- Netlify auto-deploys

## 📝 Notes

- All email code is isolated in `src/components/email/`
- Blog functionality remains completely untouched
- Can develop and test for weeks/months before merging
- Easy to rollback if needed

## 🆘 Support

If you encounter issues:
1. Check preview URL is working
2. Verify Xano tables are created
3. Check SendGrid API key is set
4. Review console for errors

---

**Status**: 🟢 Active Development  
**Branch**: `feature/email-system`  
**Started**: 2025-10-11  
**Expected Completion**: 5-7 weeks