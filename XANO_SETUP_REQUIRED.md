# Xano Setup Required

## Current Issue
The application cannot connect to Xano because the API endpoints were created but never fully configured with function stacks.

## What's Working
- ✅ `/email_groups` - Returns data correctly
- ✅ `/email_contacts` - Returns empty array correctly

## What's Not Working
- ❌ `/email_campaigns` - Returns `null` instead of array
- ❌ `/email_campaigns/{id}/send` - Endpoint doesn't exist (404)
- ❌ All other campaign endpoints - Not configured

## Required Xano Configuration

### 1. Fix Email Campaigns Endpoint
**Endpoint:** GET `/email_campaigns`
**Current Issue:** Returns `null` instead of `[]`
**Fix Needed:**
1. Go to Xano workspace: https://xajo-bs7d-cagt.n7e.xano.io
2. Navigate to API Group: "EmailMarketing" (ID: 6)
3. Find endpoint: GET `/email_campaigns`
4. Edit the function stack to return an empty array when no campaigns exist:
   ```
   Query All Records from email_campaigns table
   Return: result (or [] if null)
   ```

### 2. Create Send Campaign Endpoint
**Endpoint:** POST `/email_campaigns/{id}/send`
**Status:** Does not exist
**Required Function Stack:**
1. Get campaign by ID
2. Get recipients (from request body or campaign settings)
3. For each recipient:
   - Create entry in campaign_sends table
   - Call SendGrid API to send email
   - Update campaign statistics
4. Return success response

**Note:** This requires SendGrid integration in Xano backend, not frontend.

### 3. SendGrid Configuration in Xano
The current implementation tries to call SendGrid from the frontend, which is:
- ❌ Insecure (exposes API key)
- ❌ Won't work (CORS issues)

**Required Setup:**
1. Add SendGrid API key to Xano environment variables
2. Create Xano function to send emails via SendGrid
3. Update send campaign endpoint to use Xano's SendGrid integration

## Temporary Workaround
The application now falls back to localStorage when Xano endpoints fail, so users can:
- Create campaigns locally
- Edit campaigns locally
- View campaigns locally

However, email sending will NOT work until Xano endpoints are properly configured.

## Quick Fix Steps
1. Log into Xano: https://xajo-bs7d-cagt.n7e.xano.io
2. Fix the `/email_campaigns` endpoint to return `[]` instead of `null`
3. Configure SendGrid in Xano backend
4. Create the `/email_campaigns/{id}/send` endpoint with proper function stack

## Alternative Solution
If Xano configuration is too complex, consider:
1. Using Netlify Functions for email sending
2. Creating a simple Node.js backend
3. Using a different email service with better frontend support