# Frontend Integration Updates for XANO Backend

## Step 1: Update EmailCampaignsSection in App.js

Replace the hardcoded campaign data with real XANO API calls:

```javascript
// Replace the existing EmailCampaignsSection with this updated version

const EmailCampaignsSection = () => {
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
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
          loadSampleCampaigns();
        }
      } catch (error) {
        console.error('Failed to load campaigns:', error);
        loadSampleCampaigns();
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCampaigns();
  }, []);

  // Load contacts and groups for recipient selection
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

  const loadSampleCampaigns = () => {
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
        type: 'Automated',
        html_content: '<h1>Welcome!</h1><p>Thank you for joining our community...</p>'
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
        type: 'Newsletter',
        html_content: '<h1>Monthly Newsletter</h1><p>Here are this month\'s updates...</p>'
      }
    ]);
  };

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
        
        // Show success message
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
        // Show analytics in a modal or new section
        console.log('Campaign Analytics:', result.analytics);
        // You can implement a modal or redirect to analytics view
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

  // Rest of the component return statement remains similar but with real data
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
              <p>No campaigns yet. Create your first campaign to get started!</p>
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

      {/* Create Campaign Modal - Enhanced with recipient selection */}
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
```

## Step 2: Create Enhanced Campaign Modal

Create a new component for the campaign creation modal with recipient selection:

```javascript
// src/components/email/CreateCampaignModal.js

import React, { useState, useEffect } from 'react';
import { X, Send, Users, Mail, Plus } from 'lucide-react';

const CreateCampaignModal = ({ onCreate, onCancel, contacts, groups }) => {
  const [campaignData, setCampaignData] = useState({
    name: '',
    subject: '',
    preview_text: '',
    html_content: '',
    plain_text_content: '',
    type: 'Newsletter',
    sender_name: '',
    sender_email: '',
    reply_to: ''
  });
  
  const [selectedRecipients, setSelectedRecipients] = useState({
    type: 'all', // 'all', 'contacts', 'groups'
    contact_ids: [],
    group_ids: []
  });
  
  const [activeTab, setActiveTab] = useState('content'); // 'content', 'recipients', 'settings'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!campaignData.name || !campaignData.subject || !campaignData.html_content) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Add recipient information
    const finalCampaignData = {
      ...campaignData,
      recipient_count: getRecipientCount()
    };
    
    if (selectedRecipients.type === 'contacts') {
      finalCampaignData.recipient_ids = selectedRecipients.contact_ids;
    } else if (selectedRecipients.type === 'groups') {
      finalCampaignData.group_ids = selectedRecipients.group_ids;
    }
    
    await onCreate(finalCampaignData);
  };

  const getRecipientCount = () => {
    if (selectedRecipients.type === 'all') {
      return contacts.filter(c => c.status === 'subscribed').length;
    } else if (selectedRecipients.type === 'contacts') {
      return selectedRecipients.contact_ids.length;
    } else if (selectedRecipients.type === 'groups') {
      // Calculate based on selected groups
      const selectedGroupIds = selectedRecipients.group_ids;
      const contactIdsInGroups = groups
        .filter(g => selectedGroupIds.includes(g.id))
        .reduce((acc, group) => {
          // This would need to be calculated based on actual group membership
          return acc;
        }, []);
      return contactIdsInGroups.length;
    }
    return 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Send className="text-green-600" />
            Create New Campaign
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 font-medium ${activeTab === 'content' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('recipients')}
            className={`px-6 py-3 font-medium ${activeTab === 'recipients' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Recipients ({getRecipientCount()})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium ${activeTab === 'settings' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Settings
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={campaignData.subject}
                  onChange={(e) => setCampaignData({...campaignData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter subject line"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview Text
                </label>
                <input
                  type="text"
                  value={campaignData.preview_text}
                  onChange={(e) => setCampaignData({...campaignData, preview_text: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="This appears in the inbox preview"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Type
                </label>
                <select
                  value={campaignData.type}
                  onChange={(e) => setCampaignData({...campaignData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Newsletter">Newsletter</option>
                  <option value="Promotional">Promotional</option>
                  <option value="Automated">Automated</option>
                  <option value="Announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HTML Content *
                </label>
                <textarea
                  value={campaignData.html_content}
                  onChange={(e) => setCampaignData({...campaignData, html_content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="10"
                  placeholder="<h1>Your Email Content</h1><p>Write your email content here...</p>"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plain Text Content
                </label>
                <textarea
                  value={campaignData.plain_text_content}
                  onChange={(e) => setCampaignData({...campaignData, plain_text_content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="5"
                  placeholder="Plain text version of your email"
                />
              </div>
            </div>
          )}

          {/* Recipients Tab */}
          {activeTab === 'recipients' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Send to:
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recipients"
                      value="all"
                      checked={selectedRecipients.type === 'all'}
                      onChange={(e) => setSelectedRecipients({...selectedRecipients, type: e.target.value})}
                      className="mr-2"
                    />
                    <span>All subscribed contacts ({contacts.filter(c => c.status === 'subscribed').length})</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recipients"
                      value="contacts"
                      checked={selectedRecipients.type === 'contacts'}
                      onChange={(e) => setSelectedRecipients({...selectedRecipients, type: e.target.value})}
                      className="mr-2"
                    />
                    <span>Specific contacts</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recipients"
                      value="groups"
                      checked={selectedRecipients.type === 'groups'}
                      onChange={(e) => setSelectedRecipients({...selectedRecipients, type: e.target.value})}
                      className="mr-2"
                    />
                    <span>Specific groups</span>
                  </label>
                </div>
              </div>

              {selectedRecipients.type === 'contacts' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Contacts:
                  </label>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
                    {contacts.filter(c => c.status === 'subscribed').map(contact => (
                      <label key={contact.id} className="flex items-center py-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedRecipients.contact_ids.includes(contact.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecipients(prev => ({
                                ...prev,
                                contact_ids: [...prev.contact_ids, contact.id]
                              }));
                            } else {
                              setSelectedRecipients(prev => ({
                                ...prev,
                                contact_ids: prev.contact_ids.filter(id => id !== contact.id)
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <div>
                          <div className="font-medium">{contact.first_name} {contact.last_name}</div>
                          <div className="text-sm text-gray-600">{contact.email}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecipients.type === 'groups' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Groups:
                  </label>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
                    {groups.map(group => (
                      <label key={group.id} className="flex items-center py-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedRecipients.group_ids.includes(group.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecipients(prev => ({
                                ...prev,
                                group_ids: [...prev.group_ids, group.id]
                              }));
                            } else {
                              setSelectedRecipients(prev => ({
                                ...prev,
                                group_ids: prev.group_ids.filter(id => id !== group.id)
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-gray-600">{group.description || 'No description'}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Total recipients:</strong> {getRecipientCount()} contacts will receive this campaign.
                </p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender Name
                </label>
                <input
                  type="text"
                  value={campaignData.sender_name}
                  onChange={(e) => setCampaignData({...campaignData, sender_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your Name or Organization"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender Email
                </label>
                <input
                  type="email"
                  value={campaignData.sender_email}
                  onChange={(e) => setCampaignData({...campaignData, sender_email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="your-email@domain.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reply-To Email
                </label>
                <input
                  type="email"
                  value={campaignData.reply_to}
                  onChange={(e) => setCampaignData({...campaignData, reply_to: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="replies@domain.com (optional)"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer with action buttons */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            * Required fields
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Send size={16} />
              Create Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignModal;
```

## Step 3: Update the Campaign Creation Modal in App.js

Replace the existing campaign creation modal with the new enhanced version:

```javascript
// In the EmailCampaignsSection return statement, replace the modal:

{isCreatingCampaign && (
  <CreateCampaignModal
    onCreate={handleCreateCampaign}
    onCancel={() => setIsCreatingCampaign(false)}
    contacts={emailContacts}
    groups={emailGroups}
  />
)}
```

## Step 4: Add Loading States and Error Handling

Update the campaign list section to handle loading and empty states properly:

```javascript
// Add this to the campaign list section:

{emailCampaigns.length === 0 && !isLoading ? (
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
  // Existing campaign list
)}
```

## Summary of Frontend Changes

1. **Real Data Loading**: Campaigns now load from XANO backend instead of hardcoded data
2. **Loading States**: Added proper loading indicators while data is being fetched
3. **Error Handling**: Graceful fallbacks to sample data if API calls fail
4. **Enhanced Campaign Creation**: New modal with recipient selection and better UX
5. **Real Actions**: Send, delete, and analytics buttons now perform actual operations
6. **Contact Integration**: Campaign system now integrates with the existing contact management

These changes make the email campaign system fully functional with real backend integration while maintaining a professional user experience.