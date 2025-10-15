# How to Add Sort in Xano

## Visual Guide with Screenshots

### Method 1: Using the Query Function

When you add a "Query all records" function:

1. **Add the Query Function**
   - Click "Add Function Stack"
   - Select "Query all records" or "Database Request"
   - Choose your table (e.g., email_contact)

2. **Find the Sort Option**
   - Look for a section labeled **"Sort"** or **"Order By"**
   - It's usually below the "Filter" section
   - Click the **"+"** or **"Add Sort"** button

3. **Configure the Sort**
   - **Field**: Select the field to sort by (e.g., `created_at`, `name`, `email`)
   - **Direction**: Choose:
     - **Ascending** (A→Z, 1→9, oldest→newest)
     - **Descending** (Z→A, 9→1, newest→oldest)

4. **Save**
   - Click "Save" or "Apply"

---

## Common Sort Examples

### Sort contacts by newest first:
- Field: `created_at`
- Direction: **Descending** ⬇️

### Sort contacts by name alphabetically:
- Field: `first_name`
- Direction: **Ascending** ⬆️

### Sort groups by name:
- Field: `name`
- Direction: **Ascending** ⬆️

---

## Step-by-Step for Each Endpoint

### Endpoint 1: GET /email_contacts
**After adding "Query all records" function:**

1. Look for **"Sort"** section in the function
2. Click **"Add Sort"** or the **"+"** button
3. Select field: **created_at**
4. Select direction: **Descending** (newest first)
5. Done!

### Endpoint 6: GET /email_groups
**After adding "Query all records" function:**

1. Look for **"Sort"** section
2. Click **"Add Sort"**
3. Select field: **name**
4. Select direction: **Ascending** (A to Z)
5. Done!

### Endpoint 11: GET /email_groups/{group_id}/contacts
**After adding the final "Query all records" function:**

1. Look for **"Sort"** section
2. Click **"Add Sort"**
3. Select field: **first_name**
4. Select direction: **Ascending** (A to Z)
5. Done!

---

## Where to Find Sort in Xano Interface

### Visual Location:
```
┌─────────────────────────────────────┐
│ Query all records                   │
├─────────────────────────────────────┤
│ Table: email_contact                │
│                                     │
│ ▼ Filters                          │
│   [Add Filter]                     │
│                                     │
│ ▼ Sort                    ← HERE!  │
│   [Add Sort] ← Click this          │
│                                     │
│ ▼ Limit                            │
│   [Add Limit]                      │
└─────────────────────────────────────┘
```

---

## If You Can't Find "Sort"

### Try These:

1. **Look for "Order By"**
   - Some Xano versions call it "Order By" instead of "Sort"

2. **Expand the Function**
   - Click on the function to expand it
   - Look for collapsible sections

3. **Check Advanced Options**
   - Look for "Advanced" or "More Options"
   - Sort might be hidden there

4. **Use the Three Dots Menu**
   - Click the **⋮** (three dots) on the function
   - Look for "Add Sort" or "Order By"

---

## Alternative: Add Sort After Query

If you can't find sort in the query function:

1. **Add the Query function first** (without sort)
2. **Add another function** after it:
   - Click "Add Function Stack"
   - Look for **"Sort"** or **"Order"** function
   - Select it
3. **Configure the sort**:
   - Field: Choose your field
   - Direction: Ascending or Descending
4. **Save**

---

## Quick Reference

### For GET /email_contacts:
```
Sort by: created_at
Direction: Descending (⬇️)
Result: Newest contacts first
```

### For GET /email_groups:
```
Sort by: name
Direction: Ascending (⬆️)
Result: Alphabetical order A-Z
```

### For GET /email_groups/{group_id}/contacts:
```
Sort by: first_name
Direction: Ascending (⬆️)
Result: Alphabetical by first name
```

---

## Testing Your Sort

After adding sort:

1. **Save the endpoint**
2. **Click "Run & Debug"**
3. **Click "Run"**
4. **Check the results**:
   - Are they in the right order?
   - Newest first? Alphabetical?
5. **If wrong**: Go back and change direction

---

## Common Mistakes

❌ **Wrong direction**
- If you want newest first, use **Descending**
- If you want oldest first, use **Ascending**

❌ **Wrong field**
- Make sure you're sorting by the right field
- `created_at` for dates
- `name` or `first_name` for alphabetical

❌ **Forgot to save**
- Always click "Save" after adding sort
- Test to verify it works

---

## Need More Help?

If you still can't find the sort option:

1. **Take a screenshot** of your Xano function
2. **Look for these keywords**:
   - "Sort"
   - "Order By"
   - "Order"
   - "Arrange"
3. **Check Xano documentation**: https://docs.xano.com
4. **Or skip the sort** - it's optional, the endpoint will still work!

---

**Remember**: Sort is optional! If you can't find it, the endpoint will still work, just without ordering.