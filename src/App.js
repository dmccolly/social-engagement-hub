import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, MessageSquare, FileText, Mail, Users, Calendar, Settings, BarChart3, Plus, Edit, Trash2, Send, X, UserPlus, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Link, Unlink, Type, Palette, Image, Upload } from 'lucide-react';

const StandaloneNewsFeedWidget = () => {
  const settings = {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#3b82f6'
  };

  const newsFeedPosts = [
    {
      id: 1,
      author: 'Community Team',
      content: 'Welcome to our community! We\'re excited to have you here.',
      timestamp: '2 hours ago',
      likes: 12,
      comments: 3,
      isLiked: false,
      isSaved: false
    },
    {
      id: 2,
      author: 'John Doe',
      content: 'Just finished reading an amazing article about web development trends. The future looks bright!',
      timestamp: '4 hours ago',
      likes: 8,
      comments: 2,
      isLiked: true,
      isSaved: false
    },
    {
      id: 3,
      author: 'Jane Smith',
      content: 'Looking forward to our upcoming community meetup next week. Who else is planning to attend?',
      timestamp: '6 hours ago',
      likes: 15,
      comments: 7,
      isLiked: false,
      isSaved: true
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="p-4 border-b" style={{ borderColor: settings.accentColor + '20' }}>
        <h3 className="text-lg font-semibold" style={{ color: settings.textColor }}>Community Feed</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {newsFeedPosts.map(post => (
          <div key={post.id} className="p-4 border-b border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: settings.accentColor }}>
                {post.author.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm" style={{ color: settings.textColor }}>{post.author}</span>
                  <span className="text-xs text-gray-500">{post.timestamp}</span>
                </div>
                <p className="text-sm mb-2" style={{ color: settings.textColor }}>{post.content}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <button className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
                    <span>♥</span>
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-blue-500">
                    <span>💬</span>
                    <span>{post.comments}</span>
                  </button>
                  <button className={`${post.isSaved ? 'text-yellow-500' : 'hover:text-yellow-500'}`}>
                    <span>⭐</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StandaloneBlogWidget = () => {
  const settings = {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#3b82f6'
  };

  const posts = [
    { id: 1, title: 'Getting Started with React', excerpt: 'Learn the basics of React development...', date: '2024-01-15', author: 'John Doe' },
    { id: 2, title: 'Advanced JavaScript Techniques', excerpt: 'Explore advanced concepts in JavaScript...', date: '2024-01-10', author: 'Jane Smith' }
  ];

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="p-4 border-b" style={{ borderColor: settings.accentColor + '20' }}>
        <h3 className="text-lg font-semibold" style={{ color: settings.textColor }}>Latest Posts</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {posts.map(post => (
          <div key={post.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
            <h4 className="font-medium mb-2" style={{ color: settings.textColor }}>{post.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{post.author}</span>
              <span>{post.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StandaloneCalendarWidget = () => {
  const settings = {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#3b82f6'
  };

  const calendarEvents = [
    {
      id: 1,
      title: 'Team Meeting',
      date: '2024-01-20',
      time: '10:00 AM',
      type: 'meeting'
    },
    {
      id: 2,
      title: 'Project Deadline',
      date: '2024-01-25',
      time: '11:59 PM',
      type: 'deadline'
    },
    {
      id: 3,
      title: 'Community Event',
      date: '2024-01-30',
      time: '2:00 PM',
      type: 'event'
    },
    {
      id: 4,
      title: 'Workshop: React Basics',
      date: '2024-02-05',
      time: '3:00 PM',
      type: 'workshop'
    },
    {
      id: 5,
      title: 'Monthly Review',
      date: '2024-02-10',
      time: '9:00 AM',
      type: 'meeting'
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: settings.backgroundColor }}>
      <div className="p-4 border-b" style={{ borderColor: settings.accentColor + '20' }}>
        <h3 className="text-lg font-semibold" style={{ color: settings.textColor }}>Upcoming Events</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {calendarEvents.map(event => (
          <div key={event.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
            <div className="flex items-start space-x-3">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                event.type === 'meeting' ? 'bg-blue-500' :
                event.type === 'deadline' ? 'bg-red-500' :
                event.type === 'workshop' ? 'bg-green-500' :
                'bg-purple-500'
              }`}></div>
              <div className="flex-1">
                <h4 className="font-medium text-sm" style={{ color: settings.textColor }}>{event.title}</h4>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                  <span>{event.date}</span>
                  <span>•</span>
                  <span>{event.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main App Component
const MainApp = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCreating, setIsCreating] = useState(false);
  const [contentType, setContentType] = useState('post');
  const [posts, setPosts] = useState([
    { id: 1, title: 'Welcome to Our Community', content: 'This is our first blog post...', date: '2024-01-15', published: true },
    { id: 2, title: 'Getting Started Guide', content: 'Here\'s how to get started...', date: '2024-01-10', published: true }
  ]);

  const [emails, setEmails] = useState([
    { 
      id: 1, 
      subject: 'Welcome to the Community', 
      content: 'Thank you for joining our community...', 
      recipients: 25, 
      date: '2024-01-15', 
      status: 'sent',
      opens: 18
    },
    { 
      id: 2, 
      subject: 'Weekly Newsletter', 
      content: 'Here are this week\'s highlights...', 
      recipients: 30, 
      date: '2024-01-10', 
      status: 'sent',
      opens: 22
    }
  ]);

  const [emailComposer, setEmailComposer] = useState({
    isOpen: false,
    subject: '',
    content: '',
    recipientType: 'all',
    selectedRole: 'member',
    recipients: [],
    saveAsDraft: false,
    trackOpens: true
  });

  const [inviteForm, setInviteForm] = useState({
    isOpen: false,
    name: '',
    email: '',
    role: 'member',
    sendEmail: true
  });

  const [members, setMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', joinDate: '2024-01-01' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'moderator', status: 'active', joinDate: '2024-01-05' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'member', status: 'active', joinDate: '2024-01-10' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'member', status: 'pending', joinDate: '2024-01-15' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'member', status: 'active', joinDate: '2024-01-12' },
    { id: 6, name: 'Diana Davis', email: 'diana@example.com', role: 'moderator', status: 'active', joinDate: '2024-01-08' },
    { id: 7, name: 'Eve Miller', email: 'eve@example.com', role: 'member', status: 'inactive', joinDate: '2024-01-03' },
    { id: 8, name: 'Frank Garcia', email: 'frank@example.com', role: 'admin', status: 'active', joinDate: '2024-01-02' },
    { id: 9, name: 'Grace Lee', email: 'grace@example.com', role: 'member', status: 'pending', joinDate: '2024-01-16' },
    { id: 10, name: 'Henry Taylor', email: 'henry@example.com', role: 'member', status: 'active', joinDate: '2024-01-14' }
  ]);

  const [newsFeedPosts, setNewsFeedPosts] = useState([
    {
      id: 1,
      author: 'Community Team',
      content: 'Welcome to our community! We\'re excited to have you here.',
      timestamp: '2 hours ago',
      likes: 12,
      comments: 3,
      isLiked: false,
      isSaved: false
    },
    {
      id: 2,
      author: 'John Doe',
      content: 'Just finished reading an amazing article about web development trends. The future looks bright!',
      timestamp: '4 hours ago',
      likes: 8,
      comments: 2,
      isLiked: true,
      isSaved: false
    }
  ]);

  const sendEmailViaSendGrid = async (emailData) => {
    const sendGridPayload = {
      personalizations: [{
        to: emailData.recipients.map(email => ({ email })),
        subject: emailData.subject
      }],
      from: { email: 'noreply@yourdomain.com', name: 'Community Team' },
      content: [{
        type: 'text/html',
        value: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${emailData.subject}</h2>
            <div style="line-height: 1.6; color: #666;">
              ${emailData.content.replace(/\n/g, '<br>')}
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">
              This email was sent from your community platform.
            </p>
          </div>
        `
      }],
      tracking_settings: {
        open_tracking: { enable: emailData.trackOpens }
      }
    };

    try {
      console.log('SendGrid API Key available:', !!process.env.SENDGRID_API_KEY);
      if (!process.env.SENDGRID_API_KEY) {
        console.log('Demo mode: Email would be sent via SendGrid');
        return { success: true, demo: true };
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sendGridPayload)
      });

      if (response.ok) {
        console.log('Email sent successfully via SendGrid');
        return { success: true };
      } else {
        console.error('SendGrid API error:', response.status);
        return { success: false, error: 'SendGrid API error' };
      }
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    let recipients = [];
    if (emailComposer.recipientType === 'all') {
      recipients = members.filter(m => m.status === 'active').map(m => m.email);
    } else if (emailComposer.recipientType === 'role') {
      recipients = members.filter(m => m.role === emailComposer.selectedRole && m.status === 'active').map(m => m.email);
    } else {
      recipients = emailComposer.recipients;
    }

    if (recipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    const emailData = {
      subject: emailComposer.subject,
      content: emailComposer.content,
      recipients: recipients,
      recipientType: emailComposer.recipientType,
      selectedRole: emailComposer.selectedRole,
      saveAsDraft: emailComposer.saveAsDraft,
      trackOpens: emailComposer.trackOpens
    };

    if (!emailComposer.saveAsDraft) {
      const result = await sendEmailViaSendGrid(emailData);
      if (result.success) {
        const newEmail = {
          id: Date.now(),
          subject: emailComposer.subject,
          content: emailComposer.content,
          recipients: recipients.length,
          date: new Date().toLocaleDateString(),
          status: result.demo ? 'demo' : 'sent',
          opens: 0
        };
        setEmails(prev => [newEmail, ...prev]);
        alert(result.demo ? 'Demo: Email would be sent via SendGrid' : 'Email sent successfully!');
      } else {
        alert('Failed to send email: ' + result.error);
      }
    } else {
      const newDraft = {
        id: Date.now(),
        subject: emailComposer.subject,
        content: emailComposer.content,
        recipients: recipients.length,
        date: new Date().toLocaleDateString(),
        status: 'draft'
      };
      setEmails(prev => [newDraft, ...prev]);
      alert('Email saved as draft');
    }

    resetEmailComposer();
  };

  const handleSaveEmailDraft = () => {
    const newDraft = {
      id: Date.now(),
      subject: emailComposer.subject,
      content: emailComposer.content,
      recipients: emailComposer.recipients.length,
      date: new Date().toLocaleDateString(),
      status: 'draft'
    };
    setEmails(prev => [newDraft, ...prev]);
    resetEmailComposer();
    alert('Email saved as draft');
  };

  const resetEmailComposer = () => {
    setEmailComposer({
      isOpen: false,
      subject: '',
      content: '',
      recipientType: 'all',
      selectedRole: 'member',
      recipients: [],
      saveAsDraft: false,
      trackOpens: true
    });
  };

  const addRecipient = (email) => {
    setEmailComposer(prev => ({
      ...prev,
      recipients: [...prev.recipients, email]
    }));
  };

  const removeRecipient = (email) => {
    setEmailComposer(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const handleInviteMember = (e) => {
    e.preventDefault();
    const newMember = {
      id: Date.now(),
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      status: 'pending',
      joinDate: new Date().toLocaleDateString()
    };
    setMembers(prev => [...prev, newMember]);
    
    if (inviteForm.sendEmail) {
      alert(`Invitation email sent to ${inviteForm.email}`);
    } else {
      alert(`Member ${inviteForm.name} added successfully`);
    }
    
    resetInviteForm();
  };

  const resetInviteForm = () => {
    setInviteForm({
      isOpen: false,
      name: '',
      email: '',
      role: 'member',
      sendEmail: true
    });
  };

  const RichBlogEditor = () => {
    const editorRef = useRef(null);
    const [selectedFont, setSelectedFont] = useState('Arial');
    const [selectedSize, setSelectedSize] = useState('14');
    const [selectedColor, setSelectedColor] = useState('#000000');

    const applyFormat = (command, value = null) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
    };

    const applyFontFamily = (font) => {
      setSelectedFont(font);
      applyFormat('fontName', font);
    };

    const applyFontSize = (size) => {
      setSelectedSize(size);
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = size + 'px';
        try {
          range.surroundContents(span);
        } catch (e) {
          span.appendChild(range.extractContents());
          range.insertNode(span);
        }
      }
    };

    const applyTextColor = (color) => {
      setSelectedColor(color);
      applyFormat('foreColor', color);
    };

    const applyHeading = (level) => {
      const headingTag = `h${level}`;
      applyFormat('formatBlock', headingTag);
    };

    const applyAlignment = (alignment) => {
      applyFormat(`justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`);
    };

    const addLink = () => {
      const url = prompt('Enter URL:');
      if (url) {
        applyFormat('createLink', url);
      }
    };

    const removeLink = () => {
      applyFormat('unlink');
    };

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.border = '2px solid transparent';
          img.style.cursor = 'pointer';
          img.onclick = () => selectImage(img);
          
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(img);
            range.collapse(false);
          } else {
            editorRef.current.appendChild(img);
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const selectImage = (img) => {
      document.querySelectorAll('.selected-image').forEach(el => {
        el.classList.remove('selected-image');
        el.style.border = '2px solid transparent';
        el.style.boxShadow = 'none';
      });
      
      img.classList.add('selected-image');
      img.style.border = '2px solid #3b82f6';
      img.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
      
      document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
      document.querySelectorAll('.resize-handle').forEach(el => el.remove());
      
      const toolbar = document.createElement('div');
      toolbar.className = 'image-toolbar';
      toolbar.innerHTML = `
        <div style="position: absolute; top: -40px; left: 0; background: white; border: 1px solid #ccc; border-radius: 4px; padding: 4px; display: flex; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 1000;">
          <button onclick="window.resizeImageTo(this, 'small')" style="padding: 4px 8px; border: none; background: #f3f4f6; border-radius: 2px; cursor: pointer; font-size: 12px;">Small</button>
          <button onclick="window.resizeImageTo(this, 'medium')" style="padding: 4px 8px; border: none; background: #f3f4f6; border-radius: 2px; cursor: pointer; font-size: 12px;">Medium</button>
          <button onclick="window.resizeImageTo(this, 'large')" style="padding: 4px 8px; border: none; background: #f3f4f6; border-radius: 2px; cursor: pointer; font-size: 12px;">Large</button>
          <button onclick="window.positionImageTo(this, 'left')" style="padding: 4px 8px; border: none; background: #f3f4f6; border-radius: 2px; cursor: pointer; font-size: 12px;">Left</button>
          <button onclick="window.positionImageTo(this, 'center')" style="padding: 4px 8px; border: none; background: #f3f4f6; border-radius: 2px; cursor: pointer; font-size: 12px;">Center</button>
          <button onclick="window.positionImageTo(this, 'right')" style="padding: 4px 8px; border: none; background: #f3f4f6; border-radius: 2px; cursor: pointer; font-size: 12px;">Right</button>
          <button onclick="this.closest('.image-toolbar').previousElementSibling.remove(); this.closest('.image-toolbar').remove();" style="padding: 4px 8px; border: none; background: #ef4444; color: white; border-radius: 2px; cursor: pointer; font-size: 12px;">Delete</button>
        </div>
      `;
      
      img.style.position = 'relative';
      img.parentNode.insertBefore(toolbar, img.nextSibling);
      
      addCornerHandles(img);
    };

    const addCornerHandles = (img) => {
      ['nw', 'ne', 'sw', 'se'].forEach(corner => {
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        handle.style.cssText = `
          position: absolute;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border: 1px solid white;
          cursor: ${corner.includes('n') ? (corner.includes('w') ? 'nw' : 'ne') : (corner.includes('w') ? 'sw' : 'se')}-resize;
          ${corner.includes('n') ? 'top: -4px;' : 'bottom: -4px;'}
          ${corner.includes('w') ? 'left: -4px;' : 'right: -4px;'}
          z-index: 1001;
        `;
        img.parentNode.insertBefore(handle, img.nextSibling);
      });
    };

    window.resizeImageTo = (button, size) => {
      const img = button.closest('.image-toolbar').previousElementSibling;
      const sizes = { small: '200px', medium: '400px', large: '600px' };
      img.style.width = sizes[size];
      img.style.height = 'auto';
    };

    window.positionImageTo = (button, position) => {
      const img = button.closest('.image-toolbar').previousElementSibling;
      img.style.display = 'block';
      img.style.margin = position === 'left' ? '0 auto 0 0' : 
                        position === 'center' ? '0 auto' : 
                        '0 0 0 auto';
    };

    const handleContentChange = () => {
      const images = editorRef.current?.querySelectorAll('img') || [];
      const toolbars = document.querySelectorAll('.image-toolbar');
      
      toolbars.forEach(toolbar => {
        const img = toolbar.previousElementSibling;
        if (!img || img.tagName !== 'IMG' || !editorRef.current?.contains(img)) {
          toolbar.remove();
        }
      });
    };

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (editorRef.current && !editorRef.current.contains(e.target) && 
            !e.target.closest('.image-toolbar') && !e.target.closest('.resize-handle')) {
          document.querySelectorAll('.selected-image').forEach(el => {
            el.classList.remove('selected-image');
            el.style.border = '2px solid transparent';
            el.style.boxShadow = 'none';
          });
          document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
          document.querySelectorAll('.resize-handle').forEach(el => el.remove());
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
      return () => {
        document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
        document.querySelectorAll('.resize-handle').forEach(el => el.remove());
        document.querySelectorAll('.selected-image').forEach(el => {
          el.classList.remove('selected-image');
          el.style.border = '2px solid transparent';
          el.style.boxShadow = 'none';
        });
      };
    }, []);

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Create New {contentType === 'post' ? 'Blog Post' : 'Email Campaign'}</h2>
        
        {/* Toolbar */}
        <div className="border-b pb-4 mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {/* Font Family */}
            <select 
              value={selectedFont} 
              onChange={(e) => applyFontFamily(e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Verdana">Verdana</option>
            </select>

            {/* Font Size */}
            <select 
              value={selectedSize} 
              onChange={(e) => applyFontSize(e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
              <option value="24">24px</option>
            </select>

            {/* Text Color */}
            <input 
              type="color" 
              value={selectedColor}
              onChange={(e) => applyTextColor(e.target.value)}
              className="w-8 h-8 border rounded cursor-pointer"
              title="Text Color"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {/* Basic Formatting */}
            <button onClick={() => applyFormat('bold')} className="p-2 border rounded hover:bg-gray-100">
              <Bold size={16} />
            </button>
            <button onClick={() => applyFormat('italic')} className="p-2 border rounded hover:bg-gray-100">
              <Italic size={16} />
            </button>
            <button onClick={() => applyFormat('underline')} className="p-2 border rounded hover:bg-gray-100">
              <Underline size={16} />
            </button>

            {/* Headings */}
            <select onChange={(e) => applyHeading(e.target.value)} className="px-2 py-1 border rounded text-sm">
              <option value="">Heading</option>
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="4">H4</option>
            </select>

            {/* Alignment */}
            <button onClick={() => applyAlignment('left')} className="p-2 border rounded hover:bg-gray-100">
              <AlignLeft size={16} />
            </button>
            <button onClick={() => applyAlignment('center')} className="p-2 border rounded hover:bg-gray-100">
              <AlignCenter size={16} />
            </button>
            <button onClick={() => applyAlignment('right')} className="p-2 border rounded hover:bg-gray-100">
              <AlignRight size={16} />
            </button>

            {/* Links */}
            <button onClick={addLink} className="p-2 border rounded hover:bg-gray-100">
              <Link size={16} />
            </button>
            <button onClick={removeLink} className="p-2 border rounded hover:bg-gray-100">
              <Unlink size={16} />
            </button>

            {/* Image Upload */}
            <label className="p-2 border rounded hover:bg-gray-100 cursor-pointer">
              <Image size={16} />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Editor */}
        <div 
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          className="min-h-64 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ minHeight: '300px' }}
          suppressContentEditableWarning={true}
        >
          <p>Start writing your {contentType === 'post' ? 'blog post' : 'email campaign'} here...</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {contentType === 'post' ? 'Publish Post' : 'Send Campaign'}
          </button>
          <button className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
            Save Draft
          </button>
          <button 
            onClick={() => setIsCreating(false)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // News Feed Component
  const NewsFeed = () => {
    const handleCreatePost = (content) => {
      const post = {
        id: Date.now(),
        author: 'You',
        content,
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        isLiked: false,
        isSaved: false
      };
      setNewsFeedPosts(prev => [post, ...prev]);
    };

    const toggleLike = (postId) => {
      setNewsFeedPosts(posts => posts.map(post => 
        post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post
      ));
    };

    const toggleSave = (postId) => {
      setNewsFeedPosts(posts => posts.map(post => 
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      ));
    };

    return (
      <div className="space-y-6">
        {/* Create Post */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Share an Update</h3>
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="What's on your mind?"
          />
          <div className="flex justify-end mt-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Post Update
            </button>
          </div>
        </div>

        {/* News Feed Posts */}
        <div className="space-y-4">
          {newsFeedPosts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {post.author.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold">{post.author}</span>
                    <span className="text-sm text-gray-500">{post.timestamp}</span>
                  </div>
                  <p className="text-gray-800 mb-3">{post.content}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <button 
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                    >
                      <span>♥</span>
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-500">
                      <span>💬</span>
                      <span>{post.comments}</span>
                    </button>
                    <button 
                      onClick={() => toggleSave(post.id)}
                      className={`${post.isSaved ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
                    >
                      <span>⭐</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Members Sidebar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Community Members</h3>
          <div className="space-y-3">
            {members.filter(member => member.status === 'active').slice(0, 5).map(member => (
              <div key={member.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-sm">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Dashboard Component
  const Dashboard = () => {
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800">Total Posts</h3>
            <p className="text-3xl font-bold text-blue-600">{posts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800">Active Members</h3>
            <p className="text-3xl font-bold text-green-600">{members.filter(m => m.status === 'active').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800">Email Campaigns</h3>
            <p className="text-3xl font-bold text-purple-600">{emails.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800">Pending Invites</h3>
            <p className="text-3xl font-bold text-orange-600">{members.filter(m => m.status === 'pending').length}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
          <div className="space-y-3">
            {posts.slice(0, 3).map(post => (
              <div key={post.id} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium">{post.title}</h4>
                <p className="text-sm text-gray-600">{post.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => { setContentType('post'); setIsCreating(true); }}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <Plus className="mx-auto mb-2" size={24} />
              <span className="block text-sm font-medium">New Post</span>
            </button>
            <button 
              onClick={() => setEmailComposer(prev => ({ ...prev, isOpen: true }))}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
            >
              <Mail className="mx-auto mb-2" size={24} />
              <span className="block text-sm font-medium">Send Email</span>
            </button>
            <button 
              onClick={() => setInviteForm(prev => ({ ...prev, isOpen: true }))}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
            >
              <UserPlus className="mx-auto mb-2" size={24} />
              <span className="block text-sm font-medium">Invite Member</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Content Editor Component
  const ContentEditor = () => {
    if (contentType === 'post') {
      return <RichBlogEditor />;
    } else {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Create Email Campaign</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
              <textarea rows={10} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Send Campaign</button>
              <button className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Save Draft</button>
              <button onClick={() => setIsCreating(false)} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Cancel</button>
            </div>
          </div>
        </div>
      );
    }
  };

  // Post Card Component
  const PostCard = ({ post }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
      <p className="text-gray-600 text-sm mb-2">{post.content.substring(0, 100)}...</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{post.date}</span>
        <div className="flex gap-2">
          <button className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
          <button className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  );

  const [widgetSettings, setWidgetSettings] = useState({
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#3b82f6',
    showAuthor: true,
    showDate: true,
    showExcerpt: true,
    maxPosts: 5
  });

  const widgets = [
    {
      id: 'blog',
      name: 'Blog Posts',
      category: 'content',
      description: 'Display your latest blog posts',
      component: StandaloneBlogWidget
    },
    {
      id: 'newsfeed',
      name: 'News Feed',
      category: 'social',
      description: 'Show community updates and posts',
      component: StandaloneNewsFeedWidget
    },
    {
      id: 'calendar',
      name: 'Event Calendar',
      category: 'utility',
      description: 'Display upcoming events and meetings',
      component: StandaloneCalendarWidget
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');
  const filteredWidgets = selectedCategory === 'all' ? widgets : widgets.filter(w => w.category === selectedCategory);

  const generateEmbedCode = (widgetId) => {
    return `<iframe src="${window.location.origin}/widget/${widgetId}" width="400" height="500" frameborder="0"></iframe>`;
  };

  const [copiedWidget, setCopiedWidget] = useState(null);
  const copyEmbedCode = (widgetId) => {
    const code = generateEmbedCode(widgetId);
    navigator.clipboard.writeText(code);
    setCopiedWidget(widgetId);
    setTimeout(() => setCopiedWidget(null), 2000);
  };

  const BlogWidgetPreview = () => (
    <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: widgetSettings.backgroundColor }}>
      <div className="p-4 border-b" style={{ borderColor: widgetSettings.accentColor + '20' }}>
        <h3 className="text-lg font-semibold" style={{ color: widgetSettings.textColor }}>Latest Posts</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {posts.slice(0, widgetSettings.maxPosts).map(post => (
          <div key={post.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
            <h4 className="font-medium mb-2" style={{ color: widgetSettings.textColor }}>{post.title}</h4>
            {widgetSettings.showExcerpt && (
              <p className="text-sm text-gray-600 mb-2">{post.content.substring(0, 100)}...</p>
            )}
            <div className="flex justify-between items-center text-xs text-gray-500">
              {widgetSettings.showAuthor && <span>Admin</span>}
              {widgetSettings.showDate && <span>{post.date}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Settings Component
  const Settings = () => {
    const widgetCategories = [
      { id: 'all', name: 'All Widgets', icon: '🔧' },
      { id: 'content', name: 'Content', icon: '📝' },
      { id: 'social', name: 'Social', icon: '👥' },
      { id: 'utility', name: 'Utility', icon: '⚙️' }
    ];

    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Widget Gallery & Customization</h1>
            <p className="text-gray-600">Create, customize, and embed widgets for your website</p>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-8">
            {widgetCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Widget Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Widget List */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Available Widgets</h2>
              <div className="grid gap-6">
                {filteredWidgets.map(widget => (
                  <div key={widget.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{widget.name}</h3>
                        <p className="text-gray-600 text-sm">{widget.description}</p>
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mt-2">
                          {widget.category}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyEmbedCode(widget.id)}
                          className={`px-3 py-1 rounded text-sm transition ${
                            copiedWidget === widget.id
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {copiedWidget === widget.id ? 'Copied!' : 'Copy Embed'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Widget Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="scale-75 origin-top-left transform">
                        <widget.component />
                      </div>
                    </div>
                    
                    {/* Embed Code */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Embed Code:</label>
                      <div className="bg-gray-100 p-3 rounded border text-sm font-mono text-gray-800 overflow-x-auto">
                        {generateEmbedCode(widget.id)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customization Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <h2 className="text-xl font-semibold mb-4">Customize Widgets</h2>
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  {/* Color Settings */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Colors</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Background</label>
                        <input
                          type="color"
                          value={widgetSettings.backgroundColor}
                          onChange={(e) => setWidgetSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-full h-10 rounded border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Text Color</label>
                        <input
                          type="color"
                          value={widgetSettings.textColor}
                          onChange={(e) => setWidgetSettings(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-full h-10 rounded border"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Accent Color</label>
                        <input
                          type="color"
                          value={widgetSettings.accentColor}
                          onChange={(e) => setWidgetSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="w-full h-10 rounded border"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Display Options */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Display Options</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={widgetSettings.showAuthor}
                          onChange={(e) => setWidgetSettings(prev => ({ ...prev, showAuthor: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show Author</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={widgetSettings.showDate}
                          onChange={(e) => setWidgetSettings(prev => ({ ...prev, showDate: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show Date</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={widgetSettings.showExcerpt}
                          onChange={(e) => setWidgetSettings(prev => ({ ...prev, showExcerpt: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show Excerpt</span>
                      </label>
                    </div>
                  </div>

                  {/* Content Settings */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Content</h3>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Max Posts</label>
                      <select
                        value={widgetSettings.maxPosts}
                        onChange={(e) => setWidgetSettings(prev => ({ ...prev, maxPosts: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      >
                        <option value={3}>3 posts</option>
                        <option value={5}>5 posts</option>
                        <option value={10}>10 posts</option>
                      </select>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Live Preview</h3>
                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                      <BlogWidgetPreview />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'newsfeed', icon: MessageSquare, label: 'News Feed' },
    { id: 'posts', icon: FileText, label: 'Blog Posts' },
    { id: 'campaigns', icon: Mail, label: 'Email Campaigns' },
    { id: 'members', icon: Users, label: 'Members' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' }
  ];

  const [memberFilter, setMemberFilter] = useState('all');
  const [drafts, setDrafts] = useState([
    { id: 1, title: 'Draft Post 1', content: 'This is a draft post...', date: '2024-01-16' },
    { id: 2, title: 'Draft Post 2', content: 'Another draft post...', date: '2024-01-17' }
  ]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Social Hub</h2>
        </div>
        <nav className="px-4 pb-6">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                // Clean up image toolbars when switching sections
                document.querySelectorAll('.image-toolbar').forEach(el => el.remove());
                document.querySelectorAll('.resize-handle').forEach(el => el.remove());
                document.querySelectorAll('.selected-image').forEach(el => {
                  el.classList.remove('selected-image');
                  el.style.border = '2px solid transparent';
                  el.style.boxShadow = 'none';
                });
                setActiveSection(item.id);
                setIsCreating(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg mb-2 transition ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {isCreating ? (
          <ContentEditor />
        ) : (
          <>
            {activeSection === 'dashboard' && <Dashboard />}
            {activeSection === 'newsfeed' && <NewsFeed />}
            {activeSection === 'settings' && <Settings />}
            {activeSection === 'posts' && (
              <div className="space-y-6">
                {/* Drafts Section */}
                {drafts.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4 text-yellow-600">📝 Drafts ({drafts.length})</h3>
                    <div className="space-y-3">
                      {drafts.map(draft => (
                        <div key={draft.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                                  DRAFT
                                </span>
                              </div>
                              <h4 className="font-semibold text-lg">{draft.title}</h4>
                              <p className="text-sm text-gray-500 mb-2">{draft.date}</p>
                              <p className="text-gray-700">{draft.content.length > 100 ? `${draft.content.substring(0, 100)}...` : draft.content}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  // Publish draft
                                  const publishedPost = { ...draft, published: true };
                                  setPosts(prev => [publishedPost, ...prev]);
                                  setDrafts(prev => prev.filter(d => d.id !== draft.id));
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                              >
                                <Send size={16} />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Published Posts Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">📄 Published Posts ({posts.length})</h3>
                    <button
                      onClick={() => { setContentType('post'); setIsCreating(true); }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus size={20} /> New Post
                    </button>
                  </div>
                  <div className="space-y-3">
                    {posts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                    
                    {posts.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No published posts yet. Create your first post!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeSection === 'campaigns' && (
              <div className="space-y-6">
                {/* Email Management Header */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">📧 Email Management</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        🚀 <strong>SendGrid Integration Active</strong> - Real email delivery with tracking
                      </p>
                    </div>
                    <button
                      onClick={() => setEmailComposer(prev => ({ ...prev, isOpen: true }))}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Plus size={16} />
                      New Campaign
                    </button>
                  </div>

                  {/* Quick Send Form */}
                  <form onSubmit={handleSendEmail} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <input
                        type="text"
                        value={emailComposer.subject}
                        onChange={(e) => setEmailComposer(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter email subject..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <textarea
                        value={emailComposer.content}
                        onChange={(e) => setEmailComposer(prev => ({ ...prev, content: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your message..."
                        required
                      />
                    </div>

                    {/* Recipient Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Send To</label>
                        <select
                          value={emailComposer.recipientType}
                          onChange={(e) => setEmailComposer(prev => ({ 
                            ...prev, 
                            recipientType: e.target.value,
                            recipients: e.target.value === 'specific' ? prev.recipients : []
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="all">All Active Members ({members.filter(m => m.status === 'active').length})</option>
                          <option value="role">By Role</option>
                          <option value="specific">Specific Members</option>
                        </select>
                      </div>

                      {emailComposer.recipientType === 'role' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                          <select
                            value={emailComposer.selectedRole}
                            onChange={(e) => setEmailComposer(prev => ({ ...prev, selectedRole: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="admin">Administrators ({members.filter(m => m.role === 'admin' && m.status === 'active').length})</option>
                            <option value="moderator">Moderators ({members.filter(m => m.role === 'moderator' && m.status === 'active').length})</option>
                            <option value="member">Members ({members.filter(m => m.role === 'member' && m.status === 'active').length})</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {emailComposer.recipientType === 'specific' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add Recipients</label>
                        <div className="flex gap-2 mb-2">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                addRecipient(e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select a member to add...</option>
                            {members.filter(m => m.status === 'active' && !emailComposer.recipients.includes(m.email)).map(member => (
                              <option key={member.id} value={member.email}>
                                {member.name} ({member.email}) - {member.role}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {emailComposer.recipients.length > 0 && (
                          <div className="space-y-1">
                            {emailComposer.recipients.map(email => {
                              const member = members.find(m => m.email === email);
                              return (
                                <div key={email} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                                  <span className="text-sm">{member?.name || email} ({email})</span>
                                  <button
                                    type="button"
                                    onClick={() => removeRecipient(email)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Send Options */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={emailComposer.saveAsDraft}
                          onChange={(e) => setEmailComposer(prev => ({ ...prev, saveAsDraft: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Save as draft</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={emailComposer.trackOpens}
                          onChange={(e) => setEmailComposer(prev => ({ ...prev, trackOpens: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Track opens</span>
                      </label>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                      <p><strong>Subject:</strong> {emailComposer.subject || 'No subject'}</p>
                      <p><strong>Recipients:</strong> {
                        emailComposer.recipientType === 'all' 
                          ? `All ${members.filter(m => m.status === 'active').length} active members`
                          : emailComposer.recipientType === 'role'
                          ? `${members.filter(m => m.role === emailComposer.selectedRole && m.status === 'active').length} ${emailComposer.selectedRole}s`
                          : `${emailComposer.recipients.length} specific members`
                      }</p>
                      <p><strong>Message:</strong> {emailComposer.content || 'No message'}</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Send size={16} />
                        {emailComposer.saveAsDraft ? 'Save Draft' : 'Send Email'}
                      </button>
                      <button
                        type="button"
                        onClick={resetEmailComposer}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Clear
                      </button>
                    </div>
                  </form>
                </div>

                {/* Email History */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-4">📬 Email History ({emails.length})</h3>
                  <div className="space-y-3">
                    {emails.map(email => (
                      <div key={email.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{email.subject}</h4>
                          <span className="text-sm text-gray-500">{email.date}</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{email.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>To: {email.recipients} recipients</span>
                          <span>Status: {email.status}</span>
                          {email.opens && <span>Opens: {email.opens}</span>}
                        </div>
                      </div>
                    ))}
                    
                    {emails.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No emails sent yet. Send your first campaign!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {activeSection === 'members' && (
              <div className="space-y-6">
                {/* Member Management */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">👥 Member Management ({members.length})</h3>
                    <button
                      onClick={() => setInviteForm(prev => ({ ...prev, isOpen: true }))}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <UserPlus size={16} />
                      Invite Member
                    </button>
                  </div>

                  {/* Member Filters */}
                  <div className="flex gap-2 mb-6">
                    {['all', 'admin', 'moderator', 'member', 'pending'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setMemberFilter(filter)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          memberFilter === filter
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                        {filter !== 'all' && ` (${members.filter(m => 
                          filter === 'pending' ? m.status === 'pending' : m.role === filter
                        ).length})`}
                      </button>
                    ))}
                  </div>

                  {/* Members List */}
                  <div className="space-y-3">
                    {members.filter(member => {
                      if (memberFilter === 'all') return true;
                      if (memberFilter === 'pending') return member.status === 'pending';
                      return member.role === memberFilter;
                    }).map(member => (
                      <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-semibold">{member.name}</h4>
                                <p className="text-sm text-gray-600">{member.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                member.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                member.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {member.role}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                member.status === 'active' ? 'bg-green-100 text-green-800' :
                                member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {member.status}
                              </span>
                              <span className="text-gray-500">Joined {member.joinDate}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {member.status === 'pending' && (
                              <>
                                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                                  Approve
                                </button>
                                <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                                  Reject
                                </button>
                              </>
                            )}
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                              <Edit size={16} />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Empty State */}
                    {members.filter(member => {
                      if (memberFilter === 'all') return true;
                      if (memberFilter === 'pending') return member.status === 'pending';
                      return member.role === memberFilter;
                    }).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No {memberFilter === 'all' ? 'members' : memberFilter === 'pending' ? 'pending members' : `${memberFilter}s`} found.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role Management */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">🔐 Role & Permission Management</h3>
                  
                  <div className="grid grid-cols-3 gap-6">
                    {/* Admin Role */}
                    <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">A</span>
                        </div>
                        <h4 className="font-semibold text-purple-900">Administrator</h4>
                      </div>
                      <p className="text-sm text-purple-700 mb-3">Full platform access and management capabilities</p>
                      <div className="space-y-1">
                        <div className="text-xs text-purple-600">✓ Read all content</div>
                        <div className="text-xs text-purple-600">✓ Write and edit content</div>
                        <div className="text-xs text-purple-600">✓ Delete any content</div>
                        <div className="text-xs text-purple-600">✓ Manage users and roles</div>
                        <div className="text-xs text-purple-600">✓ Platform settings</div>
                      </div>
                    </div>

                    {/* Moderator Role */}
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">M</span>
                        </div>
                        <h4 className="font-semibold text-blue-900">Moderator</h4>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">Content management and community moderation</p>
                      <div className="space-y-1">
                        <div className="text-xs text-blue-600">✓ Read all content</div>
                        <div className="text-xs text-blue-600">✓ Write and edit content</div>
                        <div className="text-xs text-blue-600">✓ Moderate comments</div>
                        <div className="text-xs text-blue-600">✓ Manage member posts</div>
                        <div className="text-xs text-gray-400">✗ Delete user accounts</div>
                      </div>
                    </div>

                    {/* Member Role */}
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">U</span>
                        </div>
                        <h4 className="font-semibold text-green-900">Member</h4>
                      </div>
                      <p className="text-sm text-green-700 mb-3">Standard community participation</p>
                      <div className="space-y-1">
                        <div className="text-xs text-green-600">✓ Read public content</div>
                        <div className="text-xs text-green-600">✓ Create posts and comments</div>
                        <div className="text-xs text-green-600">✓ Edit own content</div>
                        <div className="text-xs text-gray-400">✗ Moderate other users</div>
                        <div className="text-xs text-gray-400">✗ Access admin features</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invite Member Modal */}
                {inviteForm.isOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                      <h3 className="text-lg font-semibold mb-4">Invite New Member</h3>
                      <form onSubmit={handleInviteMember} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input
                            type="text"
                            value={inviteForm.name}
                            onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                          <select
                            value={inviteForm.role}
                            onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="member">Member</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="sendEmail"
                            checked={inviteForm.sendEmail}
                            onChange={(e) => setInviteForm(prev => ({ ...prev, sendEmail: e.target.checked }))}
                            className="rounded"
                          />
                          <label htmlFor="sendEmail" className="text-sm text-gray-700">
                            Send invitation email
                          </label>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setInviteForm(prev => ({ ...prev, isOpen: false }))}
                            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            {inviteForm.sendEmail ? 'Send Invitation' : 'Add Member'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeSection === 'calendar' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">📅 Calendar</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Plus size={16} />
                    Add Event
                  </button>
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center font-semibold text-gray-600 bg-gray-100">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 6; // Start from previous month
                    const isCurrentMonth = day > 0 && day <= 31;
                    const isToday = day === 15; // Mock today
                    
                    return (
                      <div
                        key={i}
                        className={`p-2 h-20 border border-gray-200 ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${isToday ? 'bg-blue-100 border-blue-300' : ''}`}
                      >
                        <div className={`text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                          {isCurrentMonth ? day : ''}
                        </div>
                        {/* Mock events */}
                        {day === 15 && (
                          <div className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded mt-1">
                            Team Meeting
                          </div>
                        )}
                        {day === 22 && (
                          <div className="text-xs bg-green-600 text-white px-1 py-0.5 rounded mt-1">
                            Launch Event
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Upcoming Events */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Upcoming Events</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium">Team Meeting</div>
                        <div className="text-sm text-gray-600">Today at 2:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium">Product Launch Event</div>
                        <div className="text-sm text-gray-600">Next week at 10:00 AM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === 'analytics' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Analytics</h2>
                <p className="text-gray-600">Analytics dashboard coming soon...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// App with Router
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/widget/blog" element={<StandaloneBlogWidget />} />
        <Route path="/widget/calendar" element={<StandaloneCalendarWidget />} />
        <Route path="/widget/newsfeed" element={<StandaloneNewsFeedWidget />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  );
};

export default App;
