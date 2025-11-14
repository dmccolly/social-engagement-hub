# Netlify Deployment Guide - SendGrid Integration

## Quick Setup Checklist

### ✅ Completed
- [x] SendGrid account created
- [x] API key generated
- [x] DNS records added to Network Solutions
- [x] Environment variables configured locally
- [x] Test email sent successfully
- [x] Code pushed to GitHub

### 🔄 Next Steps

#### 1. Deploy to Netlify

If not already deployed:
1. Go to [Netlify](https://app.netlify.com/)
2. Click **Add new site** → **Import an existing project**
3. Connect to GitHub
4. Select repository: `dmccolly/social-engagement-hub`
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
6. Click **Deploy site**

#### 2. Configure Environment Variables in Netlify

**Critical:** These must be set for email sending to work in production.

1. In Netlify dashboard, go to your site
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable** for each:

```
Variable name: SENDGRID_API_KEY
Value: [Your SendGrid API Key - see .env file]
Scopes: All scopes (or select specific deploy contexts)
```

```
Variable name: SENDGRID_FROM_EMAIL
Value: contact@historyofidahobroadcasting.org
Scopes: All scopes
```

```
Variable name: SENDGRID_FROM_NAME
Value: History of Idaho Broadcasting
Scopes: All scopes
```

```
Variable name: XANO_BASE_URL
Value: https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5
Scopes: All scopes
```

4. Click **Save** after adding all variables

#### 3. Redeploy Site

After adding environment variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deployment to complete

#### 4. Test Production Deployment

Once deployed, test the email functionality:

```bash
# Replace YOUR-SITE with your actual Netlify domain
curl -X POST https://YOUR-SITE.netlify.app/.netlify/functions/send-test-email \
  -H "Content-Type: application/json" \
  -d '{
    "toEmail": "danmccolly@gmail.com",
    "campaign": {
      "subject": "Production Test Email",
      "from_email": "contact@historyofidahobroadcasting.org",
      "from_name": "History of Idaho Broadcasting",
      "html_content": "<h1>Production Test</h1><p>Email sending is working in production!</p>"
    }
  }'
```

#### 5. Configure SendGrid Webhook (Optional but Recommended)

To track email delivery status:

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **Mail Settings** → **Event Webhook**
3. Click **Create new webhook**
4. Configure:
   - **Webhook Name:** Social Engagement Hub
   - **HTTP Post URL:** `https://YOUR-SITE.netlify.app/.netlify/functions/sendgrid-webhook`
   - **Select Actions:**
     - ☑ Processed
     - ☑ Delivered
     - ☑ Opened
     - ☑ Clicked
     - ☑ Bounced
     - ☑ Spam Report
     - ☑ Unsubscribe
5. Click **Save**

---

## Environment Variables Reference

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `SENDGRID_API_KEY` | Authenticates with SendGrid API | `SG.xxxxx.yyyyy` |
| `SENDGRID_FROM_EMAIL` | Default sender email address | `contact@historyofidahobroadcasting.org` |
| `SENDGRID_FROM_NAME` | Default sender name | `History of Idaho Broadcasting` |
| `XANO_BASE_URL` | Backend API endpoint | `https://xxx.xano.io/api:xxx` |
| `URL` | App URL (auto-set by Netlify) | `https://yoursite.netlify.app` |

---

## Verification Checklist

After deployment, verify:

- [ ] Site loads correctly
- [ ] Email Marketing section is accessible
- [ ] Can create new campaigns
- [ ] Can send test emails
- [ ] Test emails are received
- [ ] Tracking links work
- [ ] Unsubscribe links work
- [ ] SendGrid webhook receives events (if configured)

---

## Troubleshooting

### Issue: "SendGrid API key not configured"
**Cause:** Environment variables not set in Netlify  
**Solution:** Follow Step 2 above to add environment variables

### Issue: "Sender not verified"
**Cause:** DNS records not fully propagated or sender not verified  
**Solution:** 
- Wait 24-48 hours for DNS propagation
- Verify sender in SendGrid dashboard
- Check DNS records with: `dig CNAME em5346.historyofidahobroadcasting.org`

### Issue: Functions not found (404)
**Cause:** Functions not deployed correctly  
**Solution:**
- Ensure `netlify.toml` exists in root directory
- Verify functions are in `netlify/functions/` directory
- Check build logs for errors
- Redeploy site

### Issue: Emails going to spam
**Cause:** Domain authentication not complete or new sending domain  
**Solution:**
- Wait for full DNS propagation
- Warm up sending domain (start with small batches)
- Avoid spam trigger words
- Ensure DMARC, SPF, and DKIM are configured (done via DNS)

---

## DNS Propagation Check

To verify DNS records have propagated:

```bash
# Check CNAME records
dig CNAME em5346.historyofidahobroadcasting.org
dig CNAME s1._domainkey.historyofidahobroadcasting.org
dig CNAME s2._domainkey.historyofidahobroadcasting.org

# Check TXT record
dig TXT _dmarc.historyofidahobroadcasting.org
```

Or use online tools:
- https://dnschecker.org/
- https://mxtoolbox.com/

---

## Security Best Practices

✅ **Do:**
- Store API keys in Netlify environment variables only
- Use `.gitignore` to exclude `.env` files
- Rotate API keys periodically
- Use minimal permissions for API keys
- Monitor SendGrid activity dashboard

❌ **Don't:**
- Commit API keys to Git
- Share API keys in documentation
- Use full-access API keys when limited access works
- Expose API keys in client-side code

---

## Support

- **SendGrid Support:** https://support.sendgrid.com/
- **Netlify Support:** https://docs.netlify.com/
- **Project Documentation:** See `SENDGRID_SETUP_COMPLETE.md`

---

**Last Updated:** November 14, 2025  
**Status:** ✅ Ready for Production Deployment
