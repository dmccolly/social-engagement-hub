# 🔐 Environment Variables Configuration Guide

## Quick Fix for "Saving locally instead" Error

The error occurs because **environment variables are not configured**. Here's how to fix it:

---

## 🚀 Quick Setup (Choose One)

### For Local Development
```bash
# 1. Create .env file
echo "REACT_APP_XANO_BASE_URL=https://your-xano-url.xano.io/api:1" > .env

# 2. Restart dev server
npm start
```

### For Netlify Production
1. Go to: https://app.netlify.com/sites/gleaming-cendol-417bf1/settings/deploys#environment
2. Add variable: `REACT_APP_XANO_BASE_URL`
3. Set value: Your Xano URL
4. Redeploy site

---

## 📍 Where to Find Your Xano URL

### Step 1: Log into Xano
Go to: https://xano.com/

### Step 2: Navigate to API
1. Select your workspace
2. Click "API" in left sidebar
3. Look for "Base URL"

### Step 3: Copy the URL
It looks like this:
```
https://x8ki-letl-twmt.n7.xano.io/api:1
```

---

## 🔧 Configuration Methods

### Method 1: .env File (Local Development)

**Create `.env` in project root:**
```bash
REACT_APP_XANO_BASE_URL=https://x8ki-letl-twmt.n7.xano.io/api:1
```

**Important Notes:**
- ✅ File must be named exactly `.env`
- ✅ Must be in project root (same folder as `package.json`)
- ✅ Variable must start with `REACT_APP_`
- ✅ No quotes needed around the URL
- ✅ Restart dev server after creating file

### Method 2: Netlify Environment Variables (Production)

**Via Netlify Dashboard:**
1. Go to Site Settings
2. Navigate to "Build & deploy" → "Environment"
3. Click "Edit variables"
4. Add new variable:
   - **Key**: `REACT_APP_XANO_BASE_URL`
   - **Value**: `https://your-xano-url.xano.io/api:1`
5. Save and redeploy

**Via Netlify CLI:**
```bash
netlify env:set REACT_APP_XANO_BASE_URL "https://your-xano-url.xano.io/api:1"
```

### Method 3: .env.local (Alternative for Local)

If you want to keep `.env` in git (with example values), use `.env.local`:
```bash
# .env.local (not tracked by git)
REACT_APP_XANO_BASE_URL=https://x8ki-letl-twmt.n7.xano.io/api:1
```

---

## 🧪 Testing Your Configuration

### Test 1: Check if Variable is Loaded

Add this to `src/App.js` temporarily:
```javascript
console.log('Environment Check:', {
  xanoUrl: process.env.REACT_APP_XANO_BASE_URL,
  isDefined: !!process.env.REACT_APP_XANO_BASE_URL
});
```

**Expected Output:**
```
Environment Check: {
  xanoUrl: "https://x8ki-letl-twmt.n7.xano.io/api:1",
  isDefined: true
}
```

### Test 2: Try Creating a Post

1. Open browser console (F12)
2. Create a blog post
3. Look for these logs:
   ```
   XANO_BASE_URL: https://x8ki-letl-twmt.n7.xano.io/api:1
   Creating blog post with data: {...}
   Sending to XANO: {...}
   Response status: 200
   Post saved successfully!
   ```

### Test 3: Check Network Tab

1. Open DevTools → Network tab
2. Create a blog post
3. Look for request to `asset_create`
4. Check response status (should be 200)

---

## ❌ Common Mistakes

### Mistake 1: Wrong Variable Name
```bash
# ❌ WRONG - Missing REACT_APP_ prefix
XANO_BASE_URL=https://...

# ✅ CORRECT
REACT_APP_XANO_BASE_URL=https://...
```

### Mistake 2: Quotes Around URL
```bash
# ❌ WRONG - Unnecessary quotes
REACT_APP_XANO_BASE_URL="https://..."

# ✅ CORRECT
REACT_APP_XANO_BASE_URL=https://...
```

### Mistake 3: Wrong File Location
```bash
# ❌ WRONG - File in wrong folder
/src/.env

# ✅ CORRECT - File in project root
/.env
```

### Mistake 4: Not Restarting Server
```bash
# After creating .env, you MUST restart:
# Press Ctrl+C to stop
npm start  # Start again
```

---

## 🔍 Troubleshooting

### Problem: "XANO_BASE_URL is not defined"

**Checklist:**
- [ ] `.env` file exists in project root
- [ ] Variable name starts with `REACT_APP_`
- [ ] No typos in variable name
- [ ] Development server restarted
- [ ] No extra spaces in `.env` file

**Solution:**
```bash
# Verify file exists
ls -la .env

# Check file contents
cat .env

# Restart server
npm start
```

### Problem: "Still showing undefined"

**Possible Causes:**
1. File not in project root
2. Server not restarted
3. Typo in variable name
4. File encoding issue

**Solution:**
```bash
# Delete and recreate .env
rm .env
echo "REACT_APP_XANO_BASE_URL=https://your-url.xano.io/api:1" > .env

# Verify
cat .env

# Restart
npm start
```

### Problem: "Failed to fetch" or CORS Error

**This means the variable IS loaded, but:**
1. Xano URL is incorrect
2. Xano API is not accessible
3. CORS not configured in Xano

**Solution:**
1. Verify Xano URL in Xano dashboard
2. Test URL in browser: `https://your-url.xano.io/api:1/asset`
3. Check Xano CORS settings

### Problem: Works locally but not on Netlify

**Solution:**
1. Environment variables must be set in Netlify dashboard
2. Redeploy after adding variables
3. Check Netlify build logs for errors

---

## 📋 Complete Setup Checklist

### Local Development
- [ ] Create `.env` file in project root
- [ ] Add `REACT_APP_XANO_BASE_URL` with your Xano URL
- [ ] Verify file with `cat .env`
- [ ] Restart development server
- [ ] Check console for Xano URL
- [ ] Test creating a blog post
- [ ] Verify no "Saving locally" error

### Netlify Production
- [ ] Log into Netlify dashboard
- [ ] Navigate to site settings
- [ ] Add environment variable
- [ ] Set `REACT_APP_XANO_BASE_URL`
- [ ] Save changes
- [ ] Trigger redeploy
- [ ] Test on live site
- [ ] Verify posts save to Xano

---

## 📝 Example Configurations

### Development (.env)
```bash
# Xano Configuration
REACT_APP_XANO_BASE_URL=https://x8ki-letl-twmt.n7.xano.io/api:1

# Optional: Cloudinary (if using image uploads)
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-preset
```

### Production (Netlify)
```
Variable 1:
  Key: REACT_APP_XANO_BASE_URL
  Value: https://x8ki-letl-twmt.n7.xano.io/api:1

Variable 2 (optional):
  Key: REACT_APP_CLOUDINARY_CLOUD_NAME
  Value: your-cloud-name
```

---

## ✅ Success Indicators

You'll know it's working when:

1. **Console shows:**
   ```
   XANO_BASE_URL: https://x8ki-letl-twmt.n7.xano.io/api:1
   Creating blog post with data: {...}
   Sending to XANO: {...}
   Response status: 200
   Post saved successfully!
   ```

2. **No error messages:**
   - ❌ "XANO_BASE_URL is not defined"
   - ❌ "Failed to save post. Saving locally instead."

3. **Success messages:**
   - ✅ "Post saved successfully!"
   - ✅ Posts appear in Xano database

---

## 🎯 Next Steps

After configuration:
1. ✅ Test creating a blog post
2. ✅ Verify post appears in Xano
3. ✅ Test updating a post
4. ✅ Test deleting a post
5. ✅ Deploy to Netlify with environment variables

---

## 📞 Still Need Help?

If you're still having issues:

1. **Check browser console** for specific errors
2. **Verify Xano URL** by visiting it in browser
3. **Test with curl:**
   ```bash
   curl https://your-url.xano.io/api:1/asset
   ```
4. **Review Xano API documentation**

---

**Related Files:**
- `.env.example` - Template file
- `XANO_SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `src/services/xanoService.js` - API integration code

**Last Updated:** 2025-10-11