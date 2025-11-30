# CSV Import Guide for Social Engagement Hub
## Mailing List Management

---

## Quick Start

### Step 1: Navigate to Subscriber Lists
1. Open your Social Engagement Hub
2. Go to the **Email Marketing** section
3. Click the **"Subscriber Lists"** tab

### Step 2: Select a List
Find the list you want to populate (e.g., "Members" or "Non-members")

### Step 3: Open Contact Manager
Click the blue **"Manage Contacts"** button at the bottom of the list card

### Step 4: Import Your CSV
1. Click the green **"Import CSV"** button
2. Select your CSV file
3. Wait for the import to complete
4. Review the success message

---

## CSV File Formats

### Format 1: Separate First and Last Names (Recommended)

```csv
Email,First Name,Last Name
john.doe@example.com,John,Doe
jane.smith@example.com,Jane,Smith
bob.johnson@example.com,Bob,Johnson
```

**Supported Column Names:**
- **Email:** `Email`, `E-mail`, `Email Address`
- **First Name:** `First Name`, `FirstName`, `First`, `Given Name`
- **Last Name:** `Last Name`, `LastName`, `Last`, `Surname`, `Family Name`

---

### Format 2: Full Name (Auto-Split)

```csv
Email,Name
john.doe@example.com,John Doe
jane.smith@example.com,Jane Smith
bob.johnson@example.com,Bob Johnson
```

**How it works:**
- The system automatically splits "John Doe" into First: "John", Last: "Doe"
- Works with space-separated names

**Supported Column Names:**
- **Name:** `Name`, `Full Name`, `FullName`

---

### Format 3: Last Name First (Comma-Separated)

```csv
Email,Name
john.doe@example.com,"Doe, John"
jane.smith@example.com,"Smith, Jane"
bob.johnson@example.com,"Johnson, Bob"
```

**How it works:**
- The system detects the comma and reverses the order
- "Doe, John" becomes First: "John", Last: "Doe"

---

### Format 4: Email Only (Minimal)

```csv
Email
john.doe@example.com
jane.smith@example.com
bob.johnson@example.com
```

**How it works:**
- Contacts are created with email only
- First and Last names will be empty

---

### Format 5: With Member Type

```csv
Email,First Name,Last Name,Member Type
john.doe@example.com,John,Doe,member
jane.smith@example.com,Jane,Smith,non-member
bob.johnson@example.com,Bob,Johnson,member
```

**Member Types:**
- `member` - Paid or registered members
- `non-member` - General subscribers or visitors

---

## CSV File Requirements

### Required
- ✅ **Email column** - Must be present and contain valid email addresses
- ✅ **Header row** - First row must contain column names
- ✅ **UTF-8 encoding** - Use UTF-8 for special characters

### Optional
- First Name / Last Name columns
- Full Name column
- Member Type column

### Validation
- ❌ Rows without email addresses will be **skipped**
- ❌ Duplicate emails will be **skipped** (if already in system)
- ✅ Valid rows will be **imported**

---

## Import Process

### What Happens During Import

1. **File Upload**
   - You select a CSV file from your computer
   - System reads the file content

2. **Header Detection**
   - System identifies column names
   - Maps columns to contact fields

3. **Row Processing**
   - Each row is validated
   - Email is checked for validity
   - Names are extracted and split if needed

4. **Contact Creation**
   - Valid contacts are created in XANO database
   - Each contact gets a unique ID
   - Status is set to "subscribed"

5. **List Assignment**
   - Imported contacts are automatically added to the selected list
   - List count is updated

6. **Results Display**
   - Success message shows number of contacts imported
   - Skipped rows are listed with reasons

---

## Sample CSV Files

### Sample 1: Basic Contact List
```csv
Email,First Name,Last Name
alice@example.com,Alice,Anderson
bob@example.com,Bob,Brown
carol@example.com,Carol,Clark
david@example.com,David,Davis
```

### Sample 2: Newsletter Subscribers
```csv
Email,Name
alice@example.com,Alice Anderson
bob@example.com,Bob Brown
carol@example.com,Carol Clark
david@example.com,David Davis
```

### Sample 3: Member Database
```csv
Email,First Name,Last Name,Member Type
alice@example.com,Alice,Anderson,member
bob@example.com,Bob,Brown,member
carol@example.com,Carol,Clark,non-member
david@example.com,David,Davis,member
```

---

## Troubleshooting

### Issue: "CSV file is empty or has no data rows"

**Cause:** The file has only a header row or is completely empty

**Solution:**
- Ensure your CSV has at least 2 rows (header + 1 data row)
- Check that the file isn't corrupted

---

### Issue: "No contacts were imported"

**Cause:** All rows were skipped due to validation errors

**Solution:**
- Check that email column exists and has valid emails
- Verify column names match supported formats
- Look at the skipped rows list for specific reasons

---

### Issue: "Imported X contacts but failed to add them to the list"

**Cause:** Contacts were created but couldn't be added to the group

**Solution:**
- Click "Save Changes" button to retry
- Check browser console for errors
- Verify XANO API connection

---

### Issue: Contacts appear in system but not in list

**Cause:** Group assignment failed

**Solution:**
1. Click "Save Changes" to retry
2. Manually select the contacts using checkboxes
3. Click "Save Changes" again

---

## Export CSV

### How to Export

1. Open Contact Manager for a list
2. Click the **"Export CSV"** button
3. File downloads automatically
4. Filename: `[ListName].csv`

### Export Format

```csv
Email,First Name,Last Name,Member Type,Status
alice@example.com,Alice,Anderson,member,subscribed
bob@example.com,Bob,Brown,non-member,subscribed
```

### Use Cases
- Backup your contact list
- Import into other systems
- Share with team members
- Analyze data in Excel/Google Sheets

---

## Advanced Features

### Bulk Operations

**Select All Contacts**
- Click checkbox in table header
- All filtered contacts are selected

**Deselect All**
- Click checkbox again to deselect

**Remove from List**
- Uncheck contacts you want to remove
- Click "Save Changes"

---

### Search and Filter

**Search by:**
- Email address
- First name
- Last name

**How to use:**
- Type in the search box
- Results filter automatically
- Search is case-insensitive

---

### Manual Contact Addition

**Add One Contact**
1. Click "Add Contact" button
2. Fill in the form:
   - Email (required)
   - First Name (optional)
   - Last Name (optional)
   - Member Type (optional)
3. Click "Add to List"

---

## Best Practices

### Before Import

1. ✅ **Clean your data**
   - Remove duplicate emails
   - Verify email format
   - Check for typos

2. ✅ **Use consistent formatting**
   - Same column names throughout
   - Consistent date formats
   - Standard character encoding (UTF-8)

3. ✅ **Test with small file first**
   - Import 5-10 contacts first
   - Verify results
   - Then import full list

### During Import

1. ✅ **Wait for completion**
   - Don't close the browser
   - Don't navigate away
   - Wait for success message

2. ✅ **Review results**
   - Check import count
   - Review skipped rows
   - Verify contacts appear

### After Import

1. ✅ **Verify data**
   - Check contact count
   - Spot-check names and emails
   - Test export to verify

2. ✅ **Save changes**
   - Click "Save Changes" if needed
   - Wait for confirmation
   - Refresh if necessary

---

## Limits and Performance

### File Size
- **Recommended:** Up to 1,000 contacts per file
- **Maximum:** No hard limit, but larger files take longer

### Import Speed
- **Small files (< 100 contacts):** 5-10 seconds
- **Medium files (100-500 contacts):** 15-30 seconds
- **Large files (500+ contacts):** 30-60+ seconds

### Browser Considerations
- Keep browser tab active during import
- Don't close or refresh the page
- Modern browsers (Chrome, Firefox, Edge) recommended

---

## FAQ

### Q: Can I import the same contact twice?
**A:** The system will skip contacts that already exist (based on email address)

### Q: What happens to contacts I remove from a list?
**A:** They remain in the system but are removed from that specific list

### Q: Can I import contacts into multiple lists?
**A:** Yes, import into one list, then use Contact Manager to add them to other lists

### Q: What if my CSV has extra columns?
**A:** Extra columns are ignored. Only recognized columns are imported.

### Q: Can I undo an import?
**A:** Not automatically. You'll need to manually remove contacts or delete the list.

### Q: How do I update existing contacts?
**A:** Currently, you need to manually edit contacts. Bulk update coming soon.

---

## Support

### Need Help?

1. **Check Browser Console**
   - Press F12 to open DevTools
   - Look for error messages
   - Share errors with support

2. **Verify XANO Connection**
   - Check Network tab in DevTools
   - Look for failed API calls
   - Verify authentication

3. **Contact Support**
   - Provide error messages
   - Share sample CSV (without sensitive data)
   - Describe steps taken

---

## Summary

The CSV import feature allows you to:

✅ Quickly populate mailing lists  
✅ Import from various CSV formats  
✅ Auto-split full names  
✅ Validate email addresses  
✅ Skip duplicates automatically  
✅ Export for backup  
✅ Manage contacts with search and filters  

**Remember:** Always test with a small file first, and keep your browser open during import!
