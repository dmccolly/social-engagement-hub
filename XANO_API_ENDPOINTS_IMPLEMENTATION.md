# XANO API Endpoints Implementation

## Endpoint 1: GET /email_campaigns
**Purpose**: List all campaigns with filtering and pagination

```javascript
// GET /email_campaigns - List campaigns with filtering
function getEmailCampaigns(inputs) {
    let query = this.query.email_campaigns;
    
    // Apply filters
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
    
    // Get total count before pagination
    const total = query.count();
    
    // Apply pagination
    const limit = Math.min(inputs.limit || 50, 100); // Max 100 per page
    const offset = inputs.offset || 0;
    
    const campaigns = query
        .sort((a, b) => b.created_at - a.created_at)
        .limit(limit)
        .offset(offset)
        .all();
    
    // Add analytics to each campaign
    const campaignsWithStats = campaigns.map(campaign => {
        const stats = getCampaignStats(campaign.id);
        return {
            ...campaign,
            analytics: stats
        };
    });
    
    return {
        success: true,
        campaigns: campaignsWithStats,
        pagination: {
            total: total,
            limit: limit,
            offset: offset,
            has_more: (offset + limit) < total
        }
    };
}

// Helper function to get campaign statistics
function getCampaignStats(campaignId) {
    const sends = this.query.campaign_sends.filter(item => item.campaign_id == campaignId);
    const totalSent = sends.count();
    const totalOpened = sends.filter(item => item.opened_at != null).count();
    const totalClicked = sends.filter(item => item.clicked_at != null).count();
    const totalBounced = sends.filter(item => item.bounced_at != null).count();
    
    return {
        total_sent: totalSent,
        total_opened: totalOpened,
        total_clicked: totalClicked,
        total_bounced: totalBounced,
        open_rate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
        click_rate: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0,
        bounce_rate: totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0
    };
}
```

## Endpoint 2: POST /email_campaigns
**Purpose**: Create a new campaign

```javascript
// POST /email_campaigns - Create new campaign
function createEmailCampaign(inputs) {
    // Validate required fields
    if (!inputs.name || inputs.name.trim() === '') {
        return this.response.status(400).json({ 
            success: false, 
            error: 'Campaign name is required' 
        });
    }
    
    if (!inputs.subject || inputs.subject.trim() === '') {
        return this.response.status(400).json({ 
            success: false, 
            error: 'Subject line is required' 
        });
    }
    
    if (!inputs.html_content || inputs.html_content.trim() === '') {
        return this.response.status(400).json({ 
            success: false, 
            error: 'Email content is required' 
        });
    }
    
    // Validate email if provided
    if (inputs.sender_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputs.sender_email)) {
            return this.response.status(400).json({ 
                success: false, 
                error: 'Invalid sender email format' 
            });
        }
    }
    
    // Create campaign
    const campaign = this.addRecord('email_campaigns', {
        name: inputs.name.trim(),
        subject: inputs.subject.trim(),
        preview_text: inputs.preview_text ? inputs.preview_text.trim() : null,
        html_content: inputs.html_content.trim(),
        plain_text_content: inputs.plain_text_content ? inputs.plain_text_content.trim() : null,
        status: 'draft',
        type: inputs.type || 'Newsletter',
        sender_name: inputs.sender_name ? inputs.sender_name.trim() : null,
        sender_email: inputs.sender_email ? inputs.sender_email.trim() : null,
        reply_to: inputs.reply_to ? inputs.reply_to.trim() : null,
        recipient_count: 0,
        sent_count: 0,
        opened_count: 0,
        clicked_count: 0,
        bounced_count: 0,
        unsubscribed_count: 0
    });
    
    return {
        success: true,
        campaign: campaign,
        message: 'Campaign created successfully'
    };
}
```

## Endpoint 3: GET /email_campaigns/{id}
**Purpose**: Get single campaign with analytics

```javascript
// GET /email_campaigns/{id} - Get campaign with analytics
function getEmailCampaign(inputs) {
    const campaign = this.query.email_campaigns.filter(item => item.id == inputs.id).first();
    
    if (!campaign) {
        return this.response.status(404).json({ 
            success: false, 
            error: 'Campaign not found' 
        });
    }
    
    // Get detailed statistics
    const sends = this.query.campaign_sends.filter(item => item.campaign_id == inputs.id);
    const totalSent = sends.count();
    const totalOpened = sends.filter(item => item.opened_at != null).count();
    const totalClicked = sends.filter(item => item.clicked_at != null).count();
    const totalBounced = sends.filter(item => item.bounced_at != null).count();
    const totalUnsubscribed = sends.filter(item => item.unsubscribed_at != null).count();
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSends = sends.filter(item => item.sent_at >= thirtyDaysAgo).all();
    const recentOpens = sends.filter(item => item.opened_at >= thirtyDaysAgo).all();
    const recentClicks = sends.filter(item => item.clicked_at >= thirtyDaysAgo).all();
    
    // Calculate rates
    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
    const bounceRate = totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0;
    const unsubscribeRate = totalSent > 0 ? Math.round((totalUnsubscribed / totalSent) * 100) : 0;
    
    return {
        success: true,
        campaign: {
            ...campaign,
            analytics: {
                overview: {
                    total_recipients: totalSent,
                    total_sent: totalSent,
                    total_delivered: totalSent - totalBounced,
                    total_opened: totalOpened,
                    total_clicked: totalClicked,
                    total_bounced: totalBounced,
                    total_unsubscribed: totalUnsubscribed,
                    open_rate: openRate,
                    click_rate: clickRate,
                    bounce_rate: bounceRate,
                    unsubscribe_rate: unsubscribeRate
                },
                recent_activity: {
                    sends: recentSends.length,
                    opens: recentOpens.length,
                    clicks: recentClicks.length
                }
            }
        }
    };
}
```

## Endpoint 4: PATCH /email_campaigns/{id}
**Purpose**: Update existing campaign

```javascript
// PATCH /email_campaigns/{id} - Update campaign
function updateEmailCampaign(inputs) {
    const campaign = this.query.email_campaigns.filter(item => item.id == inputs.id).first();
    
    if (!campaign) {
        return this.response.status(404).json({ 
            success: false, 
            error: 'Campaign not found' 
        });
    }
    
    // Prevent updating sent campaigns
    if (campaign.status === 'sent') {
        return this.response.status(400).json({ 
            success: false, 
            error: 'Cannot update sent campaigns' 
        });
    }
    
    // Build update object with only provided fields
    const updateData = {};
    
    if (inputs.name !== undefined) {
        if (inputs.name.trim() === '') {
            return this.response.status(400).json({ 
                success: false, 
                error: 'Campaign name cannot be empty' 
            });
        }
        updateData.name = inputs.name.trim();
    }
    
    if (inputs.subject !== undefined) {
        if (inputs.subject.trim() === '') {
            return this.response.status(400).json({ 
                success: false, 
                error: 'Subject cannot be empty' 
            });
        }
        updateData.subject = inputs.subject.trim();
    }
    
    if (inputs.preview_text !== undefined) {
        updateData.preview_text = inputs.preview_text ? inputs.preview_text.trim() : null;
    }
    
    if (inputs.html_content !== undefined) {
        if (inputs.html_content.trim() === '') {
            return this.response.status(400).json({ 
                success: false, 
                error: 'Email content cannot be empty' 
            });
        }
        updateData.html_content = inputs.html_content.trim();
    }
    
    if (inputs.plain_text_content !== undefined) {
        updateData.plain_text_content = inputs.plain_text_content ? inputs.plain_text_content.trim() : null;
    }
    
    if (inputs.type !== undefined) {
        updateData.type = inputs.type;
    }
    
    if (inputs.sender_name !== undefined) {
        updateData.sender_name = inputs.sender_name ? inputs.sender_name.trim() : null;
    }
    
    if (inputs.sender_email !== undefined) {
        if (inputs.sender_email && inputs.sender_email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(inputs.sender_email)) {
                return this.response.status(400).json({ 
                    success: false, 
                    error: 'Invalid sender email format' 
                });
            }
        }
        updateData.sender_email = inputs.sender_email ? inputs.sender_email.trim() : null;
    }
    
    if (inputs.reply_to !== undefined) {
        updateData.reply_to = inputs.reply_to ? inputs.reply_to.trim() : null;
    }
    
    // Update the campaign
    const updatedCampaign = this.updateRecord('email_campaigns', inputs.id, updateData);
    
    return {
        success: true,
        campaign: updatedCampaign,
        message: 'Campaign updated successfully'
    };
}
```

## Endpoint 5: POST /email_campaigns/{id}/send
**Purpose**: Send campaign to recipients

```javascript
// POST /email_campaigns/{id}/send - Send campaign
function sendEmailCampaign(inputs) {
    const campaign = this.query.email_campaigns.filter(item => item.id == inputs.id).first();
    
    if (!campaign) {
        return this.response.status(404).json({ 
            success: false, 
            error: 'Campaign not found' 
        });
    }
    
    if (campaign.status !== 'draft') {
        return this.response.status(400).json({ 
            success: false, 
            error: 'Only draft campaigns can be sent' 
        });
    }
    
    // Get recipients based on input parameters
    let recipients = [];
    
    if (inputs.recipient_ids && inputs.recipient_ids.length > 0) {
        // Send to specific contact IDs
        recipients = this.query.email_contacts
            .filter(item => inputs.recipient_ids.includes(item.id) && item.status == 'subscribed')
            .all();
    } else if (inputs.group_ids && inputs.group_ids.length > 0) {
        // Send to contacts in specified groups
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
        return this.response.status(400).json({ 
            success: false, 
            error: 'No valid recipients found' 
        });
    }
    
    // Update campaign status
    this.updateRecord('email_campaigns', inputs.id, {
        status: 'sent',
        sent_at: new Date(),
        recipient_count: recipients.length
    });
    
    // Create campaign sends records
    const campaignSends = [];
    for (const contact of recipients) {
        const sendRecord = this.addRecord('campaign_sends', {
            campaign_id: inputs.id,
            contact_id: contact.id,
            status: 'pending',
            tracking_token: generateTrackingToken(),
            created_at: new Date()
        });
        campaignSends.push(sendRecord);
    }
    
    // Return immediate response (actual sending will be handled by background process)
    return {
        success: true,
        message: `Campaign queued for sending to ${recipients.length} recipients`,
        recipient_count: recipients.length,
        campaign_sends_created: campaignSends.length
    };
}

// Helper function to generate tracking tokens
function generateTrackingToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
```

## Endpoint 6: GET /email_campaigns/{id}/analytics
**Purpose**: Get detailed campaign analytics

```javascript
// GET /email_campaigns/{id}/analytics - Get campaign analytics
function getCampaignAnalytics(inputs) {
    const campaign = this.query.email_campaigns.filter(item => item.id == inputs.id).first();
    
    if (!campaign) {
        return this.response.status(404).json({ 
            success: false, 
            error: 'Campaign not found' 
        });
    }
    
    // Get all sends for this campaign
    const sends = this.query.campaign_sends.filter(item => item.campaign_id == inputs.id);
    
    // Calculate basic metrics
    const totalSent = sends.count();
    const totalOpened = sends.filter(item => item.opened_at != null).count();
    const totalClicked = sends.filter(item => item.clicked_at != null).count();
    const totalBounced = sends.filter(item => item.bounced_at != null).count();
    const totalUnsubscribed = sends.filter(item => item.unsubscribed_at != null).count();
    
    // Calculate rates
    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
    const bounceRate = totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0;
    const unsubscribeRate = totalSent > 0 ? Math.round((totalUnsubscribed / totalSent) * 100) : 0;
    
    // Get hourly activity for the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const hourlyActivity = [];
    for (let i = 0; i < 24; i++) {
        const hourStart = new Date(twentyFourHoursAgo);
        hourStart.setHours(hourStart.getHours() + i);
        const hourEnd = new Date(hourStart);
        hourEnd.setHours(hourEnd.getHours() + 1);
        
        const hourSends = sends.filter(item => 
            item.sent_at >= hourStart && item.sent_at < hourEnd
        ).count();
        
        const hourOpens = sends.filter(item => 
            item.opened_at >= hourStart && item.opened_at < hourEnd
        ).count();
        
        const hourClicks = sends.filter(item => 
            item.clicked_at >= hourStart && item.clicked_at < hourEnd
        ).count();
        
        hourlyActivity.push({
            hour: hourStart.getHours(),
            sends: hourSends,
            opens: hourOpens,
            clicks: hourClicks
        });
    }
    
    return {
        success: true,
        analytics: {
            overview: {
                total_recipients: campaign.recipient_count,
                total_sent: totalSent,
                total_delivered: totalSent - totalBounced,
                total_opened: totalOpened,
                total_clicked: totalClicked,
                total_bounced: totalBounced,
                total_unsubscribed: totalUnsubscribed,
                open_rate: openRate,
                click_rate: clickRate,
                bounce_rate: bounceRate,
                unsubscribe_rate: unsubscribeRate
            },
            hourly_activity: hourlyActivity,
            engagement_timeline: {
                labels: hourlyActivity.map(h => `${h.hour}:00`),
                sends: hourlyActivity.map(h => h.sends),
                opens: hourlyActivity.map(h => h.opens),
                clicks: hourlyActivity.map(h => h.clicks)
            }
        }
    };
}
```

## Usage Instructions

1. **Create the tables** in XANO using the SQL from the previous file
2. **Create these endpoints** in XANO with the exact function names
3. **Set up proper authentication** if needed
4. **Test with sample data** using the provided test campaigns
5. **Integrate with frontend** using the emailCampaignService.js

These endpoints provide a complete email campaign system with full CRUD operations, sending functionality, and detailed analytics.