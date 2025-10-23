# End-to-End Testing Guide
## Complete Email Marketing & Member Management System

## Overview

This guide provides a comprehensive testing plan for all components of your social engagement hub. Follow these tests in order to ensure everything works correctly before going live.

---

## Prerequisites

Before testing, ensure:

- ✅ All Xano tables created
- ✅ All Xano API endpoints created
- ✅ SendGrid account set up and verified
- ✅ Environment variables configured
- ✅ Application running locally (`npm start`)

---

## Test 1: Contact Management

### 1.1 Create Contact

**Steps:**
1. Navigate to Email → Contacts
2. Click "Add Contact" button
3. Fill in form:
   - Email: test1@example.com
   - First Name: Test
   - Last Name: User
   - Status: Subscribed
   - Member Type: Contact
4. Click "Save"

**Expected Result:**
- ✅ Contact appears in list
- ✅ Success message shown
- ✅ Contact count updated

**Troubleshooting:**
- If fails: Check Xano `/email_contacts` endpoint
- Verify CORS is enabled
- Check browser console for errors

---

### 1.2 Edit Contact

**Steps:**
1. Click edit icon on test contact
2. Change first name to "Updated"
3. Click "Save"

**Expected Result:**
- ✅ Name updated in list
- ✅ Success message shown

---

### 1.3 Search Contact

**Steps:**
1. Type "Updated" in search box
2. Press Enter

**Expected Result:**
- ✅ Only matching contacts shown
- ✅ Results update in real-time

---

### 1.4 Filter Contacts

**Steps:**
1. Select "Subscribed" from status filter
2. Select "Contact" from member type filter

**Expected Result:**
- ✅ Only subscribed contacts shown
- ✅ Filters work independently

---

### 1.5 Import Contacts (CSV)

**Steps:**
1. Create CSV file:
   ```csv
   email,first_name,last_name,status
   import1@example.com,Import,User1,subscribed
   import2@example.com,Import,User2,subscribed
   ```
2. Click "Import" button
3. Select CSV file
4. Click "Import"

**Expected Result:**
- ✅ Success message with count
- ✅ Contacts appear in list
- ✅ Duplicates skipped

---

### 1.6 Export Contacts

**Steps:**
1. Click "Export" button
2. Select format (CSV)
3. Click "Download"

**Expected Result:**
- ✅ CSV file downloads
- ✅ Contains all contacts
- ✅ Proper formatting

---

### 1.7 Bulk Operations

**Steps:**
1. Select 3-5 contacts (checkboxes)
2. Click "Bulk Actions" dropdown
3. Select "Update Status"
4. Choose "Unsubscribed"
5. Click "Apply"

**Expected Result:**
- ✅ All selected contacts updated
- ✅ Status changed to unsubscribed
- ✅ Success message shown

---

### 1.8 Delete Contact

**Steps:**
1. Click delete icon on a contact
2. Confirm deletion

**Expected Result:**
- ✅ Contact removed from list
- ✅ Confirmation dialog shown
- ✅ Count updated

---

## Test 2: Email Groups

### 2.1 Create Group

**Steps:**
1. Navigate to Email → Groups
2. Click "Create Group" button
3. Fill in form:
   - Name: Newsletter Subscribers
   - Description: Main newsletter list
4. Click "Create"

**Expected Result:**
- ✅ Group appears in list
- ✅ Contact count shows 0
- ✅ Success message shown

---

### 2.2 Add Contacts to Group

**Steps:**
1. Click on "Newsletter Subscribers" group
2. Click "Add Contacts" button
3. Select 5-10 contacts
4. Click "Add to Group"

**Expected Result:**
- ✅ Contacts added to group
- ✅ Contact count updated
- ✅ Contacts visible in group view

---

### 2.3 Remove Contact from Group

**Steps:**
1. In group view, click remove icon on a contact
2. Confirm removal

**Expected Result:**
- ✅ Contact removed from group
- ✅ Contact count decreased
- ✅ Contact still exists in main list

---

### 2.4 View Group Statistics

**Steps:**
1. Click on group name
2. View statistics panel

**Expected Result:**
- ✅ Total contacts shown
- ✅ Subscribed count shown
- ✅ Member vs contact breakdown
- ✅ Recent additions listed

---

### 2.5 Edit Group

**Steps:**
1. Click edit icon on group
2. Change description
3. Click "Save"

**Expected Result:**
- ✅ Description updated
- ✅ Success message shown

---

### 2.6 Delete Group

**Steps:**
1. Create a test group with no contacts
2. Click delete icon
3. Confirm deletion

**Expected Result:**
- ✅ Group removed from list
- ✅ Contacts not affected
- ✅ Success message shown

---

## Test 3: Email Campaigns

### 3.1 Create Campaign

**Steps:**
1. Navigate to Email → Campaigns
2. Click "New Campaign" button
3. Fill in campaign details:
   - Name: Test Newsletter
   - Subject: Welcome to our newsletter!
   - From Name: Your verified sender name
   - From Email: Your verified sender email
4. Click "Next" or "Create"

**Expected Result:**
- ✅ Campaign created
- ✅ Opens in builder view
- ✅ Campaign appears in draft status

---

### 3.2 Add Content Blocks

**Steps:**
1. In campaign builder, add blocks:
   - Add Heading block: "Welcome!"
   - Add Text block: "Thank you for subscribing..."
   - Add Image block: (use any image URL)
   - Add Button block: "Visit Website"
2. Customize each block:
   - Change heading color
   - Format text (bold, italic)
   - Set button color and URL

**Expected Result:**
- ✅ All blocks added successfully
- ✅ Blocks can be reordered (drag or up/down)
- ✅ Styling changes apply immediately
- ✅ Preview updates in real-time

---

### 3.3 Save Campaign

**Steps:**
1. Click "Save Campaign" button
2. Return to campaigns list

**Expected Result:**
- ✅ Campaign saved
- ✅ Status shows "Draft"
- ✅ Can reopen and edit

---

### 3.4 Preview Campaign

**Steps:**
1. Open saved campaign
2. Click "Preview" button

**Expected Result:**
- ✅ Email preview shown
- ✅ All blocks render correctly
- ✅ Styling applied properly
- ✅ Responsive design works

---

### 3.5 Send Test Email

**Steps:**
1. In campaign builder, click "Send Test"
2. Enter your email address
3. Click "Send"

**Expected Result:**
- ✅ Test email sent
- ✅ Email received in inbox
- ✅ Content displays correctly
- ✅ Links work
- ✅ Images load

**Important:** Check spam folder if not received within 2 minutes.

---

### 3.6 Send Campaign to Group

**Steps:**
1. Click "Send Campaign" button
2. Select "Newsletter Subscribers" group
3. Review recipient count
4. Click "Send Now" (or schedule for later)

**Expected Result:**
- ✅ Campaign status changes to "Sending"
- ✅ Progress indicator shown
- ✅ Recipients receive emails
- ✅ Status changes to "Sent" when complete

**Note:** For testing, use a small group (5-10 contacts) with your own email addresses.

---

### 3.7 Track Email Opens

**Steps:**
1. Open one of the sent emails
2. Wait 30 seconds
3. Refresh campaign analytics page

**Expected Result:**
- ✅ Open count incremented
- ✅ Open rate calculated
- ✅ Opened timestamp recorded
- ✅ Recipient status updated to "opened"

---

### 3.8 Track Link Clicks

**Steps:**
1. Click a link in the email
2. Verify redirect works
3. Refresh campaign analytics page

**Expected Result:**
- ✅ Click count incremented
- ✅ Click rate calculated
- ✅ Clicked timestamp recorded
- ✅ Recipient status updated to "clicked"

---

### 3.9 View Campaign Analytics

**Steps:**
1. Navigate to campaign details
2. Click "Analytics" tab

**Expected Result:**
- ✅ Total sent count shown
- ✅ Open rate displayed
- ✅ Click rate displayed
- ✅ Bounce rate shown (if any)
- ✅ Timeline chart visible
- ✅ Top links listed

---

### 3.10 Duplicate Campaign

**Steps:**
1. Click "Duplicate" on an existing campaign
2. Modify name
3. Save

**Expected Result:**
- ✅ New campaign created
- ✅ All content copied
- ✅ Status set to "Draft"

---

## Test 4: Rich Formatting

### 4.1 Text Block Formatting

**Steps:**
1. Create new campaign
2. Add text block
3. Test all formatting options:
   - Bold, italic, underline
   - Font size (12-36px)
   - Font family (Arial, Georgia, etc.)
   - Text color
   - Background color
   - Alignment (left, center, right)
   - Line height
   - Padding

**Expected Result:**
- ✅ All formatting applies
- ✅ Preview updates immediately
- ✅ Styles persist after save
- ✅ Email renders correctly

---

### 4.2 Heading Block Styling

**Steps:**
1. Add heading block
2. Test:
   - Heading levels (H1-H4)
   - Font family
   - Color
   - Alignment

**Expected Result:**
- ✅ Heading sizes correct
- ✅ Styling applies
- ✅ Responsive in email

---

### 4.3 Image Block Options

**Steps:**
1. Add image block
2. Test:
   - Image URL input
   - Alt text
   - Width (100%, 75%, 50%, 25%)
   - Alignment (left, center, right)
   - Border radius
   - Link URL (optional)

**Expected Result:**
- ✅ Image displays
- ✅ Width adjusts correctly
- ✅ Alignment works
- ✅ Border radius applies
- ✅ Link works if set

---

### 4.4 Button Block Customization

**Steps:**
1. Add button block
2. Test:
   - Button text
   - Link URL
   - Button color
   - Text color
   - Border radius
   - Font size
   - Padding

**Expected Result:**
- ✅ Button renders correctly
- ✅ Colors apply
- ✅ Link works
- ✅ Hover state works (in email)

---

### 4.5 Divider and Spacer

**Steps:**
1. Add divider block
   - Change color
   - Change thickness
2. Add spacer block
   - Adjust height (10-200px)

**Expected Result:**
- ✅ Divider shows with correct style
- ✅ Spacer creates correct spacing
- ✅ Renders in email

---

### 4.6 HTML Block

**Steps:**
1. Add HTML block
2. Enter custom HTML:
   ```html
   <div style="background: #f0f0f0; padding: 20px; border-radius: 8px;">
     <h3 style="color: #2563eb;">Custom HTML</h3>
     <p>This is custom HTML content.</p>
   </div>
   ```
3. Preview

**Expected Result:**
- ✅ HTML renders in preview
- ✅ Styles apply
- ✅ Renders in email

---

## Test 5: Member Management

### 5.1 Create Member

**Steps:**
1. Navigate to Members section
2. Click "Add Member" button
3. Fill in form:
   - Name: Test Member
   - Email: member1@example.com
   - Role: Member
   - Status: Active
   - Bio: Test member account
4. Click "Create"

**Expected Result:**
- ✅ Member created
- ✅ Appears in list
- ✅ Join date set to today
- ✅ Activity counters at 0

---

### 5.2 Edit Member

**Steps:**
1. Click edit icon on member
2. Update:
   - Role: Editor
   - Bio: Updated bio
   - Location: New York
3. Click "Save"

**Expected Result:**
- ✅ Changes saved
- ✅ Updated info displayed
- ✅ Last updated timestamp changed

---

### 5.3 Filter Members

**Steps:**
1. Use role filter: Select "Editor"
2. Use status filter: Select "Active"
3. Use search: Type member name

**Expected Result:**
- ✅ Filters work independently
- ✅ Results update immediately
- ✅ Search is case-insensitive

---

### 5.4 Update Member Activity

**Steps:**
1. Simulate activity (if integrated):
   - Create a post as member
   - Add a comment
   - Like content
2. Check member profile

**Expected Result:**
- ✅ Activity counters increment
- ✅ Last active timestamp updates
- ✅ Statistics accurate

---

### 5.5 Bulk Update Roles

**Steps:**
1. Select multiple members
2. Click "Bulk Actions"
3. Select "Update Role"
4. Choose "Editor"
5. Click "Apply"

**Expected Result:**
- ✅ All selected members updated
- ✅ Roles changed
- ✅ Success message shown

---

### 5.6 View Member Statistics

**Steps:**
1. Navigate to Members → Statistics

**Expected Result:**
- ✅ Total members shown
- ✅ Active members count
- ✅ New this month count
- ✅ Breakdown by role
- ✅ Breakdown by status
- ✅ Top contributors listed

---

### 5.7 Delete Member

**Steps:**
1. Click delete icon on a test member
2. Confirm deletion

**Expected Result:**
- ✅ Member removed
- ✅ Confirmation required
- ✅ Related data handled (optional)

---

## Test 6: Integration Tests

### 6.1 Contact to Member Conversion

**Steps:**
1. Create email contact
2. Promote to member
3. Verify in both systems

**Expected Result:**
- ✅ Member created with same email
- ✅ Contact marked as member type
- ✅ Data synced

---

### 6.2 Member Email Campaign

**Steps:**
1. Create campaign
2. Send to "Members" group
3. Track engagement

**Expected Result:**
- ✅ Only members receive email
- ✅ Opens/clicks tracked
- ✅ Member activity updated

---

### 6.3 Blog to Email

**Steps:**
1. Create blog post
2. Click "Convert to Email"
3. Review converted campaign
4. Send to group

**Expected Result:**
- ✅ Blog content converted
- ✅ Images included
- ✅ Formatting preserved
- ✅ Campaign sends successfully

---

## Test 7: Error Handling

### 7.1 Duplicate Email

**Steps:**
1. Try to create contact with existing email
2. Try to create member with existing email

**Expected Result:**
- ✅ Error message shown
- ✅ No duplicate created
- ✅ User informed clearly

---

### 7.2 Invalid Email Format

**Steps:**
1. Try to create contact with invalid email (e.g., "notanemail")

**Expected Result:**
- ✅ Validation error shown
- ✅ Form not submitted
- ✅ Error message clear

---

### 7.3 Empty Required Fields

**Steps:**
1. Try to create campaign without subject
2. Try to send campaign without recipients

**Expected Result:**
- ✅ Validation errors shown
- ✅ Required fields highlighted
- ✅ Cannot proceed

---

### 7.4 SendGrid Errors

**Steps:**
1. Temporarily use invalid SendGrid API key
2. Try to send campaign

**Expected Result:**
- ✅ Error caught gracefully
- ✅ User informed of issue
- ✅ Campaign not marked as sent

---

### 7.5 Network Errors

**Steps:**
1. Disable network (or simulate)
2. Try to perform operations

**Expected Result:**
- ✅ Error messages shown
- ✅ No data corruption
- ✅ Retry options available

---

## Test 8: Performance Tests

### 8.1 Large Contact List

**Steps:**
1. Import 100+ contacts
2. Test list loading
3. Test search/filter performance

**Expected Result:**
- ✅ List loads within 2 seconds
- ✅ Search is responsive
- ✅ Pagination works

---

### 8.2 Large Campaign

**Steps:**
1. Create campaign with 20+ blocks
2. Test save/load time
3. Test preview generation

**Expected Result:**
- ✅ Saves within 3 seconds
- ✅ Loads within 2 seconds
- ✅ Preview generates quickly

---

### 8.3 Bulk Email Sending

**Steps:**
1. Send campaign to 50+ recipients
2. Monitor sending progress
3. Verify all sent

**Expected Result:**
- ✅ Sends complete within reasonable time
- ✅ Progress indicator accurate
- ✅ No emails lost
- ✅ All tracking works

---

## Test 9: Mobile Responsiveness

### 9.1 Mobile UI

**Steps:**
1. Open app on mobile device or use browser dev tools
2. Test all sections:
   - Contacts
   - Groups
   - Campaigns
   - Members

**Expected Result:**
- ✅ UI adapts to screen size
- ✅ All features accessible
- ✅ Touch targets adequate
- ✅ No horizontal scrolling

---

### 9.2 Email Rendering

**Steps:**
1. Open sent emails on:
   - iPhone Mail
   - Gmail Mobile
   - Android Email

**Expected Result:**
- ✅ Images load
- ✅ Text readable
- ✅ Buttons tappable
- ✅ Layout not broken

---

## Test 10: Security Tests

### 10.1 XSS Prevention

**Steps:**
1. Try to inject script in text fields:
   ```html
   <script>alert('XSS')</script>
   ```

**Expected Result:**
- ✅ Script not executed
- ✅ Content sanitized
- ✅ Displayed as text

---

### 10.2 SQL Injection (Xano handles this)

**Steps:**
1. Try SQL in search: `'; DROP TABLE members; --`

**Expected Result:**
- ✅ Treated as search text
- ✅ No database impact
- ✅ No errors

---

## Test Checklist Summary

### Contact Management
- [ ] Create contact
- [ ] Edit contact
- [ ] Search contacts
- [ ] Filter contacts
- [ ] Import CSV
- [ ] Export CSV
- [ ] Bulk operations
- [ ] Delete contact

### Email Groups
- [ ] Create group
- [ ] Add contacts to group
- [ ] Remove contacts from group
- [ ] View group statistics
- [ ] Edit group
- [ ] Delete group

### Email Campaigns
- [ ] Create campaign
- [ ] Add content blocks
- [ ] Save campaign
- [ ] Preview campaign
- [ ] Send test email
- [ ] Send to group
- [ ] Track opens
- [ ] Track clicks
- [ ] View analytics
- [ ] Duplicate campaign

### Rich Formatting
- [ ] Text formatting
- [ ] Heading styling
- [ ] Image options
- [ ] Button customization
- [ ] Divider/spacer
- [ ] HTML block

### Member Management
- [ ] Create member
- [ ] Edit member
- [ ] Filter members
- [ ] Update activity
- [ ] Bulk update roles
- [ ] View statistics
- [ ] Delete member

### Integration
- [ ] Contact to member conversion
- [ ] Member email campaign
- [ ] Blog to email

### Error Handling
- [ ] Duplicate email
- [ ] Invalid email
- [ ] Empty fields
- [ ] SendGrid errors
- [ ] Network errors

### Performance
- [ ] Large contact list
- [ ] Large campaign
- [ ] Bulk sending

### Mobile
- [ ] Mobile UI
- [ ] Email rendering

### Security
- [ ] XSS prevention
- [ ] SQL injection

---

## Troubleshooting Common Issues

### Emails Not Sending

1. Check SendGrid API key is correct
2. Verify sender email is verified in SendGrid
3. Check Netlify function logs
4. Verify campaign status in Xano

### Tracking Not Working

1. Check tracking pixel in email HTML
2. Verify tracking endpoints are accessible
3. Check recipient tracking_token is unique
4. Review Netlify function logs

### UI Not Loading Data

1. Check browser console for errors
2. Verify Xano API endpoints are correct
3. Check CORS settings in Xano
4. Verify environment variables

### Slow Performance

1. Add indexes to Xano tables
2. Implement pagination
3. Optimize queries
4. Use caching where appropriate

---

## Next Steps After Testing

1. ✅ Fix any issues found
2. ✅ Optimize performance bottlenecks
3. ✅ Document any workarounds
4. ➡️ **Deploy to production**
5. Monitor and iterate

---

**Testing Complete!** Once all tests pass, your email marketing and member management system is ready for production use.

