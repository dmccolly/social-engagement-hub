# Complete Xano Setup Guide - Step by Step

## 📋 Overview
This guide provides detailed, step-by-step instructions to configure Xano endpoints for email campaign functionality. Follow each step exactly as written.

**Estimated Time:** 30-45 minutes  
**Difficulty:** Intermediate  
**Prerequisites:** Access to Xano workspace at https://xajo-bs7d-cagt.n7e.xano.io

---

## 🎨 Visual Guide: What You're Looking For

Before we start, here's what key Xano interface elements look like:

### Left Sidebar
- **API** - Icon looks like a plug or connection symbol
- **Database** - Icon looks like stacked disks
- **Settings** - Icon looks like a gear
- **Logs** - Icon looks like a list or document

### Endpoint Editor Elements
- **"+ Add Function"** button - Usually blue, at top of function stack
- **"Save"** button - Top right corner, looks like a disk icon
- **"Run & Debug"** button - Play icon (▶️), top right area
- **Variable Picker** - Icon looks like `{ }` or lightning bolt (⚡)
- **"+ Add Input"** button - In the Inputs/Request Body section
- **"+ Add Filter"** button - In Query/Edit function configurations

### Common Dropdowns
- **Table** - Shows list of your database tables
- **Type** - Shows data types (Text, Integer, Boolean, JSON, etc.)
- **Operator** - Shows comparison operators (=, !=, >, <, etc.)
- **HTTP Method** - Shows GET, POST, PATCH, DELETE, etc.

### Function Stack
- Functions appear as cards/blocks stacked vertically
- Each function has a name at the top (e.g., "Query single record")
- Hover over a function to see edit/delete icons
- Functions execute from top to bottom

### Variable Picker Menu
When you click the variable picker icon, you'll see:
- **path** - URL path parameters (like {id})
- **query** - URL query parameters (?param=value)
- **body** - Request body inputs
- **env** - Environment variables
- **Previous function outputs** - Variables from functions above

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

**Locate the Inputs Section:**
1. In the endpoint editor, scroll down to find the **"Inputs"** section
2. This section might also be labeled **"Request Body"** or **"Body Parameters"**
3. It's usually below the Path Parameters section

**Add Input 1: recipient_ids**
1. Click the **"+ Add Input"** button
2. A configuration panel will appear
3. Fill in the following fields:

   **Name Field:**
   - Type: `recipient_ids`
   - This is case-sensitive, use lowercase with underscore

   **Type Dropdown:**
   - Click the **"Type"** dropdown
   - Look for **"JSON"** or **"Array"** or **"Object"**
   - Select **"JSON"** (this allows flexible array input)
   - If you don't see JSON, select **"Text"** as fallback

   **Required Checkbox:**
   - Look for a checkbox labeled **"Required"**
   - **UNCHECK** this box (leave it unchecked)
   - This makes the field optional

   **Description Field (optional):**
   - Type: `Array of contact IDs to send to`
   - This helps document what the field is for

   **Default Value (if available):**
   - Leave empty or type: `[]`

4. Click **"Save"** or **"Add"** button at the bottom

**Add Input 2: test_mode**
1. Click **"+ Add Input"** button again
2. A new configuration panel will appear
3. Fill in the following fields:

   **Name Field:**
   - Type: `test_mode`
   - Case-sensitive, use lowercase with underscore

   **Type Dropdown:**
   - Click the **"Type"** dropdown
   - Select **"Boolean"**
   - This creates a true/false field

   **Required Checkbox:**
   - **UNCHECK** this box (not required)

   **Default Value:**
   - Look for **"Default Value"** field
   - Type: `false` (lowercase)
   - Or toggle the switch to OFF position

   **Description Field (optional):**
   - Type: `Send in test mode without actually sending emails`

4. Click **"Save"** or **"Add"** button

**Verify Your Inputs:**
After adding both inputs, you should see them listed in the Inputs section:
- ✅ `recipient_ids` (JSON, optional)
- ✅ `test_mode` (Boolean, optional, default: false)

**What if I can't find the Inputs section?**
- Look for tabs at the top: "Settings", "Inputs", "Function Stack"
- Click on the **"Inputs"** tab if it exists
- Some Xano versions call it **"Request Body"** or **"Body"**
- It should be near the Path Parameters section

### Step 3.6: Build Function Stack - Get Campaign

**Add Function 1: Query Single Record**
1. Click **"+ Add Function"** button in the function stack area
2. In the search box that appears, type: **"query single"**
3. From the dropdown results, click: **"Query single record"**
4. The function configuration panel will open

**Configure the Query:**

**Step A: Select Table**
1. Find the **"Table"** dropdown (usually at the top)
2. Click on it to open the list of tables
3. Scroll and find **`email_campaigns`**
4. Click on it to select

**Step B: Add Filter**
1. Look for the **"Filter"** or **"Where"** section
2. Click **"+ Add Filter"** button
3. A filter row will appear with three fields:

   **Filter Field 1 - Column:**
   - Click the first dropdown
   - Select **`id`** from the list of columns

   **Filter Field 2 - Operator:**
   - Click the middle dropdown
   - Select **`=`** (equals sign)

   **Filter Field 3 - Value:**
   - Click in the value field
   - You should see a **variable picker icon** (looks like `{ }` or a lightning bolt)
   - Click the variable picker icon
   - A menu will appear showing available variables
   - Look for **"path"** section
   - Expand it and select **`id`**
   - The field should now show: `{{path.id}}` or similar

   **What if I don't see the variable picker?**
   - Try clicking the **"fx"** button next to the value field
   - Or look for a **"{ }"** icon
   - Or type directly: `{{path.id}}`

**Step C: Set Variable Name**
1. Scroll down to find **"Variable name"** or **"Output variable"** field
2. It might auto-fill as `query_single_record`
3. **Change it to:** `campaign`
4. This makes it easier to reference later

**Step D: Save the Function**
1. Click **"Save"** or **"Add"** button at the bottom
2. The function should now appear in your function stack
3. You should see: "Query single record from email_campaigns"

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
4. The response configuration panel will open

**Configure the Response:**

**Step A: Set Status Code**
1. Find the **"Status Code"** field
2. It should default to **200**
3. Leave it as 200 (success)

**Step B: Build Response Body**
1. Find the **"Body"** field (large text area)
2. You need to build a JSON response

**Method 1: Using the Visual JSON Builder (if available)**
1. Look for a **"JSON"** toggle or **"Visual Editor"** button
2. Click it to switch to visual mode
3. Add fields:
   - Click **"+ Add Field"**
   - Field name: `success`, Type: Boolean, Value: `true`
   - Click **"+ Add Field"**
   - Field name: `message`, Type: Text, Value: `Campaign is being sent`
   - Click **"+ Add Field"**
   - Field name: `campaign_id`, Type: Variable, Value: Select `campaign.id`
   - Click **"+ Add Field"**
   - Field name: `recipient_count`, Type: Variable, Value: Select `recipients.length`

**Method 2: Using Raw JSON (more common)**
1. Click in the **"Body"** text area
2. Type the following JSON structure:
   ```json
   {
     "success": true,
     "message": "Campaign is being sent",
     "campaign_id": 
   }
   ```

3. **Insert campaign_id variable:**
   - Place your cursor after `"campaign_id": `
   - Click the **variable picker icon** (looks like `{ }` or lightning bolt)
   - Navigate to **campaign** → **id**
   - Click on it
   - It should insert: `{{campaign.id}}`

4. **Continue the JSON:**
   - After the campaign_id line, add a comma and new line
   - Type: `"recipient_count": `

5. **Insert recipient_count variable:**
   - Place cursor after `"recipient_count": `
   - Click the **variable picker icon**
   - Navigate to **recipients**
   - Look for **length** or **count** property
   - Click on it
   - It should insert: `{{recipients.length}}`

6. **Final JSON should look like:**
   ```json
   {
     "success": true,
     "message": "Campaign is being sent",
     "campaign_id": {{campaign.id}},
     "recipient_count": {{recipients.length}}
   }
   ```

**Step C: Verify the JSON**
1. Make sure all curly braces match: `{ }`
2. Make sure all quotes are closed: `" "`
3. Check for commas between fields (but not after the last field)
4. Variables should be wrapped in double curly braces: `{{variable}}`

**Step D: Save the Function**
1. Click **"Save"** or **"Add"** button
2. The function should appear in your function stack

**Troubleshooting Response Body:**
- If you see a red error, check your JSON syntax
- Make sure variables exist (campaign and recipients from previous functions)
- Try using the preview/test feature to see the actual output
- If variables don't work, you can use static values for testing:
  ```json
  {
    "success": true,
    "message": "Campaign is being sent",
    "campaign_id": 1,
    "recipient_count": 0
  }
  ```

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

## ⚠️ COMMON MISTAKES TO AVOID

### Mistake 1: Forgetting to Save
**Problem:** You configure everything but forget to click Save
**Solution:** Always click the **"Save"** button after making changes
**How to check:** Look for an asterisk (*) or "unsaved changes" indicator

### Mistake 2: Wrong Variable Names
**Problem:** Typing `{{campaign}}` instead of `{{campaign.id}}`
**Solution:** Use the variable picker to ensure correct syntax
**How to check:** Variables should have dots for nested properties: `{{object.property}}`

### Mistake 3: Missing Curly Braces in Path
**Problem:** Path is `/email_campaigns/id/send` instead of `/email_campaigns/{id}/send`
**Solution:** Path parameters MUST have curly braces: `{parameter_name}`
**How to check:** The path should show `{id}` in curly braces, not just `id`

### Mistake 4: Wrong Data Types
**Problem:** Setting a Boolean field to text "true" instead of boolean true
**Solution:** Use the correct type in dropdowns
**How to check:** 
- Boolean: true/false (no quotes)
- Text: "value" (with quotes)
- Number: 123 (no quotes)

### Mistake 5: Filters Not Working
**Problem:** Query returns no results even though data exists
**Solution:** Check that:
- Field name matches database column exactly (case-sensitive)
- Operator is correct (= for exact match)
- Value is the right type (number vs text)
**How to check:** Test with a simple filter first (like id = 1)

### Mistake 6: Function Order
**Problem:** Using a variable before it's created
**Solution:** Functions execute top-to-bottom
**How to check:** Make sure Query functions come before you use their results

### Mistake 7: Not Testing After Each Step
**Problem:** Adding many functions then discovering something doesn't work
**Solution:** Test after adding each function using "Run & Debug"
**How to check:** Click Run & Debug after each major step

---

## 🚨 TROUBLESHOOTING

### Problem: Endpoint still returns null
**Symptoms:** API returns `null` instead of `[]` or data
**Solution:**
1. Go back to the GET /email_campaigns endpoint
2. Click on the Response function to edit it
3. Check that the Body field is set to the query result variable
4. Look for the variable picker - it should show `{{query_all_records}}`
5. If it's empty, click variable picker and select the query output
6. Save and test again

**How to verify:** Run & Debug should show `[]` (empty array) not `null`

### Problem: 404 Not Found on send endpoint
**Symptoms:** Browser shows 404 error when calling the endpoint
**Solution:**
1. Check the path is exactly: `/email_campaigns/{id}/send`
2. Verify the `{id}` has curly braces (not parentheses or brackets)
3. Check the path parameter is named `id` (lowercase, no spaces)
4. Make sure the endpoint is saved (no asterisk in tab)
5. Try refreshing the Xano page

**How to verify:** The endpoint should appear in the API group list

### Problem: "Variable not found" error
**Symptoms:** Error message says a variable doesn't exist
**Solution:**
1. Check the variable name spelling (case-sensitive)
2. Make sure the function that creates the variable is ABOVE the function using it
3. Verify the variable name in the creating function matches what you're using
4. Check that the function actually ran (no errors before it)

**How to verify:** Use Run & Debug to see what variables are available

### Problem: SendGrid not sending emails
**Symptoms:** No emails arrive, or SendGrid returns errors
**Solution:**
1. Verify your SendGrid API key is correct (copy-paste from SendGrid)
2. Check that your from email is verified in SendGrid dashboard
3. Look at Xano logs for SendGrid error messages
4. Make sure you're not in SendGrid sandbox mode
5. Check SendGrid activity log for blocked/bounced emails

**How to verify:** Send a test email to yourself first

### Problem: Campaign not found error
**Symptoms:** 404 error saying "Campaign not found"
**Solution:**
1. Make sure you have at least one campaign in the database
2. Go to Database → email_campaigns and check what IDs exist
3. Use a valid campaign ID when testing (not 1 if it doesn't exist)
4. Create a campaign through the app first
5. Check that the id parameter is being passed correctly

**How to verify:** Check database for existing campaign IDs

### Problem: Can't find EmailMarketing API group
**Symptoms:** Don't see EmailMarketing in the API groups list
**Solution:**
1. It might be named differently - look for any API group with email endpoints
2. Check for API group ID: 6
3. Look for groups with endpoints like `/email_campaigns` or `/email_contacts`
4. If you can't find it, create a new one:
   - Click "+ Add API Group"
   - Name it "EmailMarketing"
   - Save it
   - Then create the endpoints inside it

**How to verify:** You should see the group in the API section

### Problem: JSON syntax error in response body
**Symptoms:** Red error message about invalid JSON
**Solution:**
1. Check all curly braces match: `{ }` 
2. Check all quotes are closed: `" "`
3. Add commas between fields (but NOT after the last field)
4. Variables need double curly braces: `{{variable}}`
5. Use a JSON validator online to check syntax

**Example of correct JSON:**
```json
{
  "field1": "value1",
  "field2": {{variable}},
  "field3": 123
}
```

**How to verify:** No red error indicators in the body field

### Problem: Inputs not showing in test panel
**Symptoms:** Can't enter test data for inputs
**Solution:**
1. Make sure you saved the endpoint after adding inputs
2. Refresh the Run & Debug panel
3. Check that inputs are in the "Inputs" section, not "Path Parameters"
4. Try closing and reopening the endpoint

**How to verify:** Test panel should show fields for each input

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
4. Check the Xano logs for detailed error information
5. I can provide more specific guidance

Remember: The Netlify Functions approach is much easier if you're finding this too complex!

---

## 📝 QUICK REFERENCE CARD

### Endpoint 1: GET /email_campaigns
**Purpose:** List all campaigns
**Function Stack:**
1. Query all records from `email_campaigns`, sort by `created_at DESC`
2. Response: Success (200) with query result

**Test:** Should return `[]` or list of campaigns

---

### Endpoint 2: POST /email_campaigns/{id}/send
**Purpose:** Send a campaign to recipients

**Path Parameters:**
- `id` (Integer, Required)

**Inputs:**
- `recipient_ids` (JSON, Optional)
- `test_mode` (Boolean, Optional, default: false)

**Function Stack:**
1. Query single record from `email_campaigns` where `id = {{path.id}}`, save as `campaign`
2. Conditional: If `campaign is null`, return 404 error
3. Query all records from `email_contacts` where `status = "active"`, save as `recipients`
4. Edit record in `email_campaigns` where `id = {{path.id}}`:
   - Set `status = "sending"`
   - Set `sent_at = now()`
5. Response: Success (200) with:
   ```json
   {
     "success": true,
     "message": "Campaign is being sent",
     "campaign_id": {{campaign.id}},
     "recipient_count": {{recipients.length}}
   }
   ```

**Test:** Should return success message with campaign details

---

### Environment Variables Needed
- `SENDGRID_API_KEY` (Secret)
- `SENDGRID_FROM_EMAIL` (Text)
- `SENDGRID_FROM_NAME` (Text)

---

### Common Variable Paths
- Path parameter: `{{path.id}}`
- Input field: `{{body.field_name}}`
- Query result: `{{query_result_variable}}`
- Environment var: `{{env.VARIABLE_NAME}}`
- Nested property: `{{object.property}}`
- Array length: `{{array.length}}`

---

### Testing Checklist
- [ ] GET /email_campaigns returns array
- [ ] POST /email_campaigns/{id}/send returns 200
- [ ] Campaign status updates to "sending"
- [ ] sent_at timestamp is set
- [ ] No errors in Xano logs
- [ ] App loads without offline mode error

---

### Time Estimates
- Part 1 (Access): 2 minutes
- Part 2 (Fix GET endpoint): 10 minutes
- Part 3 (Create POST endpoint): 20 minutes
- Part 4 (SendGrid config): 10 minutes
- Part 5 (Testing): 5 minutes
- **Total: ~45 minutes**

---

### When to Use Netlify Functions Instead
Choose Netlify Functions if:
- ✅ You're stuck on Xano configuration
- ✅ You want simpler setup (5 minutes vs 45 minutes)
- ✅ You need better debugging
- ✅ You want more control over email logic
- ✅ You're comfortable with JavaScript

Just say "Use Netlify Functions" and I'll implement it!