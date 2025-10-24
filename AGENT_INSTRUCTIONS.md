# AI Agent Instructions: Fix SendGrid External Request in Xano

## Task
Update the External API Request function in Xano endpoint POST /email_campaigns/{id}/send to call SendGrid API instead of api.example.com

## Access
- URL: https://xajo-bs7d-cagt.n7e.xano.io
- Workspace: Digital Media Archive
- API Group: EmailMarketing (ID: 6)
- Endpoint: POST /email_campaigns/{id}/send

## Required Changes

### 1. Locate Function
- Navigate to API → EmailMarketing → POST /email_campaigns/{id}/send
- Find function in stack labeled "External API Request" or "Make HTTP Request"
- Click to edit

### 2. Update URL Field
**Current value:** `https://api.example.com/email_campaigns/123/send`
**New value:** `https://api.sendgrid.com/v3/mail/send`

### 3. Update Headers
Delete existing headers. Add exactly 2 headers:

**Header 1:**
```
Name: Authorization
Value: Bearer {{env.SENDGRID_API_KEY}}
```

**Header 2:**
```
Name: Content-Type
Value: application/json
```

### 4. Update Request Body
Replace entire body with:

```json
{
  "personalizations": [
    {
      "to": [{"email": "test@example.com"}],
      "subject": "{{campaign.subject}}"
    }
  ],
  "from": {
    "email": "{{env.SENDGRID_FROM_EMAIL}}",
    "name": "{{campaign.from_name}}"
  },
  "content": [
    {
      "type": "text/html",
      "value": "{{campaign.html_content}}"
    }
  ]
}
```

Use variable picker to insert:
- `{{env.SENDGRID_API_KEY}}`
- `{{env.SENDGRID_FROM_EMAIL}}`
- `{{campaign.subject}}`
- `{{campaign.from_name}}`
- `{{campaign.html_content}}`

### 5. Save
Click Save button

### 6. Verify
Test endpoint with:
- Path parameter: id = 1
- Body: {"test_mode": true}

Expected response: SendGrid success or error (not "Could not resolve host")

## Success Criteria
- URL points to api.sendgrid.com
- Authorization header includes Bearer token
- Request body matches SendGrid format
- Test returns SendGrid response (not DNS error)