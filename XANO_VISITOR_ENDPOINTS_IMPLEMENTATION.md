# Xano Visitor Endpoints Implementation Guide

Complete step-by-step instructions for implementing all 6 visitor endpoints.

---

## Endpoint 1: GET /visitor/profile (#133)

### Inputs to Add:
1. Click "Add Input"
   - Name: `visitor_token`
   - Type: `text`
   - Required: ✓

### Function Stack:
1. **Query All Records**
   - Table: `visitor`
   - Filter: `visitor_token` == `input.visitor_token`
   - Variable name: `visitor1`

2. **Response**
   - Return: `var.visitor1[0]`

---

## Endpoint 2: PUT /visitor/profile (#134)

### Inputs to Add:
1. `visitor_token` (text, required)
2. `first_name` (text, required)
3. `last_name` (text, required)

### Function Stack:
1. **Query All Records**
   - Table: `visitor`
   - Filter: `visitor_token` == `input.visitor_token`
   - Variable name: `visitor1`

2. **Edit Record**
   - Table: `visitor`
   - Filter: `id` == `var.visitor1[0].id`
   - Fields to update:
     - `first_name`: `input.first_name`
     - `last_name`: `input.last_name`
   - Variable name: `visitor2`

3. **Response**
   - Return: `var.visitor2`

---

## Endpoint 3: POST /visitor/posts (#135)

### Inputs to Add:
1. `visitor_token` (text, required)
2. `content` (text, required)

### Function Stack:
1. **Query All Records**
   - Table: `visitor`
   - Filter: `visitor_token` == `input.visitor_token`
   - Variable name: `visitor1`

2. **Add Record**
   - Table: `visitor_post`
   - Fields:
     - `visitor_id`: `var.visitor1[0].id`
     - `content`: `input.content`
     - `is_approved`: `false`
   - Variable name: `visitor_post1`

3. **Response**
   - Return: `var.visitor_post1`

---

## Endpoint 4: GET /visitor/posts (#136)

### Inputs to Add:
- None

### Function Stack:
1. **Query All Records**
   - Table: `visitor_post`
   - Filter: `is_approved` == `true`
   - Variable name: `visitor_post1`

2. **Response**
   - Return: `var.visitor_post1`

---

## Endpoint 5: POST /visitor/posts/{id}/like (#138)

### Inputs to Add:
1. `id` (integer, required, **path parameter**)
2. `visitor_token` (text, required)

### Function Stack:
1. **Query All Records**
   - Table: `visitor`
   - Filter: `visitor_token` == `input.visitor_token`
   - Variable name: `visitor1`

2. **Query All Records**
   - Table: `visitor_like`
   - Filter: `visitor_post_id` == `input.id` AND `visitor_id` == `var.visitor1[0].id`
   - Variable name: `visitor_like1`

3. **Conditional**
   - Condition: `var.visitor_like1.count` == `0`
   - **If True:**
     - **Add Record**
       - Table: `visitor_like`
       - Fields:
         - `visitor_post_id`: `input.id`
         - `visitor_id`: `var.visitor1[0].id`
       - Variable name: `visitor_like2`
   - **Else:** (leave empty)

4. **Response**
   - Return: `var.visitor_like2`

---

## Endpoint 6: POST /visitor/posts/{id}/replies (#137)

### Inputs to Add:
1. `id` (integer, required, **path parameter**)
2. `visitor_token` (text, required)
3. `content` (text, required)

### Function Stack:
1. **Query All Records**
   - Table: `visitor`
   - Filter: `visitor_token` == `input.visitor_token`
   - Variable name: `visitor1`

2. **Add Record**
   - Table: `visitor_reply`
   - Fields:
     - `visitor_post_id`: `input.id`
     - `visitor_id`: `var.visitor1[0].id`
     - `content`: `input.content`
   - Variable name: `visitor_reply1`

3. **Response**
   - Return: `var.visitor_reply1`

---

## Quick Implementation Checklist

For each endpoint:
- [ ] Open the endpoint in Xano
- [ ] Add all inputs (check types and required status)
- [ ] Add functions in order
- [ ] Configure each function with the exact settings above
- [ ] Set the response
- [ ] Test with sample data

---

## Testing Tips

1. **Test GET /visitor/profile first** - Create a test visitor record with a known token
2. **Test PUT /visitor/profile** - Update that visitor's name
3. **Test POST /visitor/posts** - Create a test post
4. **Test GET /visitor/posts** - Should return empty until you manually approve a post
5. **Test POST /visitor/posts/{id}/like** - Like the post you created
6. **Test POST /visitor/posts/{id}/replies** - Reply to the post

---

## Common Issues

- **Path parameters**: Make sure `id` is marked as a path parameter, not body
- **Variable names**: Must match exactly (visitor1, visitor2, etc.)
- **Filters**: Use `==` for equality checks
- **Conditionals**: Use `.count` to check array length
