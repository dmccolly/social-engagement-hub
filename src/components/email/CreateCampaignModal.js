import React, { useState, useEffect } from 'react';
import { X, Send, Users, Mail, Plus, Save, Eye } from 'lucide-react';

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
    type: 'all',
    contact_ids: [],
    group_ids: []
  });
  
  const [activeTab, setActiveTab] = useState('content');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load contacts and groups if not provided
  useEffect(() => {
    if (contacts.length === 0) {
      loadContacts();
    }
    if (groups.length === 0) {
      loadGroups();
    }
  }, []);

  const loadContacts = async () => {
    try {
      const { getContacts } = await import('../../services/email/emailContactService');
      const result = await getContacts();
      if (result.success) {
        // Filter to only subscribed contacts
        const subscribedContacts = result.contacts.filter(c => c.status === 'subscribed');
        setSelectedRecipients(prev => ({
          ...prev,
          contact_ids: subscribedContacts.map(c => c.id)
        }));
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const { getGroups } = await import('../../services/email/emailGroupService');
      const result = await getGroups();
      if (result.success) {
        setSelectedRecipients(prev => ({
          ...prev,
          group_ids: result.groups.map(g => g.id)
        }));
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!campaignData.name || !campaignData.subject || !campaignData.html_content) {
      alert('Please fill in all required fields (name, subject, and HTML content)');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { createCampaign } = await import('../../services/email/emailCampaignService');
      
      // Prepare recipient information
      const finalCampaignData = {
        ...campaignData,
        recipient_count: getRecipientCount()
      };
      
      if (selectedRecipients.type === 'contacts' && selectedRecipients.contact_ids.length > 0) {
        finalCampaignData.recipient_ids = selectedRecipients.contact_ids;
      } else if (selectedRecipients.type === 'groups' && selectedRecipients.group_ids.length > 0) {
        finalCampaignData.group_ids = selectedRecipients.group_ids;
      }
      
      const result = await createCampaign(finalCampaignData);
      
      if (result.success) {
        alert('Campaign created successfully!');
        onCreate(result.campaign);
      } else {
        alert('Failed to create campaign: ' + result.error);
      }
    } catch (error) {
      console.error('Create campaign error:', error);
      alert('Failed to create campaign: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRecipientCount = () => {
    if (selectedRecipients.type === 'all') {
      return contacts.filter(c => c.status === 'subscribed').length;
    } else if (selectedRecipients.type === 'contacts') {
      return selectedRecipients.contact_ids.length;
    } else if (selectedRecipients.type === 'groups') {
      // For now, return total contacts in selected groups
      // In a real implementation, this would calculate based on group membership
      return contacts.filter(c => c.status === 'subscribed').length;
    }
    return 0;
  };

  const subscribedContacts = contacts.filter(c => c.status === 'subscribed');

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
                    <span>All subscribed contacts ({subscribedContacts.length})</span>
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

              {selectedRecipients.type === 'contacts' && subscribedContacts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Contacts:
                  </label>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
                    {subscribedContacts.map(contact => (
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

              {selectedRecipients.type === 'groups' && groups.length > 0 && (
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
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Campaign
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignModal;