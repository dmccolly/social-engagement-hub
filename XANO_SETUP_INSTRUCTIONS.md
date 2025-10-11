# 🔧 Xano Setup Instructions - Fix Connectivity Issue

## ⚠️ Current Issue
The error "Failed to save post. Saving locally instead." occurs because the `REACT_APP_XANO_BASE_URL` environment variable is **not configured**.

## 🎯 Solution: Configure Environment Variables

### Option 1: Local Development Setup

1. **Create a `.env` file** in the project root:
   ```bash
   cd social-engagement-hub
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your actual Xano credentials:
   ```bash
   REACT_APP_XANO_BASE_URL=https://your-xano-instance.xano.io/api:your-branch-name
   ```

3. **Find your Xano URL**:
   - Log into your Xano account
   - Go to your workspace
   - Click on "API" in the left sidebar
   - Copy the base URL (it looks like: `https://x8ki-letl-twmt.n7.xano.io/api:1`)

4. **Restart your development server**:
   ```bash
   npm start
   ```

### Option 2: Netlify Deployment Setup

Since your app is deployed on Netlify, you need to add environment variables there:

1. **Go to Netlify Dashboard**:
   - Navigate to your site: https://app.netlify.com/sites/gleaming-cendol-417bf1/

2. **Add Environment Variables**:
   - Click on "Site settings"
   - Click on "Environment variables" in the left sidebar
   - Click "Add a variable"
   - Add the following:
     - **Key**: `REACT_APP_XANO_BASE_URL`
     - **Value**: Your Xano base URL (e.g., `https://x8ki-letl-twmt.n7.xano.io/api:1`)

3. **Trigger a Redeploy**:
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"
   - Wait for the build to complete

## 📋 Step-by-Step: Getting Your Xano URL

### Method 1: From Xano Dashboard
1. Log into Xano: https://xano.com/
2. Select your workspace
3. Click "API" in the left menu
4. Look for "Base URL" - it will be something like:
   ```
   https://x8ki-letl-twmt.n7.xano.io/api:1
   ```
5. Copy this entire URL

### Method 2: From API Documentation
1. In Xano, go to your API
2. Click on any endpoint
3. Look at the "Try it out" section
4. The base URL is shown at the top

## 🔍 Verify Your Setup

### Check if Environment Variable is Set

Add this temporary code to `src/App.js` (remove after testing):
```javascript
console.log('XANO_BASE_URL:', process.env.REACT_APP_XANO_BASE_URL);
```

### Expected Console Output
- ✅ **Good**: `XANO_BASE_URL: https://x8ki-letl-twmt.n7.xano.io/api:1`
- ❌ **Bad**: `XANO_BASE_URL: undefined`

## 🧪 Test the Connection

After setting up the environment variable:

1. **Open your app** in the browser
2. **Open Developer Console** (F12)
3. **Try creating a blog post**
4. **Check the console logs**:
   - You should see: `XANO_BASE_URL: https://...`
   - You should see: `Creating blog post with data: {...}`
   - You should see: `Sending to XANO: {...}`
   - You should see: `URL: https://.../asset_create`

## 🐛 Troubleshooting

### Issue: Still seeing "undefined"
**Solution**: 
- Make sure the variable name starts with `REACT_APP_`
- Restart your development server after creating `.env`
- Clear browser cache and reload

### Issue: "Failed to fetch" or CORS error
**Solution**:
- Check if your Xano API is public or requires authentication
- Verify the Xano URL is correct
- Check Xano API settings for CORS configuration

### Issue: "404 Not Found"
**Solution**:
- Verify the endpoint `/asset_create` exists in your Xano API
- Check if you're using the correct branch (`:1`, `:2`, etc.)
- Ensure the endpoint is published in Xano

### Issue: "401 Unauthorized"
**Solution**:
- Your Xano API might require authentication
- Add authentication headers in `xanoService.js`:
  ```javascript
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.REACT_APP_XANO_API_KEY}`
  }
  ```

## 📝 Example Configuration

### Local Development (.env file)
```bash
# Xano Configuration
REACT_APP_XANO_BASE_URL=https://x8ki-letl-twmt.n7.xano.io/api:1

# Optional: If authentication is required
REACT_APP_XANO_API_KEY=your-api-key-here
```

### Netlify Environment Variables
```
Key: REACT_APP_XANO_BASE_URL
Value: https://x8ki-letl-twmt.n7.xano.io/api:1

Key: REACT_APP_XANO_API_KEY (if needed)
Value: your-api-key-here
```

## ✅ Verification Checklist

After setup, verify:
- [ ] `.env` file exists (for local dev)
- [ ] `REACT_APP_XANO_BASE_URL` is set correctly
- [ ] Development server restarted
- [ ] Console shows the correct Xano URL
- [ ] Blog post creation works without "Saving locally" message
- [ ] Posts appear in Xano database
- [ ] Netlify environment variables configured (for production)
- [ ] Netlify site redeployed

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ No "Saving locally instead" error
2. ✅ Console shows successful Xano API calls
3. ✅ Posts appear in your Xano database
4. ✅ Alert shows "Post saved successfully!"

## 📞 Need Help?

If you're still having issues:
1. Check the browser console for specific error messages
2. Verify your Xano API is accessible (try calling it with Postman or curl)
3. Ensure your Xano endpoints match the ones in `xanoService.js`
4. Review the Xano API documentation for your workspace

---

**Next Steps**: 
1. Set up your environment variables
2. Test the connection
3. Verify posts are saving to Xano
4. Remove any temporary console.log statements

**Related Files**:
- `.env.example` - Template for environment variables
- `src/services/xanoService.js` - Xano API integration
- `XANO_FIELD_REFERENCE.md` - API field reference