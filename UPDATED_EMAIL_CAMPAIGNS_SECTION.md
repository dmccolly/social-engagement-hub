## Updated Email Campaigns Section

Here's the updated EmailCampaignsSection that integrates with XANO:

```javascript
const EmailCampaignsSection = () => {
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  // Load campaigns from XANO
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const { getCampaigns } = await import('./services/email/emailCampaignService');
        const result = await getCampaigns();
        if (result.success && result.campaigns) {
          setEmailCampaigns(result.campaigns);
        } else {
          // Fallback to sample data
          setEmailCampaigns([
            {
              id: 1,
              name: 'Welcome Series',
              subject: 'Welcome to our community!',
              status: 'Active',
              recipients: 156,
              sent: 142,
              opened: 89,
              clicked: 23,
              created: '2025-09-20',
              lastSent: '2025-09-25',
              type: 'Automated'
            },
            {
              id: 2,
              name: 'Monthly Newsletter',
              subject: 'Your monthly update is here',
              status: 'Sent',
              recipients: 203,
              sent: 203,
              opened: 156,
              clicked: 45,
              created: '2025-09-15',
              lastSent: '2025-09-24',
              type: 'Newsletter'
            },
            {
              id: 3,
              name: 'Product Launch',
              subject: 'Exciting new features just launched!',
              status: 'Draft',
              recipients: 0,
              sent: 0,
              opened: 0,
              clicked: 0,
              created: '2025-09-25',
              lastSent: null,
              type: 'Promotional'
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to load campaigns:', error);
        // Fallback to sample data
        setEmailCampaigns([
          {
            id: 1,
            name: 'Welcome Series',
            subject: 'Welcome to our community!',
            status: 'Active',
            recipients: 156,
            sent: 142,
            opened: 89,
            clicked: 23,
            created: '2025-09-20',
            lastSent: '2025-09-25',
            type: 'Automated'
          },
          {
            id: 2,
            name: 'Monthly Newsletter',
            subject: 'Your monthly update is here',
            status: 'Sent',
            recipients: 203,
            sent: 203,
            opened: 156,
            clicked: 45,
            created: '2025-09-15',
            lastSent: '2025-09-24',
            type: 'Newsletter'
          },
          {
            id: 3,
            name: 'Product Launch',
            subject: 'Exciting new features just launched!',
            status: 'Draft',
            recipients: 0,
            sent: 0,
            opened: 0,
            clicked: 0,
            created: '2025-09-25',
            lastSent: null,
            type: 'Promotional'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCampaigns();
  }, []);

  // Create new campaign
  const handleCreateCampaign = async (campaignData) => {
    try {
      const { createCampaign } = await import('./services/email/emailCampaignService');
      const result = await createCampaign(campaignData);
      
      if (result.success) {
        // Reload campaigns to include the new one
        const { getCampaigns } = await import('./services/email/emailCampaignService');
        const reloadResult = await getCampaigns();
        if (reloadResult.success) {
          setEmailCampaigns(reloadResult.campaigns);
        }
        setIsCreatingCampaign(false);
      } else {
        alert('Failed to create campaign: ' + result.error);
      }
    } catch (error) {
      console.error('Create campaign error:', error);
      alert('Failed to create campaign: ' + error.message);
    }
  };

  // Add loading state to the return statement
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mail className="text-green-600" />
              Email Campaigns
            </h1>
            <div className="text-gray-500">Loading campaigns...</div>
          </div>
        </div>
      </div>
    );
  }

  // Rest of the component return statement...
};
```

## Summary of Changes

1. **Added XANO Integration**: The component now loads campaigns from the XANO backend using `emailCampaignService.js`
2. **Added Loading State**: Shows loading indicator while fetching campaigns
3. **Added Error Handling**: Falls back to sample data if API call fails
4. **Added Campaign Creation**: Function to create new campaigns via API
5. **Maintains Backward Compatibility**: Falls back to existing sample data structure

## Next Steps

To complete the integration:

1. **Update the Create Campaign Modal**: Connect the existing campaign creation modal to use the `handleCreateCampaign` function
2. **Add Send Integration**: Connect the "Send" buttons to actually send campaigns using SendGrid
3. **Add Analytics Integration**: Connect analytics to real campaign data
4. **Test the Integration**: Verify that campaigns load from XANO and can be created/sent

The email campaign system now has a solid foundation with XANO backend integration, SendGrid email delivery, and a rich text editor for campaign creation.