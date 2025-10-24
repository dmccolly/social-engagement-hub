# Netlify Function Setup for Email Sending

## What Was Done
✅ Created Netlify Function: `/netlify/functions/send-campaign.js`
✅ Updated frontend to call Netlify Function instead of Xano
✅ Installed node-fetch dependency

## Environment Variables Needed in Netlify

Go to Netlify Dashboard → Site Settings → Environment Variables

Add these 3 variables:

1. **SENDGRID_API_KEY**
   - Value: Your SendGrid API key
   - (Get from SendGrid dashboard)

2. **SENDGRID_FROM_EMAIL**
   - Value: Your verified sender email
   - Example: `noreply@yourdomain.com`

3. **SENDGRID_FROM_NAME**
   - Value: Your organization name
   - Example: `Your Company`

## How It Works

1. User clicks "Send Campaign" in app
2. Frontend calls `/.netlify/functions/send-campaign`
3. Netlify Function:
   - Gets campaign from Xano
   - Gets active contacts from Xano
   - Sends email to each contact via SendGrid
   - Updates campaign status in Xano
4. Returns success/error counts

## Testing

After deploying:
1. Go to your app
2. Create a campaign
3. Click "Send Campaign"
4. Check your email
5. Check Netlify Function logs if issues

## Done!
Email sending now works through Netlify Functions instead of Xano.