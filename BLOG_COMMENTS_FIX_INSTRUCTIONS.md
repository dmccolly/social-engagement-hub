# Blog Comments Fix - Instructions

## Problem
The blog comments are trying to load from the newsfeed API using blog post IDs, but blog posts don't have entries in the newsfeed_post table. This causes the "Failed to load comments" error.

## Solution
I've created a Netlify function (`netlify/functions/blog-comments.js`) that properly handles blog comments by:
1. Creating a newsfeed_post entry for each blog when the first comment is posted
2. Loading comments from the correct newsfeed_post entry
3. Supporting comment deletion for admins

## What You Need To Do

### Step 1: Deploy the Netlify Function
The new `blog-comments.js` function has been committed to the repository and will deploy automatically with the next Netlify build.

### Step 2: Update Webflow Page Code
You need to update the JavaScript code embedded in your Webflow "Social" page. Find this line (around line 610):

```javascript
const response = await fetch(`${NEWSFEED_URL}/${postId}/replies`);
```

**Change it to:**
```javascript
const BLOG_COMMENTS_URL = 'https://gleaming-cendol-417bf3.netlify.app/.netlify/functions/blog-comments';
const response = await fetch(`${BLOG_COMMENTS_URL}/${postId}`);
```

### Step 3: Update the postComment Function
Find the `postComment` function (around line 650) and change the fetch URL from:

```javascript
const response = await fetch(`${NEWSFEED_URL}/${postId}/replies`, {
```

**To:**
```javascript
const BLOG_COMMENTS_URL = 'https://gleaming-cendol-417bf3.netlify.app/.netlify/functions/blog-comments';
const response = await fetch(`${BLOG_COMMENTS_URL}/${postId}`, {
```

### Step 4: Update the handleDelete Function
Find the `handleDelete` function and change the delete URL from:

```javascript
const response = await fetch(`${NEWSFEED_URL}/${deleteConfirmId}`, {
```

**To:**
```javascript
const BLOG_COMMENTS_URL = 'https://gleaming-cendol-417bf3.netlify.app/.netlify/functions/blog-comments';
const response = await fetch(`${BLOG_COMMENTS_URL}/0/${commentId}`, {
```

## Alternative: Complete Script Replacement

If you prefer, I can provide you with the complete fixed JavaScript code that you can copy and paste to replace the entire blog widget script in your Webflow page. This would be easier than making individual changes.

Would you like me to create the complete replacement script?

## Testing After Fix

Once deployed:
1. Visit https://historyofidahobroadcasting.org/social
2. Click "Read more" on any blog post
3. The comments section should load without errors
4. Try posting a test comment
5. The comment should appear immediately

## Technical Details

The new API endpoint structure:
- `GET /blog-comments/:blogPostId` - Load comments for a blog
- `POST /blog-comments/:blogPostId` - Post a new comment
- `DELETE /blog-comments/:blogPostId/:commentId` - Delete a comment (admin only)

The function automatically creates a newsfeed_post entry for each blog the first time someone comments, using a special email format: `blog-{blogPostId}@historyofidahobroadcasting.org`

This keeps blog comments separate from regular newsfeed posts while reusing the existing comments infrastructure.
