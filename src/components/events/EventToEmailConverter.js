// Event to Email Converter - Convert events to email campaigns with optional blog content and RSVP stats
import React, { useState, useEffect } from 'react';
import { Mail, Calendar, FileText, Users, ArrowRight, Check, X } from 'lucide-react';
import { getPublishedPosts } from '../../services/xanoService';
import { formatEventDate } from '../../utils/eventUtils';

// Import sanitization function from BlogToEmailConverter
const sanitizeBlogHtmlForEmail = (html) => {
  if (!html || typeof html !== 'string') return html;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Remove onclick handlers and editor-specific attributes from images
  tempDiv.querySelectorAll('img').forEach(img => {
    img.removeAttribute('onclick');
    img.removeAttribute('contenteditable');
    img.removeAttribute('draggable');
    const id = img.getAttribute('id');
    if (id && id.startsWith('img-')) {
      img.removeAttribute('id');
    }
    const classes = img.className.split(' ').filter(cls => 
      cls.startsWith('size-') || cls.startsWith('position-') || 
      cls === 'rounded' || cls === 'w-full'
    );
    img.className = classes.join(' ');
    if (img.style.cursor === 'pointer') {
      img.style.cursor = '';
    }
  });
  
  // Remove onclick handlers and editor-specific attributes from media wrappers
  tempDiv.querySelectorAll('.media-wrapper, [id^="media-"]').forEach(el => {
    el.removeAttribute('onclick');
    el.removeAttribute('contenteditable');
    const id = el.getAttribute('id');
    if (id && id.startsWith('media-')) {
      el.removeAttribute('id');
    }
    if (el.style.cursor === 'pointer') {
      el.style.cursor = '';
    }
  });
  
  // Remove any floating toolbars or resize handles
  tempDiv.querySelectorAll('.floating-toolbar, .resize-handle, .selected-image').forEach(el => {
    if (el.classList.contains('selected-image')) {
      el.classList.remove('selected-image');
    } else {
      el.remove();
    }
  });
  
  // Remove image-wrapper-resizable divs but keep their content
  tempDiv.querySelectorAll('.image-wrapper-resizable').forEach(wrapper => {
    const parent = wrapper.parentNode;
    while (wrapper.firstChild) {
      parent.insertBefore(wrapper.firstChild, wrapper);
    }
    wrapper.remove();
  });
  
  return tempDiv.innerHTML;
};

// Generate RSVP statistics HTML for email
const generateRSVPStatsHTML = (stats, event) => {
  const attendanceRate = stats.total > 0 
    ? Math.round((stats.yes / stats.total) * 100) 
    : 0;
  
  const spotsRemaining = event.max_attendees 
    ? Math.max(0, event.max_attendees - stats.yes)
    : null;
  
  return `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #f9fafb; font-family: Arial, sans-serif;">
      <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px; font-weight: bold;">
        📊 RSVP Status
      </h3>
      
      <table style="width: 100%; margin-bottom: 16px;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align: center; padding: 12px; background: white; border-radius: 6px; width: 33%;">
            <div style="font-size: 24px; font-weight: bold; color: #10b981;">${stats.yes}</div>
            <div style="font-size: 14px; color: #6b7280;">Attending</div>
          </td>
          <td style="width: 2%;"></td>
          <td style="text-align: center; padding: 12px; background: white; border-radius: 6px; width: 33%;">
            <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${stats.maybe}</div>
            <div style="font-size: 14px; color: #6b7280;">Maybe</div>
          </td>
          <td style="width: 2%;"></td>
          <td style="text-align: center; padding: 12px; background: white; border-radius: 6px; width: 33%;">
            <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${stats.no}</div>
            <div style="font-size: 14px; color: #6b7280;">Can't Attend</div>
          </td>
        </tr>
      </table>
      
      ${spotsRemaining !== null ? `
        <div style="background: white; padding: 12px; border-radius: 6px; text-align: center; margin-bottom: 12px;">
          <div style="font-size: 18px; font-weight: bold; color: #2563eb;">${spotsRemaining} spot${spotsRemaining !== 1 ? 's' : ''} remaining</div>
          <div style="font-size: 14px; color: #6b7280;">out of ${event.max_attendees} total</div>
        </div>
      ` : ''}
      
      <div style="text-align: center; font-size: 14px; color: #6b7280;">
        Total RSVPs: ${stats.total} • ${attendanceRate}% attending
      </div>
    </div>
  `;
};

// Generate event HTML for email
const generateEventEmailHTML = (event, baseURL = 'https://historyofidahobroadcasting.org') => {
  return `
    <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 20px 0; font-family: Arial, sans-serif;">
      ${event.image_url ? `
        <img src="${event.image_url}" alt="${event.title}" style="width: 100%; max-width: 600px; height: auto; object-fit: cover; border-radius: 8px; margin-bottom: 20px; display: block;" />
      ` : ''}
      
      <h2 style="margin: 0 0 16px 0; font-size: 28px; color: #1f2937; font-weight: bold;">
        ${event.title}
      </h2>
      
      <div style="margin-bottom: 20px;">
        <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
          <span style="margin-right: 8px;">📅</span>
          ${formatEventDate(event.start_date, event.end_date, event.timezone)}
        </p>
        <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
          <span style="margin-right: 8px;">📍</span>
          ${event.location_type === 'virtual' ? 'Virtual Event' : (event.location || 'Location TBD')}
        </p>
        ${event.max_attendees ? `
          <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
            <span style="margin-right: 8px;">👥</span>
            Limited to ${event.max_attendees} attendees
          </p>
        ` : ''}
      </div>
      
      ${event.description ? `
        <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
          ${event.description}
        </p>
      ` : ''}
      
      <div style="text-align: center; margin-top: 24px;">
        ${event.rsvp_enabled ? `
          <a href="${baseURL}/tools-hoibf/social-admin?tab=events&event=${event.id}" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-right: 12px; margin-bottom: 8px;">
            RSVP Now
          </a>
        ` : ''}
        <a href="${baseURL}/tools-hoibf/social-admin?tab=events&event=${event.id}" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 16px; margin-bottom: 8px;">
          📅 View Event Details
        </a>
      </div>
      
      ${event.organizer_name ? `
        <p style="margin: 24px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 14px; text-align: center;">
          Organized by ${event.organizer_name}
          ${event.organizer_email ? ` • <a href="mailto:${event.organizer_email}" style="color: #2563eb; text-decoration: none;">${event.organizer_email}</a>` : ''}
        </p>
      ` : ''}
    </div>
  `;
};

const EventToEmailConverter = ({ event, onConvert, onCancel }) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);
  const [rsvpStats, setRsvpStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailSettings, setEmailSettings] = useState({
    includeBlogPost: false,
    includeRSVPStats: true,
    addCallToAction: true,
    ctaText: 'RSVP Now',
    ctaUrl: ''
  });

  const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV';

  useEffect(() => {
    loadData();
  }, [event.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load blog posts
      const blogResult = await getPublishedPosts();
      if (blogResult.success) {
        setBlogPosts(blogResult.posts || []);
      }

      // Load RSVP stats if event has RSVP enabled
      if (event.rsvp_enabled) {
        try {
          const rsvpResponse = await fetch(`${XANO_BASE_URL}/events/${event.id}/rsvps`);
          if (rsvpResponse.ok) {
            const rsvps = await rsvpResponse.json();
            calculateStats(rsvps);
          }
        } catch (error) {
          console.error('Failed to load RSVPs:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (rsvps) => {
    const stats = {
      total: rsvps.length,
      yes: rsvps.filter(r => r.response === 'yes').length,
      no: rsvps.filter(r => r.response === 'no').length,
      maybe: rsvps.filter(r => r.response === 'maybe').length
    };
    setRsvpStats(stats);
  };

  const convertToEmail = () => {
    console.log('🔄 Converting event to email...');
    console.log('📝 Blog post selected:', selectedBlogPost?.title);
    console.log('⚙️ Email settings:', emailSettings);
    
    const emailBlocks = [];
    let blockId = Date.now();

    // 1. Event Header
    emailBlocks.push({
      id: blockId++,
      type: 'html',
      content: { html: generateEventEmailHTML(event) }
    });

    // 2. Blog Content (if selected)
    if (emailSettings.includeBlogPost && selectedBlogPost) {
      // Add divider
      emailBlocks.push({
        id: blockId++,
        type: 'divider',
        content: { color: '#e5e7eb', thickness: '2' }
      });

      // Add spacer
      emailBlocks.push({
        id: blockId++,
        type: 'spacer',
        content: { height: 20 }
      });

      // Add blog heading
      emailBlocks.push({
        id: blockId++,
        type: 'heading',
        content: { 
          text: selectedBlogPost.title, 
          level: 2,
          color: '#1f2937',
          alignment: 'left',
          fontFamily: 'Arial'
        }
      });

      // Add featured image (floated left if exists)
      if (selectedBlogPost.featured_image) {
        emailBlocks.push({
          id: blockId++,
          type: 'image',
          content: {
            src: selectedBlogPost.featured_image,
            alt: selectedBlogPost.title,
            width: 40,
            float: 'left',
            borderRadius: '8'
          }
        });
      }

      // Add blog content
      if (selectedBlogPost.content) {
        const sanitizedContent = sanitizeBlogHtmlForEmail(selectedBlogPost.content);
        emailBlocks.push({
          id: blockId++,
          type: 'html',
          content: { html: sanitizedContent }
        });
      }

      // Add "Read Full Article" button
      emailBlocks.push({
        id: blockId++,
        type: 'button',
        content: {
          text: 'Read Full Article',
          url: `https://historyofidahobroadcasting.org/tools-hoibf/social-admin?tab=blog&post=${selectedBlogPost.id}`,
          color: '#6b7280',
          textColor: '#ffffff',
          borderRadius: '8',
          fontSize: '14'
        }
      });

      // Add spacer
      emailBlocks.push({
        id: blockId++,
        type: 'spacer',
        content: { height: 20 }
      });
    }

    // 3. RSVP Statistics (if enabled and available)
    if (emailSettings.includeRSVPStats && rsvpStats && rsvpStats.total > 0) {
      // Add divider
      emailBlocks.push({
        id: blockId++,
        type: 'divider',
        content: { color: '#e5e7eb', thickness: '2' }
      });

      // Add RSVP stats
      emailBlocks.push({
        id: blockId++,
        type: 'html',
        content: { html: generateRSVPStatsHTML(rsvpStats, event) }
      });
    }

    // 4. Call to Action (if enabled)
    if (emailSettings.addCallToAction) {
      // Add spacer
      emailBlocks.push({
        id: blockId++,
        type: 'spacer',
        content: { height: 20 }
      });

      emailBlocks.push({
        id: blockId++,
        type: 'button',
        content: {
          text: emailSettings.ctaText,
          url: emailSettings.ctaUrl || `https://historyofidahobroadcasting.org/tools-hoibf/social-admin?tab=events&event=${event.id}`,
          color: '#2563eb',
          textColor: '#ffffff',
          borderRadius: '8',
          fontSize: '16'
        }
      });
    }

    // Create campaign data
    const campaignData = {
      name: `Event: ${event.title}`,
      subject: event.title,
      fromName: event.organizer_name || 'History of Idaho Broadcasting',
      fromEmail: event.organizer_email || 'events@historyofidahobroadcasting.org',
      blocks: emailBlocks
    };

    console.log('✅ Campaign data created with', emailBlocks.length, 'blocks');
    console.log('📦 Campaign data:', campaignData);

    onConvert(campaignData);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="text-blue-600" />
            Convert Event to Email Campaign
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 p-2">
            <X size={24} />
          </button>
        </div>

        {/* Event Preview */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Calendar className="text-blue-600 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-sm text-gray-600">
                {formatEventDate(event.start_date, event.end_date, event.timezone)}
              </p>
              <p className="text-sm text-gray-600">
                {event.location_type === 'virtual' ? 'Virtual Event' : event.location}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Options */}
          <div className="space-y-6">
            {/* Blog Post Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="includeBlogPost"
                  checked={emailSettings.includeBlogPost}
                  onChange={(e) => setEmailSettings({...emailSettings, includeBlogPost: e.target.checked})}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="includeBlogPost" className="font-semibold flex items-center gap-2">
                  <FileText size={18} />
                  Include Blog Post
                </label>
              </div>

              {emailSettings.includeBlogPost && (
                <div className="ml-7 space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                  {blogPosts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">No published blog posts found</p>
                  ) : (
                    blogPosts.map(post => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedBlogPost(post)}
                        className={`p-3 border rounded-lg cursor-pointer transition ${
                          selectedBlogPost?.id === post.id 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {post.featured_image && (
                            <img 
                              src={post.featured_image} 
                              alt={post.title} 
                              className="w-16 h-16 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2">{post.title}</h4>
                            {post.excerpt && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{post.excerpt}</p>
                            )}
                          </div>
                          {selectedBlogPost?.id === post.id && (
                            <Check size={16} className="text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* RSVP Statistics */}
            {event.rsvp_enabled && rsvpStats && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="includeRSVPStats"
                    checked={emailSettings.includeRSVPStats}
                    onChange={(e) => setEmailSettings({...emailSettings, includeRSVPStats: e.target.checked})}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="includeRSVPStats" className="font-semibold flex items-center gap-2">
                    <Users size={18} />
                    Include RSVP Statistics
                  </label>
                </div>

                {emailSettings.includeRSVPStats && rsvpStats.total > 0 && (
                  <div className="ml-7 p-3 bg-gray-50 border rounded-lg">
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="text-lg font-bold text-green-600">{rsvpStats.yes}</div>
                        <div className="text-xs text-gray-600">Attending</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-600">{rsvpStats.maybe}</div>
                        <div className="text-xs text-gray-600">Maybe</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-600">{rsvpStats.no}</div>
                        <div className="text-xs text-gray-600">Can't Attend</div>
                      </div>
                    </div>
                    <div className="text-center text-xs text-gray-600 mt-2">
                      Total: {rsvpStats.total} RSVPs
                    </div>
                  </div>
                )}

                {emailSettings.includeRSVPStats && rsvpStats.total === 0 && (
                  <div className="ml-7 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    No RSVPs yet. Statistics will be hidden in email.
                  </div>
                )}
              </div>
            )}

            {/* Call to Action */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="addCallToAction"
                  checked={emailSettings.addCallToAction}
                  onChange={(e) => setEmailSettings({...emailSettings, addCallToAction: e.target.checked})}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="addCallToAction" className="font-semibold">
                  Add Call-to-Action Button
                </label>
              </div>

              {emailSettings.addCallToAction && (
                <div className="ml-7 space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Button Text</label>
                    <input
                      type="text"
                      value={emailSettings.ctaText}
                      onChange={(e) => setEmailSettings({...emailSettings, ctaText: e.target.value})}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="RSVP Now"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Button URL (optional)</label>
                    <input
                      type="text"
                      value={emailSettings.ctaUrl}
                      onChange={(e) => setEmailSettings({...emailSettings, ctaUrl: e.target.value})}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Leave empty for auto-generated URL"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Preview */}
          <div>
            <h3 className="font-semibold mb-3">Email Preview</h3>
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <div className="bg-white p-4 rounded">
                <h4 className="font-bold text-sm mb-2">Subject: {event.title}</h4>
                <div className="text-xs space-y-1 text-gray-600">
                  <p><strong>From:</strong> {event.organizer_name || 'History of Idaho Broadcasting'}</p>
                  <p><strong>Email:</strong> {event.organizer_email || 'events@historyofidahobroadcasting.org'}</p>
                  <p className="mt-3"><strong>Content Blocks:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Event details with image and description</li>
                    {emailSettings.includeBlogPost && selectedBlogPost && (
                      <li>Blog post: "{selectedBlogPost.title}"</li>
                    )}
                    {emailSettings.includeRSVPStats && rsvpStats && rsvpStats.total > 0 && (
                      <li>RSVP statistics ({rsvpStats.total} total responses)</li>
                    )}
                    {emailSettings.addCallToAction && (
                      <li>Call-to-action button: "{emailSettings.ctaText}"</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={convertToEmail}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <Mail size={18} />
            Convert to Email Campaign
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventToEmailConverter;
