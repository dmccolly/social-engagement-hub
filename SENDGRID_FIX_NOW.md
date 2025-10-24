# Fix SendGrid - Exact Steps

## Step 1: Open Endpoint
1. Go to: https://xajo-bs7d-cagt.n7e.xano.io
2. Click **API** (left sidebar)
3. Click **EmailMarketing**
4. Click **POST /email_campaigns/{id}/send**

## Step 2: Find External Request Function
1. Scroll through function stack
2. Find function labeled "External API Request" or "Make HTTP Request"
3. Click on it

## Step 3: Update URL
**Change this:**
```
https://api.example.com/email_campaigns/123/send
```

**To this:**
```
https://api.sendgrid.com/v3/mail/send
```

## Step 4: Update Headers
Delete all existing headers. Add these 2:

**Header 1:**
- Name: `Authorization`
- Value: `Bearer {{env.SENDGRID_API_KEY}}`

**Header 2:**
- Name: `Content-Type`
- Value: `application/json`

## Step 5: Update Body
Replace entire body with this:

```json
{
  "personalizations": [
    {
      "to": [{"email": "YOUR_EMAIL@example.com"}],
      "subject": "Test Email"
    }
  ],
  "from": {
    "email": "{{env.SENDGRID_FROM_EMAIL}}",
    "name": "Test"
  },
  "content": [
    {
      "type": "text/html",
      "value": "<h1>Test</h1>"
    }
  ]
}
```

Replace `YOUR_EMAIL@example.com` with your actual email.

## Step 6: Save
Click **Save** (top right)

## Step 7: Test
1. Click **Run & Debug**
2. Path parameter `id`: `1`
3. Body: `{"test_mode": true}`
4. Click **Run**
5. Check your email

Done.