import React from 'react';

/**
 * Simple Event-to-Email Converter
 * Converts an event directly to email campaign format without modals or async loading
 */

const generateEventEmailHTML = (event) => {
  const eventDate = new Date(event.start_time);
  const dateStr = eventDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${event.image_url ? `
        <div style="margin-bottom: 20px;">
          <img src="${event.image_url}" alt="${event.title}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px;" />
        </div>
      ` : ''}
      
      <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 16px;">${event.title}</h1>
      
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 8px 0; color: #4b5563;">
          <strong>📅 When:</strong> ${dateStr}
        </p>
        ${event.location ? `
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>📍 Where:</strong> ${event.location}
          </p>
        ` : ''}
        ${event.organizer_name ? `
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>👤 Organizer:</strong> ${event.organizer_name}
          </p>
        ` : ''}
      </div>
      
      ${event.description ? `
        <div style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
          ${event.description}
        </div>
      ` : ''}
    </div>
  `;
};

export const convertEventToEmailCampaign = (event) => {
  const emailBlocks = [];
  let blockId = Date.now();

  // Event content block
  emailBlocks.push({
    id: blockId++,
    type: 'html',
    content: { html: generateEventEmailHTML(event) }
  });

  // RSVP button if enabled
  if (event.rsvp_enabled) {
    emailBlocks.push({
      id: blockId++,
      type: 'spacer',
      content: { height: 20 }
    });

    emailBlocks.push({
      id: blockId++,
      type: 'button',
      content: {
        text: 'RSVP Now',
        url: `https://historyofidahobroadcasting.org/tools-hoibf/social-admin?tab=events&event=${event.id}`,
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

  return campaignData;
};

// This is just a utility module, no React component needed
export default { convertEventToEmailCampaign };
