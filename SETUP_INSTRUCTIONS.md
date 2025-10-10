# Setup Instructions - Social Engagement Hub

## 🚨 CRITICAL: Environment Configuration Required

Your Social Engagement Hub requires environment variables to function properly. Without these, posts will not save to the database.

## Quick Setup Guide

### Step 1: Configure XANO Environment Variable

#### Option A: Local Development

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your XANO base URL:
   ```
   REACT_APP_XANO_BASE_URL=https://your-xano-instance.xano.io/api:your-api-group
   ```

3. Restart your development server:
   ```bash
   npm start
   ```

#### Option B: Netlify Deployment (RECOMMENDED FOR PRODUCTION)

1. Log into your Netlify dashboard
2. Go to: **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add:
   - **Key:** `REACT_APP_XANO_BASE_URL`
   - **Value:** Your XANO API endpoint (e.g., `https://x8ki-letl-twmt.n7.xano.io/api:your-api-group`)
5. Click **Save**
6. Trigger a new deployment:
   - Either push a new commit to your repository
   - Or click **Trigger deploy** → **Deploy site** in Netlify

### Step 2: Get Your XANO Base URL

1. Log into your XANO workspace at https://xano.com
2. Navigate to your API group
3. Click on **API Documentation** or **External API**
4. Copy the base URL shown at the top
   - Format: `https://x8ki-letl-twmt.n7.xano.io/api:your-api-group`
   - Replace `your-api-group` with your actual API group name

### Step 3: Verify XANO Endpoints

Make sure your XANO API has these endpoints configured:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/asset_create` | Create new blog post |
| GET | `/asset` | Get all blog posts |
| GET | `/asset/{id}` | Get single blog post |
| PATCH | `/asset/{id}` | Update blog post |
| DELETE | `/asset/{id}` | Delete blog post |

## Testing Your Setup

### 1. Check Environment Variable

After deployment, verify the environment variable is set:

**In Browser Console:**
```javascript
// This should NOT be undefined
console.log(process.env.REACT_APP_XANO_BASE_URL);
```

**Expected Output:**
```
https://x8ki-letl-twmt.n7.xano.io/api:your-api-group
```

### 2. Test Post Creation

1. Navigate to your deployed site
2. Go to **Blog Posts** section
3. Click **Create New Post**
4. Fill in title and content
5. Click **Publish**
6. Open browser console (F12)
7. Look for these messages:
   - ✅ "Creating blog post with data: ..."
   - ✅ "XANO response: ..." (with actual data)
   - ❌ Should NOT see: "XANO_BASE_URL is not defined"

### 3. Test Widget Display

1. Go to **Settings** → **Widget Creation**
2. Select **Blog Posts** widget
3. Check the live preview
4. Your newly created posts should appear
5. Copy the embed code and test on an external page

## Troubleshooting

### Issue: "XANO_BASE_URL is not defined"

**Cause:** Environment variable not set or not loaded

**Solutions:**
1. Verify you added `REACT_APP_XANO_BASE_URL` in Netlify (not just `XANO_BASE_URL`)
2. Trigger a new deployment after adding the variable
3. Clear browser cache and hard refresh (Ctrl+Shift+R)
4. Check for typos in the variable name

### Issue: Posts save but don't appear in widget

**Cause:** Widget is trying to load from XANO but getting no data

**Solutions:**
1. Check XANO API is returning data:
   ```bash
   curl https://your-xano-instance.xano.io/api:your-api-group/asset
   ```
2. Verify posts were actually saved to XANO (check XANO dashboard)
3. Check browser console for XANO fetch errors
4. Try refreshing the widget (it auto-refreshes every 5 seconds)

### Issue: "Failed to create post" error

**Cause:** XANO API endpoint not configured correctly

**Solutions:**
1. Verify `/asset_create` endpoint exists in XANO
2. Check endpoint accepts POST requests
3. Verify required fields: `title`, `description`, `original_creation_date`
4. Check XANO API permissions (should allow public access or have proper auth)

### Issue: Widget shows sample posts instead of real posts

**Cause:** XANO fetch is failing, widget falls back to sample data

**Solutions:**
1. Check XANO environment variable is set correctly
2. Verify XANO API is accessible (not behind firewall)
3. Check browser console for specific error messages
4. Test XANO endpoint directly with curl or Postman

## Current System Behavior

### With XANO Configured (Correct Setup):
```
User creates post → Saves to XANO → Syncs to localStorage → 
Widget loads from XANO → Displays real posts → 
Data persists across browsers and devices ✅
```

### Without XANO Configured (Current Issue):
```
User creates post → XANO save fails → Saves to localStorage only → 
Widget tries XANO → Fails → Falls back to localStorage → 
May show sample posts if localStorage empty ❌
```

## Widget Embedding

Once XANO is configured, you can embed widgets on any website:

### Standard Embed:
```html
<iframe 
  src="https://your-site.netlify.app/widget/blog?settings=..." 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border-radius: 8px;">
</iframe>
```

### Responsive Embed:
```html
<div style="position: relative; width: 100%; height: 0; padding-bottom: 75%; overflow: hidden;">
  <iframe 
    src="https://your-site.netlify.app/widget/blog?settings=..." 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
    allowfullscreen>
  </iframe>
</div>
```

## Need Help?

If you're still experiencing issues after following these steps:

1. Check the browser console for specific error messages
2. Review `BUGFIX_REPORT.md` for detailed technical information
3. Verify your XANO API is accessible and configured correctly
4. Test XANO endpoints directly using curl or Postman

## Summary Checklist

- [ ] Created `.env` file (for local dev) OR added environment variable in Netlify
- [ ] Set `REACT_APP_XANO_BASE_URL` with correct XANO endpoint
- [ ] Restarted dev server OR triggered new Netlify deployment
- [ ] Verified environment variable loads in browser console
- [ ] Tested creating a new blog post
- [ ] Confirmed post appears in XANO dashboard
- [ ] Verified widget displays the new post
- [ ] Tested widget embed on external page

Once all items are checked, your Social Engagement Hub should be fully functional! 🎉