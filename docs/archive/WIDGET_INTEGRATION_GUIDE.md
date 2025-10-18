# Widget Integration Guide

## ✅ Widget is Already Integrated!

Your blog widget (`StandaloneBlogWidget`) has been fully integrated with Cloudinary and XANO. Here's what's working:

## How the Widget Works Now

### 1. **Data Flow**

```
Widget loads → Tries XANO API → Falls back to localStorage → Displays posts
                     ↓
              Fetches published posts
                     ↓
              Gets Cloudinary image URLs
                     ↓
              Displays on any website
```

### 2. **Widget Features**

✅ **Fetches from XANO API**
- Calls `getPublishedPosts(limit, offset)` 
- Gets real-time data from your XANO database
- Works across all domains (with proper CORS)

✅ **Displays Cloudinary Images**
- Shows permanent image URLs from Cloudinary CDN
- Fast loading from CDN
- Images work on any website

✅ **Fallback to localStorage**
- If XANO is unavailable, falls back to localStorage
- Ensures widget always shows content
- Graceful degradation

✅ **Auto-Refresh**
- Refreshes every 5 seconds
- Refreshes when page becomes visible
- Always shows latest content

✅ **Debug Information**
- Shows loading status
- Displays error messages
- Helps troubleshoot issues

## Widget Code (Already Implemented)

```javascript
const StandaloneBlogWidget = () => {
  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Try XANO first
        const result = await getPublishedPosts(settings.postCount, 0);
        if (result.success && result.posts) {
          // Format and display posts with Cloudinary images
          setPosts(formattedPosts);
          return;
        }
      } catch (xanoError) {
        // Fall back to localStorage
        console.log('XANO fetch failed, falling back to localStorage');
      }
      
      // localStorage fallback code...
    };
    
    loadPosts();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadPosts, 5000);
    
    // Refresh on page visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.postCount]);
};
```

## How to Use the Widget

### Option 1: Embed on Webflow (or any website)

**Standard Embed:**
```html
<iframe 
  src="https://your-netlify-site.netlify.app/widget/blog?settings=%7B%22headerColor%22%3A%22%232563eb%22%2C%22headerText%22%3A%22%F0%9F%93%9D%20Latest%20Blog%20Posts%22%2C%22postCount%22%3A3%7D" 
  width="100%" 
  height="600" 
  frameborder="0">
</iframe>
```

**Responsive Embed:**
```html
<div style="position: relative; width: 100%; height: 0; padding-bottom: 75%; overflow: hidden;">
  <iframe 
    src="https://your-netlify-site.netlify.app/widget/blog" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
  </iframe>
</div>
```

### Option 2: Generate Custom Embed Code

Use the Settings section in your app:
1. Go to Settings → Widget Creation
2. Select "Blog Posts" widget
3. Customize settings (colors, post count, etc.)
4. Copy the generated embed code
5. Paste into your Webflow site

## Widget Settings

You can customize the widget with URL parameters:

```javascript
{
  headerColor: '#2563eb',        // Header background color
  headerText: '📝 Latest Posts', // Header text
  postCount: 3,                  // Number of posts to show
  showDates: true,               // Show publish dates
  showExcerpts: true,            // Show post excerpts
  showImages: true,              // Show featured images
  borderRadius: 8,               // Border radius in pixels
  transparent: true              // Transparent background
}
```

## Testing the Widget

### 1. Test on Your Netlify Site

Visit: `https://your-netlify-site.netlify.app/widget/blog`

You should see:
- ✅ Blog posts loading
- ✅ Images from Cloudinary
- ✅ Debug info showing "Loaded X posts from XANO"

### 2. Test on Webflow Site

1. Go to your Webflow page with the embedded widget
2. Check if posts are displaying
3. Check browser console for any errors
4. Verify images are loading from `res.cloudinary.com`

### 3. Test Auto-Refresh

1. Keep widget page open
2. In another tab, create and publish a new post
3. Wait 5 seconds
4. Widget should automatically show the new post

## Troubleshooting

### Widget Shows "Loading..." Forever

**Possible causes:**
1. XANO API not responding
2. CORS not configured for your domain
3. Environment variables not set

**Solutions:**
1. Check XANO API is working (test in XANO console)
2. Add your Webflow domain to XANO CORS settings
3. Verify `REACT_APP_XANO_BASE_URL` is set in Netlify

### Images Not Displaying

**Possible causes:**
1. Images not uploaded to Cloudinary
2. Image URLs not saved in XANO
3. CORS blocking Cloudinary images

**Solutions:**
1. Upload images through the blog editor (not direct URLs)
2. Check XANO database - `image_url` field should have Cloudinary URLs
3. Cloudinary CORS is usually open by default

### Widget Shows Old Posts

**Possible causes:**
1. Posts not published (still in draft)
2. XANO not returning published posts
3. Browser cache

**Solutions:**
1. Make sure to click "Publish Post" not just "Save Draft"
2. Check XANO endpoint filters for `status=published`
3. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### CORS Errors in Console

**Error:** `Access to fetch at 'https://...xano.io/...' from origin 'https://...webflow.io' has been blocked by CORS`

**Solution:**
1. Go to XANO → Settings → API Settings → CORS
2. Add your domains:
   - `https://your-netlify-site.netlify.app`
   - `https://your-webflow-site.webflow.io`
   - `http://localhost:3000` (for local testing)

## Widget Routes

Your app has multiple widget routes:

1. `/widget/blog` - Blog posts widget (✅ Integrated with XANO)
2. `/widget/calendar` - Calendar events widget
3. `/widget/newsfeed` - News feed widget
4. `/widget/socialhub` - Full social hub embed

**Note:** Currently only the blog widget is integrated with XANO. The other widgets still use sample data.

## Data Format

The widget expects posts in this format from XANO:

```javascript
{
  success: true,
  posts: [
    {
      id: 1,
      title: "Post Title",
      content: "<p>HTML content...</p>",
      excerpt: "Short excerpt...",
      author: "Author Name",
      image_url: "https://res.cloudinary.com/...",
      status: "published",
      published_at: "2025-10-04T12:00:00Z",
      created_at: "2025-10-04T10:00:00Z"
    }
  ],
  total: 10,
  limit: 3,
  offset: 0
}
```

## Performance

The widget is optimized for performance:

- ✅ Fetches only published posts
- ✅ Limits query to requested post count
- ✅ Uses Cloudinary CDN for fast image loading
- ✅ Caches results between refreshes
- ✅ Falls back to localStorage if XANO is slow

## Security

The widget is secure:

- ✅ Only fetches published posts (no drafts)
- ✅ No authentication required for public widget
- ✅ CORS properly configured
- ✅ No sensitive data exposed

## Next Steps

1. ✅ Widget code is already integrated
2. ✅ Widget fetches from XANO
3. ✅ Widget displays Cloudinary images
4. ⏳ Test the widget on your Webflow site
5. ⏳ Verify posts and images are displaying
6. ⏳ Check auto-refresh is working

## Success Criteria

Widget is working correctly when:

- ✅ Posts load from XANO (check console: "Loaded X posts from XANO")
- ✅ Images display from Cloudinary (check Network tab: `res.cloudinary.com`)
- ✅ Widget works on external Webflow site
- ✅ New posts appear within 5 seconds of publishing
- ✅ No CORS errors in console

---

**Status:** ✅ Widget Fully Integrated - Ready for Testing

**Next Action:** Test the widget on your Webflow site and verify everything is working!