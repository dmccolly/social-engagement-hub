# How To Update Webflow With Fixed Blog Comments

## Quick Summary
The blog comments are now fixed! I've created a complete replacement script that you need to copy into your Webflow page.

## Step-by-Step Instructions

### 1. Open Webflow Editor
- Go to https://webflow.com/dashboard
- Open your "History of Idaho Broadcasting" site
- Navigate to the "Social" page

### 2. Find the Custom Code Section
- Look for the embedded code block that contains the blog widget
- It should be in a "Custom Code" or "Embed" element on the page
- The code starts with `<script>` and contains the blog widget logic

### 3. Replace the Script
- **Delete the entire existing `<script>` block** (from `<script>` to `</script>`)
- **Copy the entire contents** of the file `FIXED_BLOG_WIDGET_COMPLETE.html` 
- **Paste it** into the same location where you deleted the old script

### 4. Publish
- Save your changes in Webflow
- Publish the site
- Wait 1-2 minutes for Netlify to deploy

### 5. Test
- Visit https://historyofidahobroadcasting.org/social
- Click "Read more" on any blog post
- You should see the comments section load without errors
- Try posting a test comment - it should work!

## What Was Fixed

The original script was trying to load comments using:
```javascript
const NEWSFEED_URL = 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV/newsfeed_post';
fetch(`${NEWSFEED_URL}/${postId}/replies`)
```

The fixed script uses the new Netlify function:
```javascript
const BLOG_COMMENTS_URL = "https://gleaming-cendol-417bf3.netlify.app/.netlify/functions/blog-comments";
fetch(`${BLOG_COMMENTS_URL}/${postId}`)
```

This properly handles blog comments by:
1. Creating a newsfeed_post entry for each blog when needed
2. Loading comments from the correct location
3. Supporting admin comment deletion

## File Location
The complete fixed script is in: `FIXED_BLOG_WIDGET_COMPLETE.html`

## Need Help?
If you have any issues:
1. Make sure you replaced the ENTIRE script block
2. Make sure you published the Webflow site after making changes
3. Clear your browser cache and try again
4. Check the browser console for any error messages

## What This Fixes
✅ "Failed to load comments" error
✅ Comments not posting
✅ Comments not appearing after posting
✅ Blog posts showing in Community Feed (already fixed via database cleanup)
