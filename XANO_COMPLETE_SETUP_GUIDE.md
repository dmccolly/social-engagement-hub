# Complete Xano Setup Guide - Step by Step

## 📋 Overview
This guide provides detailed, step-by-step instructions to configure Xano endpoints for email campaign functionality. Follow each step exactly as written, with screenshots references where helpful.

**Estimated Time:** 30-45 minutes  
**Difficulty:** Intermediate  
**Prerequisites:** Access to Xano workspace at https://xajo-bs7d-cagt.n7e.xano.io

---

## 🎯 PART 1: Access Your Xano Workspace

### Step 1.1: Log Into Xano
1. Open your web browser (Chrome, Firefox, or Safari recommended)
2. Navigate to: **https://xajo-bs7d-cagt.n7e.xano.io**
3. Enter your Xano login credentials
4. Click **"Sign In"**
5. You should see the Xano dashboard with "Digital Media Archive" workspace

### Step 1.2: Navigate to API Section
1. Look at the left sidebar
2. Click on the **"API"** icon (looks like a plug or connection symbol)
3. You should now see a list of API Groups in the main panel

### Step 1.3: Locate EmailMarketing API Group
1. Scroll through the list of API Groups
2. Find **"EmailMarketing"** (it may show as ID: 6)
3. Click on **"EmailMarketing"** to open it
4. You should see a list of endpoints inside this group

---

## 🔧 PART 2: Fix the Email Campaigns Endpoint

### Step 2.1: Open the Endpoint
1. In the EmailMarketing API group, look for the endpoint list
2. Find: **GET /email_campaigns**
3. Click on this endpoint to open the endpoint editor
4. The endpoint editor will open in the main panel

### Step 2.2: Verify Endpoint Settings
Check that you see:
- **Endpoint Name:** (may be empty or have a name like "Get Email Campaigns")
- **Path:** `/email_campaigns`
- **HTTP Method:** GET (should show a green GET badge)
- **Function Stack:** This is the main area where we'll work

### Step 2.3: Clear Existing Function Stack (if any)
1. If there are any existing functions in the function stack, hover over each one
2. Click the **trash icon** (🗑️) to delete them
3. We'll start fresh

### Step 2.4: Add Query Function
1. Click the **"+ Add Function"** button at the top of the function stack area
2. A search box will appear
3. Type: **"query"**
4. From the dropdown, select: **"Query all records"**
5. The function configuration panel will open

### Step 2.5: Configure Query Function
In the Query all records configuration:

**Table Selection:**
1. Click the **"Table"** dropdown
2. Select: **`email_campaigns`**

**Sort Configuration:**
1. Click **"+ Add Sort"** button
2. In the sort configuration:
   - **Field:** Select `created_at` from dropdown
   - **Direction:** Select `DESC` (descending - newest first)

**Variable Name:**
1. Look for "Variable name" or "Output variable" field
2. It should auto-fill as `query_all_records` or similar
3. Leave it as is

**Save the Function:**
1. Click **"Save"** or **"Add"** button at the bottom of the configuration panel

### Step 2.6: Add Response Function
1. Click **"+ Add Function"** again
2. Type: **"response"**
3. Select: **"Response: Success"**

### Step 2.7: Configure Response Function
In the Response configuration:

**Status Code:**
1. Should be **200** by default
2. Leave it as 200

**Response Body:**
1. Click in the **"Body"** field
2. You'll see a variable selector appear
3. Look for the output from the previous function (should be named `query_all_records` or similar)
4. Click on it to insert it into the body
5. The body should now show something like: `{{query_all_records}}`

**Save the Function:**
1. Click **"Save"** or **"Add"**

### Step 2.8: Save the Endpoint
1. Look at the top right of the endpoint editor
2. Click the **"Save"** button (💾)
3. You should see a success message like "Endpoint saved successfully"

### Step 2.9: Test the Endpoint
1. Click the **"Run & Debug"** button (▶️ play icon) at the top
2. A test panel will open on the right
3. Click **"Run"** button
4. Check the response:
   - ✅ **Good:** You see `[]` (empty array) or a list of campaigns
   - ❌ **Bad:** You see `null` or an error
5. If you see an error, go back and check each step

---

## ➕ PART 3: Create the Send Campaign Endpoint

### Step 3.1: Return to API Group
1. Click the **back arrow** or **"EmailMarketing"** breadcrumb at the top
2. You should be back at the list of endpoints in the EmailMarketing group

### Step 3.2: Create New Endpoint
1. Look for **"+ Add API Endpoint"** button (usually at the top right)
2. Click it
3. A new endpoint creation dialog will appear

### Step 3.3: Configure Basic Endpoint Settings
In the creation dialog:

**Endpoint Name:**
1. Type: **Send Campaign**

**Path:**
1. Type: **/email_campaigns/{id}/send**
2. Make sure to include the curly braces around `{id}`

**HTTP Method:**
1. Click the method dropdown
2. Select: **POST**

**Create the Endpoint:**
1. Click **"Create"** or **"Add Endpoint"** button
2. The endpoint editor will open

### Step 3.4: Add Path Parameter
1. Look for the **"Path Parameters"** section (usually near the top)
2. Click **"+ Add Parameter"** or **"+ Add Path Parameter"**
3. Configure the parameter:
   - **Name:** `id`
   - **Type:** Select **Integer** from dropdown
   - **Required:** Check the box ✅
   - **Description:** (optional) "Campaign ID to send"
4. Click **"Save"** or **"Add"**

### Step 3.5: Add Request Body Inputs
1. Look for the **"Inputs"** or **"Request Body"** section
2. Click **"+ Add Input"**

**Input 1: recipient_ids**
1. Click **"+ Add Input"**
2. Configure:
   - **Name:** `recipient_ids`
   - **Type:** Select **JSON** or **Array**
   - **Required:** Uncheck (not required)
   - **Description:** "Array of contact IDs to send to"
3. Click **"Save"**

**Input 2: test_mode**
1. Click **"+ Add Input"** again
2. Configure:
   - **Name:** `test_mode`
   - **Type:** Select **Boolean**
   - **Required:** Uncheck
   - **Default Value:** `false`
   - **Description:** "Send in test mode"
3. Click **"Save"**

### Step 3.6: Build Function Stack - Get Campaign

**Add Function 1: Query Single Record**
1. Click **"+ Add Function"**
2. Type: **"query single"**
3. Select: **"Query single record"**
4. Configure:
   - **Table:** Select `email_campaigns`
   - **Filter:** Click **"+ Add Filter"**
     - **Field:** Select `id`
     - **Operator:** Select `=` (equals)
     - **Value:** Click the value field, then select **`path.id`** from the variable picker
   - **Variable Name:** Change to `campaign` (easier to remember)
5. Click **"Save"**

### Step 3.7: Build Function Stack - Check Campaign Exists

**Add Function 2: Conditional Check**
1. Click **"+ Add Function"**
2. Type: **"conditional"** or **"if"**
3. Select: **"Conditional"** or **"If/Else"**
4. Configure the condition:
   - **Condition:** `campaign` **is null** or **equals** `null`
   - You might need to use the expression builder

**If Campaign is Null (Not Found):**
1. In the **"If True"** section, click **"+ Add Function"**
2. Select: **"Response: Error"** or **"Response: Client Error"**
3. Configure:
   - **Status Code:** `404`
   - **Body:** Type or paste:
     ```json
     {
       "error": "Campaign not found",
       "message": "No campaign exists with the provided ID"
     }
     ```
4. Click **"Save"**

**If Campaign Exists:**
1. Leave the **"If False"** section empty for now
2. We'll continue the flow after this conditional
3. Click **"Save"** on the conditional function

### Step 3.8: Build Function Stack - Get Recipients

**Add Function 3: Query All Contacts**
1. Click **"+ Add Function"** (after the conditional)
2. Type: **"query all"**
3. Select: **"Query all records"**
4. Configure:
   - **Table:** Select `email_contacts`
   - **Filter:** Click **"+ Add Filter"**
     - **Field:** Select `status`
     - **Operator:** Select `=`
     - **Value:** Type `active` (as text/string)
   - **Variable Name:** Change to `recipients`
5. Click **"Save"**

### Step 3.9: Build Function Stack - Update Campaign Status

**Add Function 4: Edit Record**
1. Click **"+ Add Function"**
2. Type: **"edit"**
3. Select: **"Edit record"**
4. Configure:
   - **Table:** Select `email_campaigns`
   - **Filter:** Click **"+ Add Filter"**
     - **Field:** Select `id`
     - **Operator:** Select `=`
     - **Value:** Select `path.id` from variable picker
   - **Fields to Update:** Click **"+ Add Field"** for each:
     
     **Field 1:**
     - **Field:** Select `status`
     - **Value:** Type `sending` (as text)
     
     **Field 2:**
     - **Field:** Select `sent_at`
     - **Value:** Click and look for **"now()"** function or current timestamp
5. Click **"Save"**

### Step 3.10: Build Function Stack - Return Success

**Add Function 5: Success Response**
1. Click **"+ Add Function"**
2. Type: **"response"**
3. Select: **"Response: Success"**
4. Configure:
   - **Status Code:** `200`
   - **Body:** Click in the body field and build this JSON:
     ```json
     {
       "success": true,
       "message": "Campaign is being sent",
       "campaign_id": {{campaign.id}},
       "recipient_count": {{recipients.length}}
     }
     ```
   - Use the variable picker to insert `campaign.id` and `recipients.length`
5. Click **"Save"**

### Step 3.11: Save the Send Endpoint
1. Click **"Save"** button at the top right
2. Wait for success confirmation

### Step 3.12: Test the Send Endpoint
1. Click **"Run & Debug"** (▶️)
2. In the test panel:
   - **Path Parameters:**
     - `id`: Enter `1` (or any campaign ID you have)
   - **Request Body:**
     ```json
     {
       "test_mode": true
     }
     ```
3. Click **"Run"**
4. Check response:
   - ✅ **Good:** Status 200 with success message
   - ❌ **Bad:** 404 or error (check campaign exists in database)

---

## 🔐 PART 4: Configure SendGrid (Optional but Recommended)

### Step 4.1: Get SendGrid API Key
1. Go to SendGrid dashboard: https://app.sendgrid.com
2. Navigate to **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Name it: **"Xano Email Integration"**
5. Select **"Full Access"** permissions
6. Click **"Create & View"**
7. **COPY THE API KEY** (you won't see it again!)

### Step 4.2: Add SendGrid to Xano Environment
1. In Xano, click **"Settings"** in the left sidebar
2. Click **"Environment Variables"**
3. Click **"+ Add Variable"**

**Variable 1: API Key**
1. Configure:
   - **Name:** `SENDGRID_API_KEY`
   - **Value:** Paste your SendGrid API key
   - **Type:** Check **"Secret"** box (to hide the value)
2. Click **"Save"**

**Variable 2: From Email**
1. Click **"+ Add Variable"** again
2. Configure:
   - **Name:** `SENDGRID_FROM_EMAIL`
   - **Value:** Your verified sender email (e.g., `noreply@yourdomain.com`)
   - **Type:** Leave as text
3. Click **"Save"**

**Variable 3: From Name**
1. Click **"+ Add Variable"** again
2. Configure:
   - **Name:** `SENDGRID_FROM_NAME`
   - **Value:** Your organization name (e.g., "Your Company")
   - **Type:** Leave as text
3. Click **"Save"**

### Step 4.3: Add SendGrid External Request (Advanced)

**Note:** This is the most complex part. If you get stuck, skip to Part 5 for an easier alternative.

1. Go back to your **Send Campaign** endpoint
2. After the "Get Recipients" function, add a new function
3. Click **"+ Add Function"**
4. Type: **"external"** or **"http"**
5. Select: **"External API Request"** or **"Make HTTP Request"**

**Configure the Request:**
1. **Method:** Select **POST**
2. **URL:** `https://api.sendgrid.com/v3/mail/send`
3. **Headers:** Click **"+ Add Header"** for each:
   - **Header 1:**
     - Name: `Authorization`
     - Value: `Bearer {{env.SENDGRID_API_KEY}}`
   - **Header 2:**
     - Name: `Content-Type`
     - Value: `application/json`

4. **Body:** This is complex - you'll need to build a JSON structure:
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
       "name": "{{env.SENDGRID_FROM_NAME}}"
     },
     "content": [
       {
         "type": "text/html",
         "value": "{{campaign.html_content}}"
       }
     ]
   }
   ```

5. Click **"Save"**

**Important:** This is a simplified version that sends to one email. For production, you'll need to loop through recipients.

---

## ✅ PART 5: Test Everything

### Step 5.1: Test in Browser
1. Open your application in a browser
2. Navigate to **Email Campaigns** section
3. Try to load campaigns - should work now without error
4. Create a test campaign
5. Try to send it (if SendGrid is configured)

### Step 5.2: Check Xano Logs
1. In Xano, click **"Logs"** in the left sidebar
2. Look for recent API calls
3. Check for any errors (red indicators)
4. Click on log entries to see details

### Step 5.3: Verify Database
1. In Xano, click **"Database"** in the left sidebar
2. Click on **`email_campaigns`** table
3. Check that campaigns are being created
4. Check that `status` and `sent_at` fields update when sending

---

## 🚨 TROUBLESHOOTING

### Problem: Endpoint still returns null
**Solution:**
1. Go back to the GET /email_campaigns endpoint
2. Check that the Response function is returning the query result
3. Make sure you're selecting the variable from the Query function
4. Save and test again

### Problem: 404 Not Found on send endpoint
**Solution:**
1. Check the path is exactly: `/email_campaigns/{id}/send`
2. Make sure the `{id}` has curly braces
3. Verify the path parameter is named `id` (lowercase)
4. Save the endpoint and try again

### Problem: SendGrid not sending emails
**Solution:**
1. Verify your SendGrid API key is correct
2. Check that your from email is verified in SendGrid
3. Look at Xano logs for SendGrid error messages
4. Make sure you're not in SendGrid sandbox mode

### Problem: Campaign not found error
**Solution:**
1. Make sure you have at least one campaign in the database
2. Create a campaign through the app first
3. Use the correct campaign ID when testing
4. Check the database to see what IDs exist

### Problem: Can't find EmailMarketing API group
**Solution:**
1. It might be named differently - look for any API group with email-related endpoints
2. Check the API group ID - it should be 6
3. If you can't find it, you may need to create it:
   - Click "+ Add API Group"
   - Name it "EmailMarketing"
   - Save it

---

## 🎉 SUCCESS CHECKLIST

Before considering this complete, verify:

- [ ] GET /email_campaigns returns an array (empty or with data)
- [ ] POST /email_campaigns/{id}/send endpoint exists
- [ ] Send endpoint returns 200 success response
- [ ] Campaign status updates to "sending" when sent
- [ ] No errors in Xano logs
- [ ] App loads without "offline mode" error
- [ ] Can create campaigns in the app
- [ ] (Optional) Emails actually send via SendGrid

---

## 💡 EASIER ALTERNATIVE: Use Netlify Functions

If the Xano setup is too complex or you're having issues, I **strongly recommend** using Netlify Functions instead:

### Why Netlify Functions?
- ✅ Much simpler to set up (5 minutes vs 45 minutes)
- ✅ More secure (API keys never exposed)
- ✅ Better error handling and logging
- ✅ Easier to debug and maintain
- ✅ Works with any email service (SendGrid, Mailgun, Postmark, etc.)

### Quick Netlify Functions Setup:
1. I create a file: `/netlify/functions/send-campaign.js`
2. You add SendGrid API key to Netlify environment variables
3. Update frontend to call Netlify function
4. Done! Much simpler.

**Would you like me to implement the Netlify Functions solution instead?** 

Just say "Yes, use Netlify Functions" and I'll set it up for you in 5 minutes.

---

## 📞 Need Help?

If you get stuck at any step:
1. Take a screenshot of where you're stuck
2. Note which step number you're on
3. Share any error messages you see
4. I can provide more specific guidance

Remember: The Netlify Functions approach is much easier if you're finding this too complex!