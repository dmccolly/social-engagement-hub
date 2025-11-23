# Netlify Build Hook Setup for Automatic Post HTML Generation

## What This Does

When a user creates a newsfeed post, the system automatically triggers a Netlify rebuild. This rebuild generates a static HTML file for the post with proper Open Graph meta tags, ensuring Facebook can display correct previews when the post is shared.

## Setup Instructions

### 1. Create a Build Hook in Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your site: **gleaming-cendol-417bf3**
3. Go to **Site settings** → **Build & deploy** → **Build hooks**
4. Click **Add build hook**
5. Name it: `Post Creation Trigger`
6. Branch to build: `main`
7. Click **Save**
8. **Copy the webhook URL** (it will look like: `https://api.netlify.com/build_hooks/XXXXX`)

### 2. Add the Build Hook as an Environment Variable

1. In Netlify, go to **Site settings** → **Environment variables**
2. Click **Add a variable**
3. Key: `NETLIFY_BUILD_HOOK`
4. Value: Paste the webhook URL you copied
5. Click **Save**

### 3. Redeploy Your Site

After adding the environment variable, trigger a manual deploy so the function can access it:
1. Go to **Deploys**
2. Click **Trigger deploy** → **Deploy site**

## How It Works

1. User creates a newsfeed post
2. Post is saved to Xano
3. Frontend calls `/.netlify/functions/trigger-rebuild`
4. Function triggers the Netlify build hook
5. Netlify starts a new build
6. Build script (`scripts/generate-post-pages.js`) runs
7. Script fetches all posts from Xano
8. Generates static HTML files in `public/posts/`
9. Files are deployed
10. Post is now shareable on Facebook with proper preview (2-3 minutes after creation)

## Testing

After setup:
1. Create a new newsfeed post
2. Check the browser console - you should see: `✅ Rebuild triggered for post X`
3. Wait 2-3 minutes for the build to complete
4. Try sharing the post on Facebook
5. Facebook should show the correct title, description, and image

## Troubleshooting

- **"Failed to trigger rebuild"**: Check that the `NETLIFY_BUILD_HOOK` environment variable is set correctly
- **No static HTML file generated**: Check the build logs in Netlify to see if the script ran successfully
- **Facebook still shows generic title**: Clear Facebook's cache using the Sharing Debugger: https://developers.facebook.com/tools/debug/

## Cost Considerations

- Each post creation triggers a rebuild
- Netlify free tier includes 300 build minutes/month
- Each rebuild takes ~2-3 minutes
- This allows ~100-150 posts per month on free tier
- If you exceed this, consider upgrading to Netlify Pro or implementing a batch rebuild system
