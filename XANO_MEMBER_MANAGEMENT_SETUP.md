# Xano Member Management Setup Guide

## Overview

This guide sets up the Member Management system in Xano. Members are different from email contacts - they are registered users of your platform with roles, activity tracking, and engagement metrics.

## Step 1: Create the Database Table

### 1.1 Create `members` Table

**Table Name:** `members`

**Fields:**

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `id` | integer | Auto-increment, Primary Key | Member ID |
| `name` | text | Required | Full name |
| `email` | text | Required, Unique | Email address |
| `role` | text | Default: "Member" | User role |
| `status` | text | Default: "Active" | Account status |
| `join_date` | date | Auto-set on create | Join date |
| `last_active` | timestamp | Optional | Last activity |
| `avatar_url` | text | Optional | Profile picture URL |
| `phone` | text | Optional | Phone number |
| `bio` | text (long) | Optional | Member biography |
| `location` | text | Optional | Location/city |
| `website` | text | Optional | Personal website |
| `social_links` | json | Optional | Social media links |
| `preferences` | json | Optional | User preferences |
| `posts_count` | integer | Default: 0 | Number of posts |
| `comments_count` | integer | Default: 0 | Number of comments |
| `likes_count` | integer | Default: 0 | Number of likes |
| `email_verified` | boolean | Default: false | Email verification status |
| `created_at` | timestamp | Auto-set on create | Creation date |
| `updated_at` | timestamp | Auto-update | Last update date |

**Field Details:**

1. **id** (integer)
   - Check "Auto Increment"
   - Check "Primary Key"

2. **email** (text)
   - Check "Required"
   - Check "Unique"

3. **role** (text)
   - Default: `Member`
   - Valid values: `Member`, `Editor`, `Moderator`, `Admin`

4. **status** (text)
   - Default: `Active`
   - Valid values: `Active`, `Inactive`, `Suspended`, `Banned`

5. **join_date** (date)
   - Check "Set on Create"
   - Use current date

6. **social_links** (json)
   - Example structure:
     ```json
     {
       "twitter": "@username",
       "linkedin": "linkedin.com/in/username",
       "facebook": "facebook.com/username"
     }
     ```

7. **preferences** (json)
   - Example structure:
     ```json
     {
       "newsletter": true,
       "notifications": true,
       "email_frequency": "daily"
     }
     ```

8. **Activity Counters:**
   - `posts_count`, `comments_count`, `likes_count`
   - Default: `0`
   - Updated by triggers or application logic

**Add Indexes:**
- `email` (already indexed due to unique constraint)
- `role`
- `status`
- `join_date`
- `last_active`

---

## Step 2: Create API Endpoints

### 2.1 Get All Members

**Endpoint:** `GET /members`

**Query Parameters:**
- `role` (text, optional) - Filter by role
- `status` (text, optional) - Filter by status
- `search` (text, optional) - Search by name or email
- `page` (integer, optional, default: 1)
- `limit` (integer, optional, default: 20)

**Function Stack:**

1. **Query all records** from `members`
   - Apply filters if provided:
     - If `role`: Add filter `role = $role`
     - If `status`: Add filter `status = $status`
     - If `search`: Add filter `name contains $search OR email contains $search`
   - Calculate pagination:
     - Offset = (page - 1) * limit
     - Limit = limit
   - Order by: `created_at DESC`

2. **Get total count**
   - Count all records matching filters

3. **Response**
   ```json
   {
     "success": true,
     "members": [array_of_members],
     "pagination": {
       "page": 1,
       "limit": 20,
       "total": 150,
       "total_pages": 8
     }
   }
   ```

---

### 2.2 Create Member

**Endpoint:** `POST /members`

**Body Parameters:**
- `name` (text, required)
- `email` (text, required)
- `role` (text, optional, default: "Member")
- `status` (text, optional, default: "Active")
- `phone` (text, optional)
- `bio` (text, optional)
- `location` (text, optional)
- `website` (text, optional)
- `social_links` (json, optional)
- `preferences` (json, optional)
- `avatar_url` (text, optional)

**Function Stack:**

1. **Validate email format**
   - Check email is valid format
   - If invalid: Return error

2. **Check for duplicate email**
   - Query `members` where `email = $email`
   - If found: Return error
     ```json
     {
       "success": false,
       "error": "Email already exists"
     }
     ```

3. **Add Record** to `members`
   - Set `join_date = TODAY()`
   - Set `posts_count = 0`, `comments_count = 0`, `likes_count = 0`
   - Set `email_verified = false`
   - Map all input fields

4. **Response**
   ```json
   {
     "success": true,
     "member": {created_member}
   }
   ```

---

### 2.3 Get Single Member

**Endpoint:** `GET /members/{member_id}`

**Path Parameter:**
- `member_id` (integer, required)

**Function Stack:**

1. **Query single record** from `members`
   - Filter: `id = $member_id`

2. **Check if found**
   - If not found: Return 404 error

3. **Get additional stats** (optional)
   - Recent activity
   - Group memberships
   - Campaign engagement

4. **Response**
   ```json
   {
     "success": true,
     "member": {member_with_stats}
   }
   ```

---

### 2.4 Update Member

**Endpoint:** `PATCH /members/{member_id}`

**Path Parameter:**
- `member_id` (integer, required)

**Body Parameters:** (all optional)
- `name`, `email`, `role`, `status`, `phone`, `bio`
- `location`, `website`, `social_links`, `preferences`
- `avatar_url`, `last_active`

**Function Stack:**

1. **Get existing record**
   - Query `members` where `id = $member_id`
   - If not found: Return 404 error

2. **Check email uniqueness** (if email is being updated)
   - If `$email` provided and different:
   - Query `members` where `email = $email` AND `id != $member_id`
   - If found: Return duplicate error

3. **Update Record** in `members`
   - Update only provided fields
   - Set `updated_at = NOW()`

4. **Response**
   ```json
   {
     "success": true,
     "member": {updated_member}
   }
   ```

---

### 2.5 Delete Member

**Endpoint:** `DELETE /members/{member_id}`

**Path Parameter:**
- `member_id` (integer, required)

**Function Stack:**

1. **Check if exists**
   - Query `members` where `id = $member_id`
   - If not found: Return 404 error

2. **Check if safe to delete**
   - Optionally check for related content (posts, comments)
   - Warn if member has content

3. **Delete Record** from `members`
   - Where `id = $member_id`

4. **Response**
   ```json
   {
     "success": true,
     "message": "Member deleted successfully"
   }
   ```

---

### 2.6 Bulk Update Members

**Endpoint:** `POST /members/bulk-update`

**Body Parameters:**
- `member_ids` (json array of integers, required)
- `updates` (json object, required) - Fields to update

**Example:**
```json
{
  "member_ids": [1, 2, 3, 4, 5],
  "updates": {
    "role": "Editor",
    "status": "Active"
  }
}
```

**Function Stack:**

1. **Validate inputs**
   - Check `member_ids` is not empty
   - Check `updates` has at least one field

2. **Loop through member_ids**
   - For each `member_id`:
   - Update record in `members` where `id = member_id`
   - Apply all fields from `updates` object

3. **Response**
   ```json
   {
     "success": true,
     "updated": {count_of_updated_records}
   }
   ```

---

### 2.7 Update Member Activity

**Endpoint:** `POST /members/{member_id}/activity`

**Path Parameter:**
- `member_id` (integer, required)

**Body Parameters:**
- `activity_type` (text, required) - Type of activity
- `increment` (integer, optional, default: 1) - Amount to increment

**Activity Types:**
- `post` - Increment `posts_count`
- `comment` - Increment `comments_count`
- `like` - Increment `likes_count`

**Function Stack:**

1. **Get member**
   - Query `members` where `id = $member_id`
   - If not found: Return 404 error

2. **Update activity counter**
   - Based on `activity_type`:
     - If `post`: Increment `posts_count`
     - If `comment`: Increment `comments_count`
     - If `like`: Increment `likes_count`
   - Set `last_active = NOW()`

3. **Response**
   ```json
   {
     "success": true,
     "member": {updated_member}
   }
   ```

---

### 2.8 Get Member Statistics

**Endpoint:** `GET /members/stats`

**Function Stack:**

1. **Calculate statistics**
   - Total members: Count all records
   - Active members: Count where `status = 'Active'`
   - New this month: Count where `join_date >= FIRST_DAY_OF_MONTH()`
   - By role: Group count by `role`
   - By status: Group count by `status`

2. **Get top contributors**
   - Query members ordered by `posts_count DESC`
   - Limit 10

3. **Response**
   ```json
   {
     "success": true,
     "stats": {
       "total": 1500,
       "active": 1200,
       "new_this_month": 45,
       "by_role": {
         "Member": 1400,
         "Editor": 80,
         "Moderator": 15,
         "Admin": 5
       },
       "by_status": {
         "Active": 1200,
         "Inactive": 250,
         "Suspended": 50
       },
       "top_contributors": [array_of_members]
     }
   }
   ```

---

### 2.9 Search Members

**Endpoint:** `GET /members/search`

**Query Parameters:**
- `q` (text, required) - Search query
- `limit` (integer, optional, default: 10)

**Function Stack:**

1. **Search members**
   - Query `members` where:
     - `name contains $q` OR
     - `email contains $q` OR
     - `location contains $q`
   - Order by relevance (exact matches first)
   - Limit results

2. **Response**
   ```json
   {
     "success": true,
     "results": [array_of_members],
     "count": {result_count}
   }
   ```

---

## Step 3: Optional - Member Activity Log

For detailed activity tracking, create an additional table:

### 3.1 Create `member_activity_log` Table

**Table Name:** `member_activity_log`

**Fields:**

| Field Name | Type | Settings | Description |
|------------|------|----------|-------------|
| `id` | integer | Auto-increment, Primary Key | Activity ID |
| `member_id` | integer | Required | Foreign key to members |
| `activity_type` | text | Required | Type of activity |
| `activity_description` | text | Optional | Description |
| `metadata` | json | Optional | Additional data |
| `ip_address` | text | Optional | IP address |
| `user_agent` | text | Optional | Browser info |
| `created_at` | timestamp | Auto-set on create | Activity timestamp |

**Activity Types:**
- `login`, `logout`, `post_created`, `comment_created`
- `profile_updated`, `email_opened`, `link_clicked`

### 3.2 Log Activity Endpoint

**Endpoint:** `POST /members/{member_id}/log`

**Body Parameters:**
- `activity_type` (text, required)
- `activity_description` (text, optional)
- `metadata` (json, optional)

**Function Stack:**

1. **Add record** to `member_activity_log`
   - Set all fields

2. **Update member last_active**
   - Update `members` set `last_active = NOW()` where `id = $member_id`

3. **Response**
   ```json
   {
     "success": true,
     "activity_id": {new_activity_id}
   }
   ```

---

## Step 4: Configure CORS

Same as previous setups - ensure CORS is enabled for your frontend domain.

---

## Step 5: Test the Endpoints

### Using Xano's Built-in Tester

1. **Create a test member:**
   ```json
   POST /members
   {
     "name": "John Doe",
     "email": "john@example.com",
     "role": "Member",
     "bio": "Test member account"
   }
   ```

2. **Update member:**
   ```json
   PATCH /members/1
   {
     "role": "Editor",
     "status": "Active"
   }
   ```

3. **Get member list:**
   ```
   GET /members?role=Editor&status=Active
   ```

4. **Update activity:**
   ```json
   POST /members/1/activity
   {
     "activity_type": "post",
     "increment": 1
   }
   ```

---

## Step 6: Test in the UI

1. Start your development server
2. Navigate to Members section
3. Test these features:
   - ✅ View member list
   - ✅ Add new member
   - ✅ Edit member details
   - ✅ Change member role
   - ✅ Change member status
   - ✅ Delete member
   - ✅ Search members
   - ✅ Filter by role/status
   - ✅ Bulk update roles
   - ✅ View member statistics

---

## Integration with Email System

### Link Members to Email Contacts

You can optionally link members to email contacts:

1. When creating a member, also create an email contact
2. When a contact becomes a member, update `member_type = 'member'`
3. Sync status changes between tables

**Example Integration Function:**

```javascript
// When creating a member
async function createMemberWithContact(memberData) {
  // Create member
  const member = await createMember(memberData);
  
  // Create email contact
  await createContact({
    email: memberData.email,
    first_name: memberData.name.split(' ')[0],
    last_name: memberData.name.split(' ').slice(1).join(' '),
    member_type: 'member',
    status: 'subscribed'
  });
  
  return member;
}
```

---

## Troubleshooting

### Issue: "Email already exists"

**Expected behavior** - Prevents duplicate accounts.

**Solution:** Use update instead of create, or use a different email.

### Issue: Activity counts not updating

**Solutions:**
1. Verify the activity update endpoint is being called
2. Check that increment logic is correct
3. Manually update counts if needed

### Issue: Role changes not taking effect

**Solutions:**
1. Clear browser cache
2. Verify role is being saved in database
3. Check frontend is reading updated role

---

## API Endpoint Summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/members` | List all members |
| POST | `/members` | Create new member |
| GET | `/members/{id}` | Get single member |
| PATCH | `/members/{id}` | Update member |
| DELETE | `/members/{id}` | Delete member |
| POST | `/members/bulk-update` | Update multiple members |
| POST | `/members/{id}/activity` | Update activity counters |
| GET | `/members/stats` | Get member statistics |
| GET | `/members/search` | Search members |
| POST | `/members/{id}/log` | Log activity (optional) |

---

## Database Schema Diagram

```
members                     member_activity_log (optional)
┌─────────────────┐        ┌──────────────────────┐
│ id              │◄───────│ member_id            │
│ name            │        │ activity_type        │
│ email (unique)  │        │ activity_description │
│ role            │        │ metadata             │
│ status          │        │ created_at           │
│ join_date       │        └──────────────────────┘
│ last_active     │
│ avatar_url      │
│ posts_count     │
│ comments_count  │
│ likes_count     │
│ ...             │
└─────────────────┘
```

---

## Next Steps

After completing Member Management setup:

1. ✅ Test all member operations
2. ✅ Create some test members
3. ✅ Test role and status changes
4. ✅ Verify activity tracking
5. ➡️ **Move to end-to-end testing**
6. Start using the complete system!

---

## Estimated Setup Time

- **Database table creation:** 10-15 minutes
- **API endpoints creation:** 60-90 minutes
- **Testing:** 15-20 minutes
- **Total:** ~2 hours

---

**Member Management is now complete!** You have a full user management system with roles, activity tracking, and statistics. Combined with the email system, you now have a complete social engagement platform.

