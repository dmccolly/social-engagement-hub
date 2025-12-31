# Minimal Changes to Enable Blog Comments

## Current Status
✅ Site is working  
✅ Blog posts are showing  
✅ Comments UI is visible  
❌ Comments stuck on "Loading comments..." because API endpoints are wrong

## The Problem
The JavaScript is calling the newsfeed API (`https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV/newsfeed_post`) but blog posts don't exist in that table.

## The Solution
Change ONLY 3 lines in the JavaScript to use the new blog-comments Netlify function.

## EXACT CHANGES NEEDED

### Change #1: Add the blog comments URL constant
**Find this line (around line 431):**
```javascript
const NEWSFEED_URL = 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV/newsfeed_post';
```

**Add this line RIGHT AFTER it:**
```javascript
const BLOG_COMMENTS_URL = 'https://gleaming-cendol-417bf3.netlify.app/.netlify/functions/blog-comments';
```

### Change #2: Update loadComments function
**Find this line (around line 555):**
```javascript
const response = await fetch(`${NEWSFEED_URL}/${postId}/replies`);
```

**Change it to:**
```javascript
const response = await fetch(`${BLOG_COMMENTS_URL}/${postId}`);
```

### Change #3: Update postComment function  
**Find this line (around line 682):**
```javascript
const response = await fetch(`${NEWSFEED_URL}/${postId}/replies`, {
```

**Change it to:**
```javascript
const response = await fetch(`${BLOG_COMMENTS_URL}/${postId}`, {
```

### Change #4: Update handleDelete function
**Find this line (around line 730):**
```javascript
const response = await fetch(`${NEWSFEED_URL}/${deleteConfirmId}`, {
```

**Change it to:**
```javascript
const response = await fetch(`${BLOG_COMMENTS_URL}/0/${deleteConfirmId}`, {
```

## How To Do This Safely

1. **Open Webflow** and find the embedded code
2. **Use Ctrl+F** (or Cmd+F) to search for each line
3. **Make the 4 changes** exactly as shown above
4. **Publish** the site
5. **Test** by trying to post a comment

## What This Does

The new `/blog-comments` Netlify function:
- Creates a newsfeed_post entry for each blog the first time someone comments
- Loads comments from the correct location
- Supports admin comment deletion
- Works exactly like the newsfeed replies system

## If Something Goes Wrong

If the site breaks after making these changes:
1. **Undo** the changes (Ctrl+Z in Webflow)
2. **Publish** to restore the working version
3. Let me know what error you see

## Alternative: I Can Provide The Complete Fixed File

If you don't want to make manual changes, I can provide you with the complete 1038-line file with ONLY these 4 lines changed. Everything else will be identical to what's working now.

Would you prefer:
- **Option A:** Make the 4 small changes yourself (safer, you control it)
- **Option B:** I provide the complete fixed file (easier, but riskier if I mess up again)
