# Xano DELETE Endpoint Issue - Handoff Document

## Current Status
**Date:** November 9, 2025  
**Issue:** DELETE endpoint for email groups returns "Missing param: search" error  
**Application:** Social Engagement Hub  
**Deployment:** https://gleaming-cendol-417bf3.netlify.app  
**Repository:** https://github.com/dmccolly/social-engagement-hub

---

## The Problem

When attempting to delete a mailing list, the application returns:
```json
{
  "code": "ERROR_CODE_INPUT_ERROR",
  "message": "Missing param: search",
  "payload": ["search"]
}
```

**Error occurs at:** `DELETE /email_groups/{id}` endpoint

---

## What Has Been Tried (All Failed)

### Attempt 1: Query String Parameter
```javascript
fetch(`${XANO_BASE_URL}/email_groups/${groupId}?search=${groupId}`, {
  method: 'DELETE',
})
```
**Result:** Still returned "Missing param: search"

### Attempt 2: JSON Body
```javascript
fetch(`${XANO_BASE_URL}/email_groups/${groupId}`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    search: groupId
  }),
})
```
**Result:** Still returned "Missing param: search"

### Attempt 3: URL-Encoded Form Data (Current)
```javascript
const formData = new URLSearchParams();
formData.append('search', groupId);

fetch(`${XANO_BASE_URL}/email_groups/${groupId}`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: formData.toString(),
})
```
**Result:** Still returned "Missing param: search"

---

## Current Code Location

**File:** `src/services/email/emailGroupService.js`  
**Function:** `deleteGroup(groupId)`  
**Lines:** Approximately 99-131

---

## Xano Backend Configuration Issue

The error message indicates the Xano backend DELETE endpoint is misconfigured. Based on previous analysis, the endpoint likely has:

1. **Malformed custom query** in the Xano DELETE endpoint configuration
2. **Expected format:** The endpoint expects a "search" parameter but the configuration may be incorrect
3. **Suspected issue:** Custom query might be `group_id = inputs.id == inputs.id` instead of `group_id == inputs.id`

---

## What Works

✅ Create mailing lists  
✅ Edit mailing lists  
✅ Add contacts to lists  
✅ Remove contacts from lists  
✅ Import/export contacts  
✅ All other CRUD operations  

❌ Delete mailing lists (only this fails)

---

## Other DELETE Endpoints That Work

The following DELETE endpoints work without issues:
- `DELETE /email_contacts/{id}` - No special parameters needed
- `DELETE /email_campaigns/{id}` - No special parameters needed
- `DELETE /email_groups/{groupId}/contacts/{contactId}` - No special parameters needed

**This suggests the issue is specific to the `/email_groups/{id}` DELETE endpoint configuration in Xano.**

---

## Xano API Base URL

```
https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5
```

Proxied through Netlify at: `/xano`

---

## Next Steps for Resolution

1. **Access Xano Dashboard** and navigate to the DELETE `/email_groups/{id}` endpoint
2. **Check the endpoint configuration:**
   - Look for any custom query filters
   - Check if there's a "search" parameter defined
   - Verify the query syntax
3. **Compare with working DELETE endpoints** (contacts, campaigns) to see configuration differences
4. **Test the endpoint directly** using Xano's API testing interface with various parameter formats

---

## Additional Context

- All contact management operations were recently fixed and now persist correctly to Xano
- The application uses React with Xano as the backend
- Netlify handles deployment and proxies Xano requests
- The frontend code is correct - the issue is definitively in the Xano backend configuration

---

## Files to Review

1. `src/services/email/emailGroupService.js` - Current DELETE implementation
2. `src/components/email/GroupManagement.js` - UI component calling the delete function
3. `src/services/emailAPI.js` - Alternative API implementation (also has DELETE for groups)

---

## Contact Information

**Repository Owner:** dmccolly  
**Latest Commit:** b410bb1 (Fix: Send search parameter as form data in DELETE request)  
**Branch:** main

---

## Summary

The Xano DELETE endpoint for `/email_groups/{id}` is misconfigured and expects a "search" parameter that cannot be satisfied from the frontend. Three different standard methods of sending parameters have been attempted (query string, JSON body, form data) and all fail with the same error. The issue requires fixing the Xano backend endpoint configuration, not the frontend code.