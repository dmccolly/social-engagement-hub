// Newsletter Builder - Create newsletters from templates or scratch
import React, { useState } from 'react';
import { Mail, Layout, FileText, Sparkles, ArrowRight, Image, Type, Link } from 'lucide-react';

const NewsletterBuilder = ({ onCreateNewsletter, onCancel }) => {
  const [step, setStep] = useState('template'); // 'template' or 'customize'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [newsletterData, setNewsletterData] = useState({
    name: '',
    subject: '',
    fromName: '',
    fromEmail: '',
    preheader: ''
  });

  // Newsletter templates
  const templates = [
    {
      id: 'blank',
      name: 'Blank Canvas',
      description: 'Start from scratch with a blank newsletter',
      icon: <FileText size={32} />,
      blocks: []
    },
    {
      id: 'simple',
      name: 'Simple Newsletter',
      description: 'Clean layout with header, content, and footer',
      icon: <Layout size={32} />,
      blocks: [
        { id: 1, type: 'heading', content: { text: 'Your Newsletter Title', level: 1, color: '#1e40af', alignment: 'center', fontFamily: 'Arial' } },
        { id: 2, type: 'text', content: { text: 'Welcome to our newsletter! Here\'s what\'s new this week...', fontSize: '16', fontFamily: 'Arial', color: '#374151', alignment: 'left', lineHeight: '1.6' } },
        { id: 3, type: 'divider', content: { color: '#e5e7eb', thickness: '1' } },
        { id: 4, type: 'heading', content: { text: 'Featured Story', level: 2, color: '#1e40af', alignment: 'left', fontFamily: 'Arial' } },
        { id: 5, type: 'image', content: { src: 'https://via.placeholder.com/600x300', alt: 'Featured image', width: '100%', alignment: 'center', borderRadius: '8' } },
        { id: 6, type: 'text', content: { text: 'Add your featured story content here. This is where you can highlight your main article or announcement.', fontSize: '16', fontFamily: 'Arial', color: '#374151', alignment: 'left', lineHeight: '1.6' } },
        { id: 7, type: 'button', content: { text: 'Read More', url: '#', color: '#2563eb', textColor: '#ffffff', borderRadius: '8', fontSize: '16' } },
        { id: 8, type: 'spacer', content: { height: 30 } },
        { id: 9, type: 'text', content: { text: 'Thanks for reading! Stay tuned for more updates.', fontSize: '14', fontFamily: 'Arial', color: '#6b7280', alignment: 'center', lineHeight: '1.5' } }
      ]
    },
    {
      id: 'announcement',
      name: 'Announcement',
      description: 'Perfect for product launches and announcements',
      icon: <Sparkles size={32} />,
      blocks: [
        { id: 1, type: 'spacer', content: { height: 20 } },
        { id: 2, type: 'heading', content: { text: '🎉 Big Announcement!', level: 1, color: '#7c3aed', alignment: 'center', fontFamily: 'Arial' } },
        { id: 3, type: 'text', content: { text: 'We\'re excited to share something special with you...', fontSize: '18', fontFamily: 'Arial', color: '#374151', alignment: 'center', lineHeight: '1.6', bold: true } },
        { id: 4, type: 'spacer', content: { height: 20 } },
        { id: 5, type: 'image', content: { src: 'https://via.placeholder.com/600x400', alt: 'Announcement image', width: '100%', alignment: 'center', borderRadius: '12' } },
        { id: 6, type: 'spacer', content: { height: 20 } },
        { id: 7, type: 'text', content: { text: 'Add your announcement details here. Explain what\'s new, why it matters, and what your audience should do next.', fontSize: '16', fontFamily: 'Arial', color: '#374151', alignment: 'left', lineHeight: '1.6' } },
        { id: 8, type: 'button', content: { text: 'Learn More', url: '#', color: '#7c3aed', textColor: '#ffffff', borderRadius: '8', fontSize: '18' } },
        { id: 9, type: 'spacer', content: { height: 30 } }
      ]
    },
    {
      id: 'digest',
      name: 'Content Digest',
      description: 'Multiple articles or updates in one email',
      icon: <Type size={32} />,
      blocks: [
        { id: 1, type: 'heading', content: { text: 'This Week\'s Digest', level: 1, color: '#059669', alignment: 'center', fontFamily: 'Georgia' } },
        { id: 2, type: 'text', content: { text: 'Your weekly roundup of the best content and updates.', fontSize: '16', fontFamily: 'Georgia', color: '#6b7280', alignment: 'center', lineHeight: '1.5', italic: true } },
        { id: 3, type: 'divider', content: { color: '#d1d5db', thickness: '2' } },
        { id: 4, type: 'spacer', content: { height: 20 } },
        
        // Article 1
        { id: 5, type: 'heading', content: { text: '📰 Article Title 1', level: 2, color: '#059669', alignment: 'left', fontFamily: 'Georgia' } },
        { id: 6, type: 'text', content: { text: 'Brief description of your first article. Keep it concise and engaging to encourage clicks.', fontSize: '15', fontFamily: 'Georgia', color: '#374151', alignment: 'left', lineHeight: '1.6' } },
        { id: 7, type: 'button', content: { text: 'Read Article', url: '#', color: '#059669', textColor: '#ffffff', borderRadius: '6', fontSize: '14' } },
        { id: 8, type: 'spacer', content: { height: 20 } },
        
        // Article 2
        { id: 9, type: 'heading', content: { text: '📰 Article Title 2', level: 2, color: '#059669', alignment: 'left', fontFamily: 'Georgia' } },
        { id: 10, type: 'text', content: { text: 'Brief description of your second article. Highlight the key takeaway or benefit.', fontSize: '15', fontFamily: 'Georgia', color: '#374151', alignment: 'left', lineHeight: '1.6' } },
        { id: 11, type: 'button', content: { text: 'Read Article', url: '#', color: '#059669', textColor: '#ffffff', borderRadius: '6', fontSize: '14' } },
        { id: 12, type: 'spacer', content: { height: 20 } },
        
        // Article 3
        { id: 13, type: 'heading', content: { text: '📰 Article Title 3', level: 2, color: '#059669', alignment: 'left', fontFamily: 'Georgia' } },
        { id: 14, type: 'text', content: { text: 'Brief description of your third article. Make it compelling and action-oriented.', fontSize: '15', fontFamily: 'Georgia', color: '#374151', alignment: 'left', lineHeight: '1.6' } },
        { id: 15, type: 'button', content: { text: 'Read Article', url: '#', color: '#059669', textColor: '#ffffff', borderRadius: '6', fontSize: '14' } },
        
        { id: 16, type: 'spacer', content: { height: 30 } },
        { id: 17, type: 'divider', content: { color: '#d1d5db', thickness: '1' } },
        { id: 18, type: 'text', content: { text: 'That\'s all for this week! See you next time.', fontSize: '14', fontFamily: 'Georgia', color: '#6b7280', alignment: 'center', lineHeight: '1.5' } }
      ]
    },
    {
      id: 'promotional',
      name: 'Promotional',
      description: 'Highlight offers, sales, or special promotions',
      icon: <Sparkles size={32} />,
      blocks: [
        { id: 1, type: 'heading', content: { text: '🎁 Special Offer Inside!', level: 1, color: '#dc2626', alignment: 'center', fontFamily: 'Arial' } },
        { id: 2, type: 'text', content: { text: 'Limited time offer - Don\'t miss out!', fontSize: '20', fontFamily: 'Arial', color: '#dc2626', alignment: 'center', lineHeight: '1.4', bold: true } },
        { id: 3, type: 'spacer', content: { height: 20 } },
        { id: 4, type: 'image', content: { src: 'https://via.placeholder.com/600x300', alt: 'Promotion image', width: '100%', alignment: 'center', borderRadius: '8' } },
        { id: 5, type: 'spacer', content: { height: 20 } },
        { id: 6, type: 'text', content: { text: 'Get 50% OFF on all products this week only! Use code: SAVE50 at checkout.', fontSize: '18', fontFamily: 'Arial', color: '#374151', alignment: 'center', lineHeight: '1.6', bold: true, backgroundColor: '#fef3c7', padding: '20' } },
        { id: 7, type: 'spacer', content: { height: 20 } },
        { id: 8, type: 'button', content: { text: 'Shop Now', url: '#', color: '#dc2626', textColor: '#ffffff', borderRadius: '8', fontSize: '18', padding: '16' } },
        { id: 9, type: 'spacer', content: { height: 20 } },
        { id: 10, type: 'text', content: { text: 'Offer expires in 7 days. Terms and conditions apply.', fontSize: '12', fontFamily: 'Arial', color: '#6b7280', alignment: 'center', lineHeight: '1.5', italic: true } }
      ]
    },
    {
      id: 'update',
      name: 'Company Update',
      description: 'Share company news and updates',
      icon: <Mail size={32} />,
      blocks: [
        { id: 1, type: 'heading', content: { text: 'Company Update', level: 1, color: '#0369a1', alignment: 'center', fontFamily: 'Arial' } },
        { id: 2, type: 'text', content: { text: 'Important updates from our team', fontSize: '16', fontFamily: 'Arial', color: '#6b7280', alignment: 'center', lineHeight: '1.5' } },
        { id: 3, type: 'divider', content: { color: '#cbd5e1', thickness: '2' } },
        { id: 4, type: 'spacer', content: { height: 20 } },
        { id: 5, type: 'text', content: { text: 'Dear Team,', fontSize: '16', fontFamily: 'Arial', color: '#374151', alignment: 'left', lineHeight: '1.6' } },
        { id: 6, type: 'text', content: { text: 'We wanted to share some exciting updates with you. Here\'s what\'s been happening...', fontSize: '16', fontFamily: 'Arial', color: '#374151', alignment: 'left', lineHeight: '1.6' } },
        { id: 7, type: 'spacer', content: { height: 20 } },
        { id: 8, type: 'heading', content: { text: 'What\'s New', level: 2, color: '#0369a1', alignment: 'left', fontFamily: 'Arial' } },
        { id: 9, type: 'text', content: { text: '• Update point 1\n• Update point 2\n• Update point 3', fontSize: '16', fontFamily: 'Arial', color: '#374151', alignment: 'left', lineHeight: '1.8' } },
        { id: 10, type: 'spacer', content: { height: 20 } },
        { id: 11, type: 'text', content: { text: 'Thank you for your continued support!', fontSize: '16', fontFamily: 'Arial', color: '#374151', alignment: 'left', lineHeight: '1.6' } },
        { id: 12, type: 'text', content: { text: 'Best regards,\nThe Team', fontSize: '16', fontFamily: 'Arial', color: '#374151', alignment: 'left', lineHeight: '1.6', italic: true } }
      ]
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleContinue = () => {
    if (step === 'template' && selectedTemplate) {
      setStep('customize');
    } else if (step === 'customize') {
      // Create the newsletter campaign
      const campaignData = {
        ...newsletterData,
        type: 'newsletter',
        blocks: selectedTemplate.blocks.map(block => ({
          ...block,
          id: Date.now() + Math.random() // Ensure unique IDs
        }))
      };
      onCreateNewsletter(campaignData);
    }
  };

  const handleBack = () => {
    if (step === 'customize') {
      setStep('template');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="text-blue-600" />
            Create Newsletter
          </h2>
          <p className="text-gray-600 mt-1">
            {step === 'template' ? 'Choose a template to get started' : 'Customize your newsletter details'}
          </p>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${step === 'template' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'template' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
          <span>Choose Template</span>
        </div>
        <ArrowRight className="text-gray-400" />
        <div className={`flex items-center gap-2 ${step === 'customize' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'customize' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
          <span>Customize Details</span>
        </div>
      </div>

      {/* Template Selection */}
      {step === 'template' && (
        <div>
          <div className="grid grid-cols-3 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`p-6 border-2 rounded-lg cursor-pointer transition hover:shadow-lg ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-4 ${selectedTemplate?.id === template.id ? 'text-blue-600' : 'text-gray-400'}`}>
                    {template.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  {selectedTemplate?.id === template.id && (
                    <div className="mt-4 text-blue-600 font-semibold flex items-center gap-1">
                      <Sparkles size={16} />
                      Selected
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customize Details */}
      {step === 'customize' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Newsletter Name *
              </label>
              <input
                type="text"
                value={newsletterData.name}
                onChange={(e) => setNewsletterData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Weekly Update - March 2024"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject Line *
              </label>
              <input
                type="text"
                value={newsletterData.subject}
                onChange={(e) => setNewsletterData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., This Week's Top Stories"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Name *
              </label>
              <input
                type="text"
                value={newsletterData.fromName}
                onChange={(e) => setNewsletterData(prev => ({ ...prev, fromName: e.target.value }))}
                placeholder="e.g., Your Company Name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email *
              </label>
              <input
                type="email"
                value={newsletterData.fromEmail}
                onChange={(e) => setNewsletterData(prev => ({ ...prev, fromEmail: e.target.value }))}
                placeholder="e.g., newsletter@yourcompany.com"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preheader Text (optional)
            </label>
            <input
              type="text"
              value={newsletterData.preheader}
              onChange={(e) => setNewsletterData(prev => ({ ...prev, preheader: e.target.value }))}
              placeholder="Preview text that appears after the subject line"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              This text appears in the inbox preview, after your subject line
            </p>
          </div>

          {/* Template Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Selected Template:</h4>
            <div className="flex items-center gap-3">
              <div className="text-blue-600">{selectedTemplate.icon}</div>
              <div>
                <p className="font-medium">{selectedTemplate.name}</p>
                <p className="text-sm text-gray-600">{selectedTemplate.blocks.length} content blocks</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={step === 'customize' ? handleBack : onCancel}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          {step === 'customize' ? 'Back' : 'Cancel'}
        </button>
        <button
          onClick={handleContinue}
          disabled={step === 'template' ? !selectedTemplate : !newsletterData.name || !newsletterData.subject || !newsletterData.fromName || !newsletterData.fromEmail}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 'template' ? 'Continue' : 'Create Newsletter'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default NewsletterBuilder;

