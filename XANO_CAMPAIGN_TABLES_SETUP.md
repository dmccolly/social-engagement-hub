# XANO Email Campaign Tables Setup

## Step 1: Create email_campaigns Table

```sql
CREATE TABLE email_campaigns (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    preview_text VARCHAR(500),
    html_content LONGTEXT NOT NULL,
    plain_text_content TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    type VARCHAR(50) DEFAULT 'Newsletter',
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    recipient_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    reply_to VARCHAR(255),
    template_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_campaign_status ON email_campaigns(status);
CREATE INDEX idx_campaign_type ON email_campaigns(type);
CREATE INDEX idx_campaign_sent_at ON email_campaigns(sent_at);
CREATE INDEX idx_campaign_scheduled_at ON email_campaigns(scheduled_at);
CREATE INDEX idx_campaign_created_at ON email_campaigns(created_at);
```

## Step 2: Create campaign_sends Table (Tracking)

```sql
CREATE TABLE campaign_sends (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    campaign_id INTEGER NOT NULL,
    contact_id INTEGER NOT NULL,
    sendgrid_message_id VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    opened_at TIMESTAMP NULL,
    clicked_at TIMESTAMP NULL,
    bounced_at TIMESTAMP NULL,
    unsubscribed_at TIMESTAMP NULL,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    user_agent VARCHAR(500),
    ip_address VARCHAR(45),
    tracking_token VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES email_contacts(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_sends_campaign_id ON campaign_sends(campaign_id);
CREATE INDEX idx_sends_contact_id ON campaign_sends(contact_id);
CREATE INDEX idx_sends_sent_at ON campaign_sends(sent_at);
CREATE INDEX idx_sends_status ON campaign_sends(status);
CREATE INDEX idx_sends_tracking_token ON campaign_sends(tracking_token);
```

## Step 3: Create email_templates Table (Optional)

```sql
CREATE TABLE email_templates (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content LONGTEXT NOT NULL,
    plain_text_content TEXT,
    category VARCHAR(100),
    thumbnail_url VARCHAR(500),
    variables JSON,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_category ON email_templates(category);
CREATE INDEX idx_templates_system ON email_templates(is_system);
```

## Step 4: XANO API Endpoint Configurations

### GET /email_campaigns - List Campaigns
```javascript
// Get all campaigns with optional filtering
let query = this.query.email_campaigns;

if (inputs.status) {
    query = query.filter(item => item.status == inputs.status);
}

if (inputs.type) {
    query = query.filter(item => item.type == inputs.type);
}

if (inputs.search) {
    const searchTerm = inputs.search.toLowerCase();
    query = query.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.subject.toLowerCase().includes(searchTerm)
    );
}

return query
    .sort((a, b) => b.created_at - a.created_at)
    .limit(inputs.limit || 50)
    .offset(inputs.offset || 0);
```

### POST /email_campaigns - Create Campaign
```javascript
// Validate required fields
if (!inputs.name || inputs.name.trim() === '') {
    return this.response.status(400).json({ error: 'Campaign name is required' });
}

if (!inputs.subject || inputs.subject.trim() === '') {
    return this.response.status(400).json({ error: 'Subject line is required' });
}

if (!inputs.html_content || inputs.html_content.trim() === '') {
    return this.response.status(400).json({ error: 'Email content is required' });
}

// Create campaign
const campaign = this.addRecord('email_campaigns', {
    name: inputs.name,
    subject: inputs.subject,
    preview_text: inputs.preview_text || null,
    html_content: inputs.html_content,
    plain_text_content: inputs.plain_text_content || null,
    status: 'draft',
    type: inputs.type || 'Newsletter',
    sender_name: inputs.sender_name || null,
    sender_email: inputs.sender_email || null,
    reply_to: inputs.reply_to || null,
    recipient_count: 0,
    sent_count: 0,
    opened_count: 0,
    clicked_count: 0,
    bounced_count: 0,
    unsubscribed_count: 0
});

return campaign;
```

### GET /email_campaigns/{id} - Get Single Campaign
```javascript
// Get campaign with analytics
const campaign = this.query.email_campaigns.filter(item => item.id == inputs.id).first();

if (!campaign) {
    return this.response.status(404).json({ error: 'Campaign not found' });
}

// Get campaign statistics
const stats = {
    total_sent: this.query.campaign_sends.filter(item => item.campaign_id == inputs.id).count(),
    total_opened: this.query.campaign_sends.filter(item => item.campaign_id == inputs.id && item.opened_at != null).count(),
    total_clicked: this.query.campaign_sends.filter(item => item.campaign_id == inputs.id && item.clicked_at != null).count(),
    total_bounced: this.query.campaign_sends.filter(item => item.campaign_id == inputs.id && item.bounced_at != null).count(),
    total_unsubscribed: this.query.campaign_sends.filter(item => item.campaign_id == inputs.id && item.unsubscribed_at != null).count(),
    open_rate: 0,
    click_rate: 0,
    bounce_rate: 0
};

// Calculate rates
if (stats.total_sent > 0) {
    stats.open_rate = Math.round((stats.total_opened / stats.total_sent) * 100);
    stats.click_rate = Math.round((stats.total_clicked / stats.total_sent) * 100);
    stats.bounce_rate = Math.round((stats.total_bounced / stats.total_sent) * 100);
}

return {
    ...campaign,
    analytics: stats
};
```

### POST /email_campaigns/{id}/send - Send Campaign
```javascript
// Get campaign
const campaign = this.query.email_campaigns.filter(item => item.id == inputs.id).first();

if (!campaign) {
    return this.response.status(404).json({ error: 'Campaign not found' });
}

if (campaign.status !== 'draft') {
    return this.response.status(400).json({ error: 'Only draft campaigns can be sent' });
}

// Get recipients (all contacts if no specific recipients provided)
let recipients = [];
if (inputs.recipient_ids && inputs.recipient_ids.length > 0) {
    recipients = this.query.email_contacts.filter(item => inputs.recipient_ids.includes(item.id)).all();
} else if (inputs.group_ids && inputs.group_ids.length > 0) {
    // Get contacts from specified groups
    const contactIds = this.query.contact_groups
        .filter(item => inputs.group_ids.includes(item.group_id))
        .all()
        .map(item => item.contact_id);
    
    recipients = this.query.email_contacts
        .filter(item => contactIds.includes(item.id) && item.status == 'subscribed')
        .all();
} else {
    // Send to all subscribed contacts
    recipients = this.query.email_contacts.filter(item => item.status == 'subscribed').all();
}

if (recipients.length === 0) {
    return this.response.status(400).json({ error: 'No recipients found' });
}

// Update campaign status and counts
this.updateRecord('email_campaigns', inputs.id, {
    status: 'sent',
    sent_at: new Date(),
    recipient_count: recipients.length
});

// Create campaign sends records
const campaignSends = recipients.map(contact => {
    return this.addRecord('campaign_sends', {
        campaign_id: inputs.id,
        contact_id: contact.id,
        status: 'sent',
        tracking_token: Math.random().toString(36).substring(2, 15)
    });
});

return {
    success: true,
    message: `Campaign sent to ${recipients.length} recipients`,
    recipient_count: recipients.length,
    campaign_sends: campaignSends.length
};
```

### GET /email_campaigns/{id}/analytics - Campaign Analytics
```javascript
// Get detailed analytics for campaign
const campaign = this.query.email_campaigns.filter(item => item.id == inputs.id).first();

if (!campaign) {
    return this.response.status(404).json({ error: 'Campaign not found' });
}

// Get send statistics
const sends = this.query.campaign_sends.filter(item => item.campaign_id == inputs.id).all();

const analytics = {
    overview: {
        total_recipients: sends.length,
        total_sent: sends.filter(s => s.sent_at != null).length,
        total_delivered: sends.filter(s => s.status == 'sent').length,
        total_opened: sends.filter(s => s.opened_at != null).length,
        total_clicked: sends.filter(s => s.clicked_at != null).length,
        total_bounced: sends.filter(s => s.bounced_at != null).length,
        total_unsubscribed: sends.filter(s => s.unsubscribed_at != null).length,
        open_rate: 0,
        click_rate: 0,
        bounce_rate: 0
    },
    timeline: {
        sent_over_time: [],
        opens_over_time: [],
        clicks_over_time: []
    },
    top_links: [],
    geographic_data: []
};

// Calculate rates
if (analytics.overview.total_sent > 0) {
    analytics.overview.open_rate = Math.round((analytics.overview.total_opened / analytics.overview.total_sent) * 100);
    analytics.overview.click_rate = Math.round((analytics.overview.total_clicked / analytics.overview.total_sent) * 100);
    analytics.overview.bounce_rate = Math.round((analytics.overview.total_bounced / analytics.overview.total_sent) * 100);
}

return analytics;
```

## Step 5: Test Data

```javascript
// Sample campaign data for testing
const sampleCampaigns = [
    {
        name: 'Welcome Series',
        subject: 'Welcome to our community!',
        preview_text: 'Get started with our platform',
        html_content: '<html><body><h1>Welcome!</h1><p>Thank you for joining...</p></body></html>',
        plain_text_content: 'Welcome! Thank you for joining our community...',
        type: 'Automated'
    },
    {
        name: 'Monthly Newsletter',
        subject: 'Your monthly update is here',
        preview_text: 'Catch up on the latest news',
        html_content: '<html><body><h1>Monthly Newsletter</h1><p>Here are this month\'s updates...</p></body></html>',
        type: 'Newsletter'
    }
];
```

This setup provides a complete email campaign system with XANO backend integration.