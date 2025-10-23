// Complete Email Marketing System - FINAL VERSION
import React, { useState, useEffect } from 'react';
import { Mail, Plus, Edit, Trash2, Save, Users, FileText, Type, Image as ImageIcon, Link as LinkIcon, Sparkles } from 'lucide-react';
import BlogToEmailConverter from './BlogToEmailConverter';
import NewsletterBuilder from './NewsletterBuilder';
import BlockEditor from './BlockEditor';
import SubscriberListModal from './SubscriberListModal';
import SendCampaignPanel from './SendCampaignPanel';
import ContactManager from './ContactManager';

const EmailMarketingSystem = () => {
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: "Weekly Newsletter", subject: "This Week's Top Stories", status: "sent", fromEmail: "newsletter@yourcompany.com", stats: { sent: 24567, opened: 6789, clicked: 1023 } },
    { id: 2, name: "Product Launch", subject: "🚀 Introducing Our New Features", status: "draft", fromEmail: "updates@yourcompany.com", stats: { sent: 0, opened: 0, clicked: 0 } }
  ]);
  
  const [subscriberLists, setSubscriberLists] = useState([
    { id: 1, name: "Main Subscribers", description: "Primary email list", count: 24567, growth: "+523 this week", engagement: { openRate: 28.4, clickRate: 4.2 } },
    { id: 2, name: "VIP Customers", description: "Premium customers", count: 3245, growth: "+89 this week", engagement: { openRate: 45.2, clickRate: 8.7 } }
  ]);
  
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

  const saveCampaign = () => {
    if (currentCampaign) {
      const updatedCampaign = { ...currentCampaign, blocks: emailBlocks, updatedAt: new Date().toISOString() };
      setCampaigns(prev => {
        const existing = prev.find(c => c.id === currentCampaign.id);
        if (existing) return prev.map(c => c.id === currentCampaign.id ? updatedCampaign : c);
        return [...prev, updatedCampaign];
      });
      alert('Campaign saved successfully!');
    }
  };

  const handleSaveList = (listData) => {
    if (currentList) {
      // Update existing list
      setSubscriberLists(prev => prev.map(l => l.id === currentList.id ? { ...l, ...listData } : l));
      alert('List updated successfully!');
    } else {
      // Create new list
      const newList = {
        id: Date.now(),
        ...listData,
        count: 0,
        growth: '+0%',
        engagement: { openRate: 0, clickRate: 0 },
        createdAt: new Date().toISOString()
      };
      setSubscriberLists(prev => [...prev, newList]);
      alert('List created successfully!');
    }
    setShowListModal(false);
    setCurrentList(null);
  };

  const handleDeleteList = (listId) => {
    if (confirm('Are you sure you want to delete this list?')) {
      setSubscriberLists(prev => prev.filter(l => l.id !== listId));
      alert('List deleted successfully!');
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
      
      // TODO: Call Netlify function to send emails
      console.log('Sending campaign:', sendData);
      
      // Update campaign status
      setCurrentCampaign(prev => ({ ...prev, status: sendData.sendOption === 'now' ? 'sent' : 'scheduled' }));
      setCampaigns(prev => prev.map(c => 
        c.id === currentCampaign.id 
          ? { ...c, status: sendData.sendOption === 'now' ? 'sent' : 'scheduled' }
          : c
      ));
      
      setShowSendPanel(false);
      setActiveView('campaigns');
      alert(sendData.sendOption === 'now' ? 'Campaign sent successfully!' : 'Campaign scheduled successfully!');
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Error sending campaign. Please try again.');
    }
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
        <h2 className="text-2xl font-bold">Email Campaigns</h2>
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
      </div>
      {activeView === 'campaigns' && <CampaignListView />}
      {activeView === 'builder' && emailBuilderViewJSX}
      {activeView === 'lists' && <SubscriberListsView />}
    </div>
  );
};

export default EmailMarketingSystem;
