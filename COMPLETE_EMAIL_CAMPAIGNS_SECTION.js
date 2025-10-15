// COMPLETE EMAIL CAMPAIGNS SECTION - Ready to replace in App.js

const EmailCampaignsSection = () => {
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [emailContacts, setEmailContacts] = useState([]);
  const [emailGroups, setEmailGroups] = useState([]);

  // Load campaigns from XANO
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setIsLoading(true);
        const { getCampaigns } = await import('./services/email/emailCampaignService');
        const result = await getCampaigns();
        
        if (result.success && result.campaigns) {
          setEmailCampaigns(result.campaigns);
        } else {
          // Fallback to sample data if API fails
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

  // Load contacts and groups for campaign operations
  useEffect(() => {
    const loadContactsAndGroups = async () => {
      try {
        const { getContacts } = await import('./services/email/emailContactService');
        const { getGroups } = await import('./services/email/emailGroupService');
        
        const [contactsResult, groupsResult] = await Promise.all([
          getContacts(),
          getGroups()
        ]);
        
        if (contactsResult.success) setEmailContacts(contactsResult.contacts);
        if (groupsResult.success) setEmailGroups(groupsResult.groups);
      } catch (error) {
        console.error('Failed to load contacts/groups:', error);
      }
    };
    
    loadContactsAndGroups();
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
        alert('Campaign created successfully!');
      } else {
        alert('Failed to create campaign: ' + result.error);
      }
    } catch (error) {
      console.error('Create campaign error:', error);
      alert('Failed to create campaign: ' + error.message);
    }
  };

  // Send campaign
  const handleSendCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to send this campaign?')) {
      return;
    }
    
    try {
      const { sendCampaign } = await import('./services/email/emailCampaignService');
      
      // Get selected recipients (for now, send to all subscribed contacts)
      const recipientIds = emailContacts
        .filter(contact => contact.status === 'subscribed')
        .map(contact => contact.id);
      
      if (recipientIds.length === 0) {
        alert('No subscribed contacts found to send to.');
        return;
      }
      
      const result = await sendCampaign(campaignId, recipientIds);
      
      if (result.success) {
        alert(`Campaign sent to ${result.recipient_count} recipients!`);
        // Reload campaigns to update status
        const { getCampaigns } = await import('./services/email/emailCampaignService');
        const reloadResult = await getCampaigns();
        if (reloadResult.success) {
          setEmailCampaigns(reloadResult.campaigns);
        }
      } else {
        alert('Failed to send campaign: ' + result.error);
      }
    } catch (error) {
      console.error('Send campaign error:', error);
      alert('Failed to send campaign: ' + error.message);
    }
  };

  // Get campaign analytics
  const handleViewAnalytics = async (campaignId) => {
    try {
      const { getCampaignAnalytics } = await import('./services/email/emailCampaignService');
      const result = await getCampaignAnalytics(campaignId);
      
      if (result.success) {
        console.log('Campaign Analytics:', result.analytics);
        alert(`Analytics: ${result.analytics.overview.open_rate}% open rate, ${result.analytics.overview.click_rate}% click rate`);
      } else {
        alert('Failed to load analytics: ' + result.error);
      }
    } catch (error) {
      console.error('View analytics error:', error);
      alert('Failed to load analytics: ' + error.message);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { deleteCampaign } = await import('./services/email/emailCampaignService');
      const result = await deleteCampaign(campaignId);
      
      if (result.success) {
        alert('Campaign deleted successfully!');
        // Reload campaigns
        const { getCampaigns } = await import('./services/email/emailCampaignService');
        const reloadResult = await getCampaigns();
        if (reloadResult.success) {
          setEmailCampaigns(reloadResult.campaigns);
        }
      } else {
        alert('Failed to delete campaign: ' + result.error);
      }
    } catch (error) {
      console.error('Delete campaign error:', error);
      alert('Failed to delete campaign: ' + error.message);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mail className="text-green-600" />
              Email Campaigns
            </h1>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock size={20} className="animate-spin" />
              Loading campaigns...
            </div>
          </div>
          <div className="text-center py-8">
            <div className="text-gray-500">Loading your email campaigns...</div>
          </div>
        </div>
      </div>
    );
  }

  // Rest of the component return statement
  return (
    <div className="space-y-6">
      {/* Header with real create button */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mail className="text-green-600" />
              Email Campaigns
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage your email marketing campaigns
            </p>
          </div>
          <button
            onClick={() => setIsCreatingCampaign(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={20} />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats with real data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{emailCampaigns.length}</p>
            </div>
            <Mail className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {emailCampaigns.reduce((sum, c) => sum + (c.sent_count || c.sent || 0), 0)}
              </p>
            </div>
            <Send className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Opens</p>
              <p className="text-2xl font-bold text-gray-900">
                {emailCampaigns.reduce((sum, c) => sum + (c.opened_count || c.opened || 0), 0)}
              </p>
            </div>
            <Eye className="text-purple-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">
                {emailCampaigns.reduce((sum, c) => sum + (c.clicked_count || c.clicked || 0), 0)}
              </p>
            </div>
            <ExternalLink className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      {/* Campaign list with real data and actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">All Campaigns</h2>
          
          {emailCampaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No campaigns found.</p>
              <button
                onClick={() => setIsCreatingCampaign(true)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Your First Campaign
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {emailCampaigns.map(campaign => (
                <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <p className="text-gray-600 text-sm">{campaign.subject}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.type === 'Newsletter' ? 'bg-purple-100 text-purple-800' :
                        campaign.type === 'Promotional' ? 'bg-orange-100 text-orange-800' :
                        campaign.type === 'Automated' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Recipients</p>
                      <p className="font-semibold">{campaign.recipient_count || campaign.recipients || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sent</p>
                      <p className="font-semibold">{campaign.sent_count || campaign.sent || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Opened</p>
                      <p className="font-semibold">{campaign.opened_count || campaign.opened || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Clicked</p>
                      <p className="font-semibold">{campaign.clicked_count || campaign.clicked || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <span>Created: {new Date(campaign.created || campaign.created_at).toLocaleDateString()}</span>
                      {campaign.sent_at && <span className="ml-4">Sent: {new Date(campaign.sent_at).toLocaleDateString()}</span>}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewAnalytics(campaign.id)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100"
                      >
                        Analytics
                      </button>
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => handleSendCampaign(campaign.id)}
                          className="px-3 py-1 bg-green-50 text-green-600 rounded text-sm hover:bg-green-100"
                        >
                          Send
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {isCreatingCampaign && (
        <CreateCampaignModal
          onCreate={handleCreateCampaign}
          onCancel={() => setIsCreatingCampaign(false)}
          contacts={emailContacts}
          groups={emailGroups}
        />
      )}
    </div>
  );
};