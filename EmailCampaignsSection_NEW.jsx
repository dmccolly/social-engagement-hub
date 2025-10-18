// Email Campaigns Section Component with Rich Text Editor
const EmailCampaignsSection = () => {
  const [emailCampaigns, setEmailCampaigns] = useState([
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

  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'Newsletter'
  });

  // Rich text editor state
  const [emailContent, setEmailContent] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showYouTubeDialog, setShowYouTubeDialog] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: '' });
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isUploadingEmail, setIsUploadingEmail] = useState(false);
  const emailContentRef = useRef(null);
  const emailFileInputRef = useRef(null);

  const statusColors = {
    'Active': 'bg-green-100 text-green-800',
    'Sent': 'bg-blue-100 text-blue-800',
    'Draft': 'bg-yellow-100 text-yellow-800',
    'Paused': 'bg-red-100 text-red-800'
  };

  const typeColors = {
    'Newsletter': 'bg-purple-100 text-purple-800',
    'Promotional': 'bg-orange-100 text-orange-800',
    'Automated': 'bg-indigo-100 text-indigo-800'
  };

  // Initialize email content
  useEffect(() => {
    if (emailContentRef.current && !emailContentRef.current.innerHTML) {
      emailContentRef.current.innerHTML = '<p class="placeholder-text" style="color: #9ca3af; font-style: italic;">Start writing your email content here...</p>';
    }
  }, [isCreatingCampaign]);

  // Handle email content change
  const handleEmailContentChange = () => {
    if (emailContentRef.current) {
      const content = emailContentRef.current.innerHTML;
      setEmailContent(content);
      setNewCampaign(prev => ({ ...prev, content }));
    }
  };

  // Apply formatting to email content
  const applyEmailFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    if (emailContentRef.current) {
      setEmailContent(emailContentRef.current.innerHTML);
      setNewCampaign(prev => ({ ...prev, content: emailContentRef.current.innerHTML }));
    }
  };

  // Handle email image upload
  const handleEmailFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setIsUploadingEmail(true);

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: Please upload a valid image file (JPG, PNG, GIF, or WEBP)`);
        setIsUploadingEmail(false);
        return;
      }

      if (file.size > maxSize) {
        alert(`${file.name}: File size must be less than 50MB`);
        setIsUploadingEmail(false);
        return;
      }
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadImageWithDeduplication(file);

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        const newImage = {
          id: Date.now() + i,
          src: result.url,
          alt: file.name,
          width: result.width,
          height: result.height,
        };

        insertEmailImage(newImage);
      }

      if (emailFileInputRef.current) {
        emailFileInputRef.current.value = '';
      }

      setIsUploadingEmail(false);
    } catch (error) {
      console.error('Email image upload error:', error);
      alert('Failed to upload image: ' + error.message);
      setIsUploadingEmail(false);
    }
  };

  // Insert image into email content
  const insertEmailImage = (imageData) => {
    if (!emailContentRef.current) return;

    const imgHtml = `
      <img 
        src="${imageData.src}" 
        alt="${imageData.alt}" 
        style="max-width: 100%; height: auto; border-radius: 8px; margin: 15px 0;"
        id="img-${imageData.id}"
      />
    `;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const fragment = range.createContextualFragment(imgHtml);
      range.insertNode(fragment);
    } else {
      emailContentRef.current.innerHTML += imgHtml;
    }

    handleEmailContentChange();
  };

  // Insert link into email content
  const insertEmailLink = () => {
    if (!linkData.text || !linkData.url) {
      alert('Please enter both link text and URL');
      return;
    }

    const linkHtml = `<a href="${linkData.url}" style="color: #3b82f6; text-decoration: underline;" target="_blank">${linkData.text}</a>`;
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const fragment = range.createContextualFragment(linkHtml);
      range.deleteContents();
      range.insertNode(fragment);
    }

    setShowLinkDialog(false);
    setLinkData({ text: '', url: '' });
    handleEmailContentChange();
  };

  // Insert YouTube video into email content
  const insertEmailYouTube = () => {
    if (!youtubeUrl) {
      alert('Please enter a YouTube URL');
      return;
    }

    let videoId = '';
    if (youtubeUrl.includes('youtube.com/watch?v=')) {
      videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
    } else if (youtubeUrl.includes('youtu.be/')) {
      videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
    }

    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }

    const embedHtml = `
      <div style="position: relative; padding-bottom: 56.25%; height: 0; margin: 20px 0;">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; border-radius: 8px;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;

    if (emailContentRef.current) {
      emailContentRef.current.innerHTML += embedHtml;
    }

    setShowYouTubeDialog(false);
    setYoutubeUrl('');
    handleEmailContentChange();
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.subject) {
      alert('Please enter campaign name and subject');
      return;
    }

    const campaign = {
      id: Date.now(),
      ...newCampaign,
      content: emailContent,
      status: 'Draft',
      recipients: 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      created: new Date().toISOString().split('T')[0],
      lastSent: null
    };

    setEmailCampaigns(prev => [campaign, ...prev]);
    setNewCampaign({ name: '', subject: '', content: '', type: 'Newsletter' });
    setEmailContent('');
    setIsCreatingCampaign(false);
    
    // Reset editor
    if (emailContentRef.current) {
      emailContentRef.current.innerHTML = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mail className="text-green-600" />
              Email Campaigns
            </h1>
            <p className="text-gray-600 mt-2">Manage and track your email marketing campaigns</p>
          </div>
          <button
            onClick={() => setIsCreatingCampaign(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={20} /> New Campaign
          </button>
        </div>
      </div>

      {/* Stats Overview */}
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
                {emailCampaigns.reduce((sum, c) => sum + c.sent, 0)}
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
                {emailCampaigns.reduce((sum, c) => sum + c.opened, 0)}
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
                {emailCampaigns.reduce((sum, c) => sum + c.clicked, 0)}
              </p>
            </div>
            <ExternalLink className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      {/* Create Campaign Modal with Rich Text Editor */}
      {isCreatingCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Email Campaign</h3>
            
            <div className="space-y-4">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter campaign name"
                />
              </div>
              
              {/* Email Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                <input
                  type="text"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter email subject"
                />
              </div>
              
              {/* Campaign Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                <select
                  value={newCampaign.type}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Newsletter">Newsletter</option>
                  <option value="Promotional">Promotional</option>
                  <option value="Automated">Automated</option>
                </select>
              </div>
              
              {/* Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
                
                {/* Toolbar */}
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                  {/* Font Controls */}
                  <select 
                    onChange={(e) => applyEmailFormat('fontName', e.target.value)}
                    className="px-2 py-1 bg-white border rounded text-sm"
                    title="Font Family"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                  
                  <select 
                    onChange={(e) => applyEmailFormat('fontSize', e.target.value)}
                    className="px-2 py-1 bg-white border rounded text-sm"
                    title="Font Size"
                  >
                    <option value="1">8pt</option>
                    <option value="2">10pt</option>
                    <option value="3" selected>12pt</option>
                    <option value="4">14pt</option>
                    <option value="5">18pt</option>
                    <option value="6">24pt</option>
                    <option value="7">36pt</option>
                  </select>
                  
                  <div className="border-l mx-2"></div>
                  
                  {/* Text Formatting */}
                  <button onClick={() => applyEmailFormat('bold')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Bold">
                    <Bold size={16} />
                  </button>
                  <button onClick={() => applyEmailFormat('italic')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Italic">
                    <Italic size={16} />
                  </button>
                  <button onClick={() => applyEmailFormat('underline')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Underline">
                    <Underline size={16} />
                  </button>
                  
                  <div className="border-l mx-2"></div>
                  
                  {/* Lists */}
                  <button onClick={() => applyEmailFormat('insertUnorderedList')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Bullet Points">
                    <span className="text-sm font-bold">•</span>
                  </button>
                  <button onClick={() => applyEmailFormat('insertOrderedList')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Numbered List">
                    <span className="text-sm font-bold">1.</span>
                  </button>
                  
                  <div className="border-l mx-2"></div>
                  
                  {/* Colors */}
                  <input
                    type="color"
                    onChange={(e) => applyEmailFormat('foreColor', e.target.value)}
                    className="w-8 h-8 border rounded cursor-pointer"
                    title="Text Color"
                  />
                  <input
                    type="color"
                    onChange={(e) => applyEmailFormat('hiliteColor', e.target.value)}
                    className="w-8 h-8 border rounded cursor-pointer"
                    title="Highlight Color"
                  />
                  
                  <div className="border-l mx-2"></div>
                  
                  {/* Alignment */}
                  <button onClick={() => applyEmailFormat('justifyLeft')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Align Left">
                    <AlignLeft size={16} />
                  </button>
                  <button onClick={() => applyEmailFormat('justifyCenter')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Align Center">
                    <AlignCenter size={16} />
                  </button>
                  <button onClick={() => applyEmailFormat('justifyRight')} className="px-3 py-1 bg-white border rounded hover:bg-gray-100" title="Align Right">
                    <AlignRight size={16} />
                  </button>
                  
                  <div className="border-l mx-2"></div>
                  
                  {/* Media */}
                  <button 
                    onClick={() => emailFileInputRef.current?.click()} 
                    className="px-3 py-1 bg-white border rounded hover:bg-gray-100 flex items-center gap-1"
                    title="Upload Image"
                    disabled={isUploadingEmail}
                  >
                    <Image size={16} />
                    {isUploadingEmail && <span className="text-xs">Uploading...</span>}
                  </button>
                  <button 
                    onClick={() => setShowLinkDialog(true)} 
                    className="px-3 py-1 bg-white border rounded hover:bg-gray-100"
                    title="Insert Link"
                  >
                    <Link size={16} />
                  </button>
                  <button 
                    onClick={() => setShowYouTubeDialog(true)} 
                    className="px-3 py-1 bg-white border rounded hover:bg-gray-100"
                    title="Insert YouTube Video"
                  >
                    <Film size={16} />
                  </button>
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={emailFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEmailFileUpload}
                  className="hidden"
                />
                
                {/* Content Editor */}
                <div
                  ref={emailContentRef}
                  className="w-full min-h-[400px] p-4 border rounded-lg bg-white focus:border-green-500 transition-colors"
                  contentEditable
                  suppressContentEditableWarning={true}
                  onInput={handleEmailContentChange}
                  onFocus={() => {
                    const placeholderElement = emailContentRef.current?.querySelector('.placeholder-text');
                    if (placeholderElement) {
                      placeholderElement.remove();
                    }
                  }}
                  style={{
                    direction: 'ltr',
                    textAlign: 'left',
                    unicodeBidi: 'normal',
                    writingMode: 'horizontal-tb'
                  }}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateCampaign}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Campaign
              </button>
              <button
                onClick={() => {
                  setIsCreatingCampaign(false);
                  setEmailContent('');
                  if (emailContentRef.current) {
                    emailContentRef.current.innerHTML = '';
                  }
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Dialog Modal */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                <input
                  type="text"
                  value={linkData.text}
                  onChange={(e) => setLinkData(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter the text to display"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkData.url}
                  onChange={(e) => setLinkData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={insertEmailLink}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Insert Link
              </button>
              <button
                onClick={() => setShowLinkDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Dialog Modal */}
      {showYouTubeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Insert YouTube Video</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={insertEmailYouTube}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Insert Video
              </button>
              <button
                onClick={() => setShowYouTubeDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">All Campaigns</h2>
          
          {emailCampaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No campaigns yet. Create your first campaign to get started!
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
                        {campaign.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[campaign.type]}`}>
                        {campaign.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Recipients</p>
                      <p className="font-semibold">{campaign.recipients}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sent</p>
                      <p className="font-semibold">{campaign.sent}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Opened</p>
                      <p className="font-semibold">{campaign.opened}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Clicked</p>
                      <p className="font-semibold">{campaign.clicked}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm text-gray-500">
                    <span>Created: {campaign.created}</span>
                    {campaign.lastSent && <span>Last sent: {campaign.lastSent}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};