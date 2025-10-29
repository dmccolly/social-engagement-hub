# Visitor Endpoints Documentation

## Overview

Successfully created and configured **6 visitor endpoints** for the Social Engagement Hub interface in Xano. All endpoints are located in the **EmailMarketing API Group (ID: 6)** within the **Digital Media Archive workspace**.

---

## Endpoints Summary

| ID  | Method | Endpoint | Description | Inputs |
|-----|--------|----------|-------------|--------|
| 133 | GET | `/visitor/profile` | Get visitor profile by token | `visitor_token` |
| 134 | PUT | `/visitor/profile` | Update visitor profile | `visitor_token`, `first_name`, `last_name` |
| 135 | POST | `/visitor/posts` | Create a new visitor post | `visitor_token`, `content` |
| 136 | GET | `/visitor/posts` | Get all approved visitor posts | None |
| 137 | POST | `/visitor/posts/{id}/replies` | Reply to a visitor post | `id`, `visitor_token`, `content` |
| 138 | POST | `/visitor/posts/{id}/like` | Like a visitor post | `id`, `visitor_token` |

---

## Detailed Endpoint Specifications

### 1. GET /visitor/profile (ID: 133)

**Purpose:** Retrieve visitor profile information using a visitor token.

**Inputs:**
- `visitor_token` (text, required) - Unique token identifying the visitor

**Function Stack:**
1. Query the `visitor` table where `visitor_token` matches the input
2. Return the first matching visitor record

**Response:** Visitor object containing profile information

---

### 2. PUT /visitor/profile (ID: 134)

**Purpose:** Update visitor profile information.

**Inputs:**
- `visitor_token` (text, required) - Unique token identifying the visitor
- `first_name` (text, optional) - Updated first name
- `last_name` (text, optional) - Updated last name

**Function Stack:**
1. Query the `visitor` table to find the visitor by token
2. Patch the visitor record with new first_name and last_name
3. Return the updated visitor record

**Response:** Updated visitor object

---

### 3. POST /visitor/posts (ID: 135)

**Purpose:** Create a new visitor post (requires approval before appearing publicly).

**Inputs:**
- `visitor_token` (text, required) - Unique token identifying the visitor
- `content` (text, required) - Content of the post

**Function Stack:**
1. Query the `visitor` table to find the visitor by token
2. Add a new record to the `visitor_post` table with:
   - `visitor_id`: ID from the visitor query
   - `content`: Post content from input
   - `is_approved`: Set to `false` (requires admin approval)
3. Return the newly created post

**Response:** Newly created visitor_post object

---

### 4. GET /visitor/posts (ID: 136)

**Purpose:** Retrieve all approved visitor posts for public display.

**Inputs:** None

**Function Stack:**
1. Query the `visitor_post` table where `is_approved` is `true`
2. Return all matching posts

**Response:** Array of approved visitor_post objects

---

### 5. POST /visitor/posts/{id}/replies (ID: 137)

**Purpose:** Add a reply to an existing visitor post.

**Inputs:**
- `id` (int, required, from path) - ID of the post being replied to
- `visitor_token` (text, required) - Unique token identifying the visitor
- `content` (text, required) - Content of the reply

**Function Stack:**
1. Query the `visitor` table to find the visitor by token
2. Add a new record to the `visitor_reply` table with:
   - `visitor_post_id`: Post ID from path parameter
   - `visitor_id`: ID from the visitor query
   - `content`: Reply content from input
3. Return the newly created reply

**Response:** Newly created visitor_reply object

---

### 6. POST /visitor/posts/{id}/like (ID: 138)

**Purpose:** Like a visitor post (creates a like record).

**Inputs:**
- `id` (int, required, from path) - ID of the post being liked
- `visitor_token` (text, required) - Unique token identifying the visitor

**Function Stack:**
1. Query the `visitor` table to find the visitor by token
2. Add a new record to the `visitor_like` table with:
   - `visitor_post_id`: Post ID from path parameter
   - `visitor_id`: ID from the visitor query
3. Return the newly created like record

**Response:** Newly created visitor_like object

**Note:** The endpoint will create a like record each time it's called. If you need to prevent duplicate likes, consider adding a unique constraint on `(visitor_post_id, visitor_id)` in the `visitor_like` table at the database level.

---

## Database Tables Used

The endpoints interact with the following Xano database tables:

1. **visitor** - Stores visitor profile information
   - `id` (primary key)
   - `visitor_token` (unique identifier)
   - `first_name`
   - `last_name`
   - Other profile fields

2. **visitor_post** - Stores visitor posts
   - `id` (primary key)
   - `visitor_id` (foreign key to visitor)
   - `content`
   - `is_approved` (boolean)
   - Timestamp fields

3. **visitor_reply** - Stores replies to posts
   - `id` (primary key)
   - `visitor_post_id` (foreign key to visitor_post)
   - `visitor_id` (foreign key to visitor)
   - `content`
   - Timestamp fields

4. **visitor_like** - Stores post likes
   - `id` (primary key)
   - `visitor_post_id` (foreign key to visitor_post)
   - `visitor_id` (foreign key to visitor)
   - Timestamp fields

---

## Implementation Details

### XanoScript Syntax

All endpoints were created using XanoScript, Xano's declarative API definition language. Key syntax patterns used:

```xanoscript
// Query pattern
db.query table_name {
  where = $db.table.field == $input.field
  return = {type: "list"}
} as $variable_name

// Add pattern
db.add table_name {
  data = {
    field1: $input.value1
    field2: $var.other_variable.field
  }
} as $variable_name

// Patch pattern
db.patch table_name {
  field_name = "id"
  field_value = $var.record.id
  data = {
    field1: $input.new_value
  }
} as $variable_name
```

### Path Parameters

Path parameters (e.g., `{id}`) are defined in the query path string and automatically become available as inputs with `source = path`.

### Authentication

All endpoints use `visitor_token` for authentication. This token should be:
- Generated when a visitor is created
- Stored securely on the client side
- Sent with each request to identify the visitor

---

## Testing Recommendations

1. **Test visitor profile retrieval** with a valid `visitor_token`
2. **Test profile updates** to ensure first_name and last_name are properly updated
3. **Test post creation** and verify `is_approved` is set to `false`
4. **Test approved posts retrieval** to ensure only approved posts are returned
5. **Test reply creation** with valid post IDs
6. **Test like creation** and consider adding duplicate prevention at the database level

---

## Next Steps

1. **Configure CORS** settings in Xano to allow requests from your frontend domain
2. **Set up authentication middleware** if additional security is needed
3. **Add database constraints** such as unique constraints on visitor_like to prevent duplicates
4. **Create admin endpoints** for approving/rejecting visitor posts
5. **Add pagination** to the GET /visitor/posts endpoint for better performance with large datasets
6. **Implement rate limiting** to prevent abuse

---

## API Base URL

Your Xano instance base URL: `https://xajo-bs7d-cagt.n7e.xano.io`

The full endpoint URLs will be:
- `https://xajo-bs7d-cagt.n7e.xano.io/api:YOUR_API_GROUP_PATH/visitor/profile`
- etc.

Check your Xano dashboard for the exact API group path to use in production.

---

## Metadata API Access

- **Workspace ID:** 1
- **API Group ID:** 6 (EmailMarketing)
- **Endpoint IDs:** 133-138

All endpoints have been published and are ready for use.

---

*Documentation generated on October 29, 2025*
*All endpoints successfully created and verified*
