// Complete Email Marketing System - FINAL VERSION
import React, { useState, useEffect } from 'react';
import { Mail, Plus, Edit, Trash2, Save, Users, FileText, Type, Image as ImageIcon, Link as LinkIcon, Sparkles, FolderOpen } from 'lucide-react';
import BlogToEmailConverter from './BlogToEmailConverter';
import NewsletterBuilder from './NewsletterBuilder';
import BlockEditor from './BlockEditor';
import SubscriberListModal from './SubscriberListModal';
import SendCampaignPanel from './SendCampaignPanel';
import ContactManager from './ContactManager';
import GroupManagement from './GroupManagement';
import { campaignAPI, contactAPI, groupAPI } from '../../services/emailAPI';

const EmailMarketingSystem = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [subscriberLists, setSubscriberLists] = useState([]);
  
  const [activeView, setActiveView] = useState('campaigns');
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [emailBlocks, setEmailBlocks] = useState([]);
  const [showBlogConverter, setShowBlogConverter] = useState(false);
  const [showNewsletterBuilder, setShowNewsletterBuilder] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showSendPanel, setShowSendPanel] = useState(false);
  const [showContactManager, setShowContactManager] = useState(false);
  const [currentList, setCurrentList] = useState(null);
  const [allContacts, setAllContacts] = useState([]);

  // Load data from Xano on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [campaignsData, groupsData, contactsData] = await Promise.all([
          campaignAPI.getAll(),
          groupAPI.getAll(),
          contactAPI.getAll()
        ]);
        
        // Transform Xano data to component format
        const transformedCampaigns = campaignsData.map(c => ({
          id: c.id,
          name: c.name,
          subject: c.subject,
          fromName: c.from_name,
          fromEmail: c.from_email,
          status: c.status,
          blocks: c.blocks ? JSON.parse(c.blocks) : [],
          htmlContent: c.html_content,
          scheduledAt: c.scheduled_at,
          createdAt: c.created_at,
          stats: { sent: c.sent_count || 0, opened: c.opened_count || 0, clicked: c.clicked_count || 0 }
        }));
        
        const transformedGroups = groupsData.map(g => ({
          id: g.id,
          name: g.name,
          description: g.description,
          tags: g.tags,
          count: g.member_count || 0,
          members: g.members || [],
          growth: '',
          engagement: { openRate: 0, clickRate: 0 }
        }));
        
        const transformedContacts = contactsData.map(c => ({
          id: c.id,
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
          company: c.company,
          status: c.status
        }));
        
        setCampaigns(transformedCampaigns);
        setSubscriberLists(transformedGroups);
        setAllContacts(transformedContacts);
      } catch (error) {
        console.error('Error loading data:', error);
        // More helpful error message
          const errorMessage = `Unable to connect to server. Working in offline mode.

Note: Email sending requires server connection.

Error: ${error.message}`;
          alert(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const createNewCampaign = () => {
    const newCampaign = { id: Date.now(), name: "New Campaign", subject: "", status: "draft", fromName: "", fromEmail: "", stats: { sent: 0, opened: 0, clicked: 0 } };
    setCurrentCampaign(newCampaign);
    setEmailBlocks([]);
    setActiveView('builder');
  };

  const handleBlogToEmail = (campaignData) => {
    setCurrentCampaign({ id: Date.now(), ...campaignData, status: "draft", stats: { sent: 0, opened: 0, clicked: 0 } });
    setEmailBlocks(campaignData.blocks || []);
    setShowBlogConverter(false);
    setActiveView('builder');
  };

  const handleNewsletterCreate = (newsletterData) => {
    setCurrentCampaign({ id: Date.now(), ...newsletterData, status: "draft", stats: { sent: 0, opened: 0, clicked: 0 } });
    setEmailBlocks(newsletterData.blocks || []);
    setShowNewsletterBuilder(false);
    setActiveView('builder');
  };

  const addBlock = (blockType) => {
    const newBlock = { id: Date.now(), type: blockType, content: getDefaultBlockContent(blockType) };
    setEmailBlocks([...emailBlocks, newBlock]);
  };

  const getDefaultBlockContent = (type) => {
    switch(type) {
      case 'heading': return { text: 'Your Heading Here', level: 1 };
      case 'text': return { text: 'Your text content goes here...' };
      case 'html': return { html: '<p>Your HTML content goes here...</p>' };
      case 'image': return { src: 'https://via.placeholder.com/600x300', alt: 'Image' };
      case 'button': return { text: 'Click Here', url: '#', color: '#2563eb' };
      case 'divider': return { style: 'solid', color: '#e5e7eb' };
      case 'spacer': return { height: 20 };
      default: return {};
    }
  };

  const updateBlock = (blockId, newContent) => {
    setEmailBlocks(prev => prev.map(block => block.id === blockId ? { ...block, content: newContent } : block));
  };

  const deleteBlock = (blockId) => {
    setEmailBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const moveBlock = (blockId, direction) => {
    setEmailBlocks(prev => {
      const index = prev.findIndex(b => b.id === blockId);
      if (direction === 'up' && index > 0) {
        const newBlocks = [...prev];
        [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
        return newBlocks;
      } else if (direction === 'down' && index < prev.length - 1) {
        const newBlocks = [...prev];
        [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
        return newBlocks;
      }
      return prev;
    });
  };

  const saveCampaign = async () => {
    if (!currentCampaign) return;
    
    try {
      const campaignData = {
        name: currentCampaign.name,
        subject: currentCampaign.subject,
        fromName: currentCampaign.fromName,
        fromEmail: currentCampaign.fromEmail,
        blocks: emailBlocks,
        htmlContent: generateEmailHTML(emailBlocks),
        status: currentCampaign.status || 'draft',
        scheduledAt: currentCampaign.scheduledAt
      };
      
      let savedCampaign;
      const isNew = !campaigns.find(c => c.id === currentCampaign.id);
      
      if (isNew) {
        savedCampaign = await campaignAPI.create(campaignData);
        setCampaigns(prev => [...prev, {
          ...savedCampaign,
          blocks: JSON.parse(savedCampaign.blocks || '[]'),
          stats: { sent: 0, opened: 0, clicked: 0 }
        }]);
      } else {
        savedCampaign = await campaignAPI.update(currentCampaign.id, campaignData);
        setCampaigns(prev => prev.map(c => 
          c.id === currentCampaign.id 
            ? { ...savedCampaign, blocks: JSON.parse(savedCampaign.blocks || '[]') }
            : c
        ));
      }
      
      setActiveView('campaigns');
      setCurrentCampaign(null);
      setEmailBlocks([]);
      alert('Campaign saved successfully!');
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert(`Error saving campaign: ${error.message}`);
    }
  };

  const handleSaveList = async (listData) => {
    try {
      if (currentList) {
        // Update existing list
        const updated = await groupAPI.update(currentList.id, listData);
        setSubscriberLists(prev => prev.map(l => l.id === currentList.id ? { ...l, ...updated } : l));
        alert('List updated successfully!');
      } else {
        // Create new list
        const newList = await groupAPI.create(listData);
        setSubscriberLists(prev => [...prev, {
          ...newList,
          count: 0,
          members: [],
          growth: '+0%',
          engagement: { openRate: 0, clickRate: 0 }
        }]);
        alert('List created successfully!');
      }
      setShowListModal(false);
      setCurrentList(null);
    } catch (error) {
      console.error('Error saving list:', error);
      alert(`Error saving list: ${error.message}`);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!confirm('Are you sure you want to delete this list?')) return;
    
    try {
      await groupAPI.delete(listId);
      setSubscriberLists(prev => prev.filter(l => l.id !== listId));
      alert('List deleted successfully!');
    } catch (error) {
      console.error('Error deleting list:', error);
      alert(`Error deleting list: ${error.message}`);
    }
  };

  const handleSaveContacts = ({ contacts, members, memberIds }) => {
    // Update all contacts
    setAllContacts(contacts);
    
    // Update the current list with new member count and members
    setSubscriberLists(prev => prev.map(l => 
      l.id === currentList.id 
        ? { ...l, count: memberIds.length, members: memberIds }
        : l
    ));
    
    setShowContactManager(false);
    setCurrentList(null);
    alert(`List updated with ${memberIds.length} contacts`);
  };

  const handleSendCampaign = async (sendData) => {
    try {
      // Save campaign first
      saveCampaign();
      
      // Get all contacts from selected lists
      const recipients = [];
      sendData.listIds.forEach(listId => {
        const list = subscriberLists.find(l => l.id === listId);
        if (list && list.members) {
          const listContacts = allContacts.filter(c => list.members.includes(c.id));
          recipients.push(...listContacts);
        }
      });

      // Remove duplicates
      const uniqueRecipients = Array.from(new Map(recipients.map(r => [r.email, r])).values());

      if (uniqueRecipients.length === 0) {
        alert('No recipients found in selected lists');
        return;
      }

      // Prepare email content
      const emailHTML = generateEmailHTML(emailBlocks);
      
      // Call Netlify function to send emails
      const response = await fetch('/.netlify/functions/send-campaign-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign: {
            id: currentCampaign.id,
            name: currentCampaign.name,
            subject: currentCampaign.subject,
            fromName: currentCampaign.fromName,
            fromEmail: currentCampaign.fromEmail,
            htmlContent: emailHTML
          },
          recipients: uniqueRecipients,
          sendOption: sendData.sendOption,
          scheduleDateTime: sendData.scheduleDateTime
        })
      });

      if (!response.ok) {
        throw new Error(`Send failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Send result:', result);
      
      // Update campaign status
      const newStatus = sendData.sendOption === 'now' ? 'sent' : 'scheduled';
      setCurrentCampaign(prev => ({ ...prev, status: newStatus, sentAt: new Date().toISOString() }));
      setCampaigns(prev => prev.map(c => 
        c.id === currentCampaign.id 
          ? { ...c, status: newStatus, sentAt: new Date().toISOString(), stats: { ...c.stats, sent: uniqueRecipients.length } }
          : c
      ));
      
      setShowSendPanel(false);
      setActiveView('campaigns');
      alert(`Campaign ${newStatus}! Sent to ${uniqueRecipients.length} recipients.`);
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert(`Error sending campaign: ${error.message}`);
    }
  };

  // Generate HTML from email blocks
  const generateEmailHTML = (blocks) => {
    const blockHTML = blocks.map(block => {
      switch(block.type) {
        case 'heading':
          return `<h1 style="font-size: 24px; font-weight: bold; margin: 16px 0;">${block.content.text}</h1>`;
        case 'text':
          return `<p style="margin: 12px 0; line-height: 1.6;">${block.content.text.replace(/\n/g, '<br>')}</p>`;
        case 'image':
          const imgAlign = block.content.align === 'center' ? 'margin: 0 auto;' : block.content.align === 'right' ? 'margin-left: auto;' : '';
          return `<img src="${block.content.src}" alt="${block.content.alt || ''}" style="width: ${block.content.width || 100}%; max-width: 100%; display: block; ${imgAlign} border-radius: 8px;" />`;
        case 'button':
          return `<div style="text-align: center; margin: 20px 0;"><a href="${block.content.url}" style="background-color: ${block.content.color || '#3B82F6'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">${block.content.text}</a></div>`;
        case 'divider':
          return `<hr style="border: none; border-top: 1px solid ${block.content.color || '#E5E7EB'}; margin: 24px 0;" />`;
        case 'spacer':
          return `<div style="height: ${block.content.height || 20}px;"></div>`;
        case 'html':
          return block.content.html;
        default:
          return '';
      }
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F3F4F6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 32px;">
          ${blockHTML}
        </div>
      </body>
      </html>
    `;
  };

  const renderBlock = (block) => {
    switch(block.type) {
      case 'heading':
        return <div className="email-block"><input type="text" value={block.content.text} onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })} className="text-2xl font-bold w-full p-2 border rounded" placeholder="Heading text..." /></div>;
      case 'text':
        return <div className="email-block"><textarea value={block.content.text} onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })} className="w-full p-2 border rounded" rows="4" placeholder="Your text content..." /></div>;
      case 'html':
        return (
          <div className="email-block">
            <div className="border rounded p-4 bg-white prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content.html }} />
            <textarea 
              value={block.content.html} 
              onChange={(e) => updateBlock(block.id, { ...block.content, html: e.target.value })} 
              className="w-full p-2 border rounded mt-2 font-mono text-sm" 
              rows="6" 
              placeholder="<p>Your HTML content...</p>" 
            />
          </div>
        );
      case 'image':
        return <div className="email-block"><img src={block.content.src} alt={block.content.alt} className="w-full rounded" /><input type="text" value={block.content.src} onChange={(e) => updateBlock(block.id, { ...block.content, src: e.target.value })} className="w-full p-2 border rounded mt-2" placeholder="Image URL..." /></div>;
      case 'button':
        return <div className="email-block text-center"><button style={{ backgroundColor: block.content.color }} className="px-6 py-3 text-white rounded-lg font-semibold">{block.content.text}</button><div className="mt-2 space-y-2"><input type="text" value={block.content.text} onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })} className="w-full p-2 border rounded" placeholder="Button text..." /><input type="text" value={block.content.url} onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })} className="w-full p-2 border rounded" placeholder="Button URL..." /></div></div>;
      case 'divider':
        return <div className="email-block"><hr className="my-4" style={{ borderColor: block.content.color }} /></div>;
      case 'spacer':
        return <div className="email-block"><div style={{ height: `${block.content.height}px` }} className="bg-gray-100 rounded"><span className="text-xs text-gray-500">Spacer: {block.content.height}px</span></div></div>;
      default:
        return null;
    }
  };

  const CampaignListView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Email Campaigns</h2>
          <button 
            onClick={() => setActiveView('groups')} 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <FolderOpen size={20} />
            Manage Groups
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowNewsletterBuilder(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"><Mail size={20} />Create Newsletter</button>
          <button onClick={() => setShowBlogConverter(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"><FileText size={20} />Blog to Email</button>
          <button onClick={createNewCampaign} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus size={20} />New Campaign</button>
        </div>
      </div>
      <div className="grid gap-4">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{campaign.name}</h3>
                <p className="text-gray-600">{campaign.subject}</p>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded ${campaign.status === 'sent' ? 'bg-green-100 text-green-700' : campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>{campaign.status}</span>
                  <span>{campaign.fromEmail}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setCurrentCampaign(campaign); setEmailBlocks(campaign.blocks || []); setActiveView('builder'); }} className="p-2 hover:bg-gray-100 rounded"><Edit size={20} /></button>
                <button onClick={() => { if (confirm('Delete this campaign?')) setCampaigns(campaigns.filter(c => c.id !== campaign.id)); }} className="p-2 hover:bg-gray-100 rounded text-red-600"><Trash2 size={20} /></button>
              </div>
            </div>
            {campaign.status === 'sent' && (
              <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                <div><div className="text-2xl font-bold">{campaign.stats.sent.toLocaleString()}</div><div className="text-sm text-gray-600">Sent</div></div>
                <div><div className="text-2xl font-bold">{campaign.stats.opened.toLocaleString()}</div><div className="text-sm text-gray-600">Opened</div></div>
                <div><div className="text-2xl font-bold">{campaign.stats.clicked.toLocaleString()}</div><div className="text-sm text-gray-600">Clicked</div></div>
                <div><div className="text-2xl font-bold">{((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(1)}%</div><div className="text-sm text-gray-600">Open Rate</div></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const emailBuilderViewJSX = (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-3 bg-white rounded-lg shadow p-4 space-y-4">
        <h3 className="font-semibold text-lg">Campaign Settings</h3>
        <div><label className="block text-sm font-medium mb-1">Campaign Name</label><input key="campaign-name" type="text" value={currentCampaign?.name || ''} onChange={(e) => setCurrentCampaign(prev => ({...prev, name: e.target.value}))} className="w-full p-2 border rounded" /></div>
        <div><label className="block text-sm font-medium mb-1">Subject Line</label><input key="campaign-subject" type="text" value={currentCampaign?.subject || ''} onChange={(e) => setCurrentCampaign(prev => ({...prev, subject: e.target.value}))} className="w-full p-2 border rounded" /></div>
        <div><label className="block text-sm font-medium mb-1">From Name</label><input key="campaign-from-name" type="text" value={currentCampaign?.fromName || ''} onChange={(e) => setCurrentCampaign(prev => ({...prev, fromName: e.target.value}))} className="w-full p-2 border rounded" /></div>
        <div><label className="block text-sm font-medium mb-1">From Email</label><input key="campaign-from-email" type="email" value={currentCampaign?.fromEmail || ''} onChange={(e) => setCurrentCampaign(prev => ({...prev, fromEmail: e.target.value}))} className="w-full p-2 border rounded" /></div>
        <div className="pt-4 space-y-2">
          <button onClick={() => setShowSendPanel(true)} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"><Mail size={18} />Send Campaign</button>
          <button onClick={saveCampaign} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"><Save size={18} />Save Draft</button>
          <button onClick={() => setActiveView('campaigns')} className="w-full bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Campaigns</button>
        </div>
      </div>
      <div className="col-span-6 bg-gray-100 rounded-lg p-6 overflow-y-auto" style={{maxHeight: '80vh'}}>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">Email Preview</h3>
          {emailBlocks.length === 0 ? (
            <div className="text-center py-12 text-gray-500"><Mail size={48} className="mx-auto mb-4 opacity-50" /><p>Start building your email by adding blocks from the right panel</p></div>
          ) : (
            <div className="space-y-4">
              {emailBlocks.map((block, index) => (
                <div key={block.id} className="relative group">
                  <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                    <button onClick={() => moveBlock(block.id, 'up')} disabled={index === 0} className="block p-1 bg-white rounded shadow hover:bg-gray-100 disabled:opacity-50">↑</button>
                    <button onClick={() => moveBlock(block.id, 'down')} disabled={index === emailBlocks.length - 1} className="block p-1 bg-white rounded shadow hover:bg-gray-100 disabled:opacity-50">↓</button>
                    <button onClick={() => deleteBlock(block.id)} className="block p-1 bg-white rounded shadow hover:bg-red-100 text-red-600"><Trash2 size={16} /></button>
                  </div>
                  <BlockEditor block={block} onUpdate={updateBlock} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="col-span-3 bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-lg mb-4">Content Blocks</h3>
        <div className="space-y-2">
          <button onClick={() => addBlock('heading')} className="w-full flex items-center gap-2 p-3 border rounded hover:bg-gray-50"><Type size={20} /><span>Heading</span></button>
          <button onClick={() => addBlock('text')} className="w-full flex items-center gap-2 p-3 border rounded hover:bg-gray-50"><FileText size={20} /><span>Text</span></button>
          <button onClick={() => addBlock('image')} className="w-full flex items-center gap-2 p-3 border rounded hover:bg-gray-50"><ImageIcon size={20} /><span>Image</span></button>
          <button onClick={() => addBlock('button')} className="w-full flex items-center gap-2 p-3 border rounded hover:bg-gray-50"><LinkIcon size={20} /><span>Button</span></button>
          <button onClick={() => addBlock('divider')} className="w-full flex items-center gap-2 p-3 border rounded hover:bg-gray-50"><span className="text-xl">—</span><span>Divider</span></button>
          <button onClick={() => addBlock('spacer')} className="w-full flex items-center gap-2 p-3 border rounded hover:bg-gray-50"><span className="text-xl">⬍⬍⬍</span><span>Spacer</span></button>
        </div>
        <div className="mt-6 pt-6 border-t">
          <button className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"><Sparkles size={18} />Templates</button>
        </div>
      </div>
    </div>
  );

  const SubscriberListsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscriber Lists</h2>
        <button onClick={() => { setCurrentList(null); setShowListModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Plus size={20} />New List</button>
      </div>
      <div className="grid gap-4">
        {subscriberLists.map(list => (
          <div key={list.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div><h3 className="text-xl font-semibold">{list.name}</h3><p className="text-gray-600">{list.description}</p><div className="mt-2 text-sm text-gray-500"><span className="font-semibold">{list.count.toLocaleString()}</span> subscribers<span className="ml-4 text-green-600">{list.growth}</span></div></div>
              <div className="flex gap-2">
                <button onClick={() => { setCurrentList(list); setShowListModal(true); }} className="p-2 hover:bg-gray-100 rounded"><Edit size={20} /></button>
                <button onClick={() => handleDeleteList(list.id)} className="p-2 hover:bg-gray-100 rounded text-red-600"><Trash2 size={20} /></button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded"><div className="text-sm text-gray-600">Open Rate</div><div className="text-2xl font-bold text-blue-600">{list.engagement.openRate}%</div></div>
              <div className="bg-green-50 p-3 rounded"><div className="text-sm text-gray-600">Click Rate</div><div className="text-2xl font-bold text-green-600">{list.engagement.clickRate}%</div></div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <button onClick={() => { setCurrentList(list); setShowContactManager(true); }} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                <Users size={18} />
                Manage Contacts
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {showNewsletterBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <NewsletterBuilder onCreateNewsletter={handleNewsletterCreate} onCancel={() => setShowNewsletterBuilder(false)} />
        </div>
      )}
      {showBlogConverter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <BlogToEmailConverter onConvert={handleBlogToEmail} onCancel={() => setShowBlogConverter(false)} />
        </div>
      )}
      {showListModal && (
        <SubscriberListModal
          list={currentList}
          onSave={handleSaveList}
          onClose={() => { setShowListModal(false); setCurrentList(null); }}
        />
      )}
      {showSendPanel && currentCampaign && (
        <SendCampaignPanel
          campaign={currentCampaign}
          subscriberLists={subscriberLists}
          onSend={handleSendCampaign}
          onClose={() => setShowSendPanel(false)}
        />
      )}
      {showContactManager && currentList && (
        <ContactManager
          list={currentList}
          allContacts={allContacts}
          onSave={handleSaveContacts}
          onClose={() => { setShowContactManager(false); setCurrentList(null); }}
        />
      )}
      <div className="mb-6 flex gap-4 border-b">
        <button onClick={() => setActiveView('campaigns')} className={`px-4 py-2 font-semibold ${activeView === 'campaigns' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Campaigns</button>
        <button onClick={() => setActiveView('lists')} className={`px-4 py-2 font-semibold ${activeView === 'lists' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Subscriber Lists</button>
          <button onClick={() => setActiveView('groups')} className={`px-4 py-2 font-semibold ${activeView === 'groups' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Mailing Lists</button>
      </div>
         {activeView === 'campaigns' && <CampaignListView />}
         {activeView === 'builder' && emailBuilderViewJSX}
         {activeView === 'lists' && <SubscriberListsView />}
         {activeView === 'groups' && <GroupManagement />}
       </div>
     );

export default EmailMarketingSystem;
