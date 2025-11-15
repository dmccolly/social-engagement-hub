// Event Email Block - Display event in email campaigns with RSVP button
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { formatEventDate } from '../../utils/eventUtils';

const EventEmailBlock = ({ eventId, onUpdate }) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV';

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${XANO_BASE_URL}/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
        if (onUpdate) {
          onUpdate(data);
        }
      }
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEmailHTML = (event, baseURL = 'https://your-site.com') => {
    return `
      <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 20px 0; font-family: Arial, sans-serif; max-width: 600px;">
        ${event.image_url ? `
          <img src="${event.image_url}" alt="${event.title}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;" />
        ` : ''}
        
        <h2 style="margin: 0 0 16px 0; font-size: 28px; color: #1f2937; font-weight: bold;">
          ${event.title}
        </h2>
        
        <div style="margin-bottom: 20px;">
          <p style="margin: 8px 0; color: #4b5563; font-size: 16px; display: flex; align-items: center;">
            <span style="margin-right: 8px;">📅</span>
            ${formatEventDate(event.start_date, event.end_date, event.timezone)}
          </p>
          <p style="margin: 8px 0; color: #4b5563; font-size: 16px; display: flex; align-items: center;">
            <span style="margin-right: 8px;">📍</span>
            ${event.location_type === 'virtual' ? 'Virtual Event' : event.location}
          </p>
          ${event.max_attendees ? `
            <p style="margin: 8px 0; color: #4b5563; font-size: 16px; display: flex; align-items: center;">
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
            <a href="${baseURL}/events/${event.id}/rsvp" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-right: 12px;">
              RSVP Now
            </a>
          ` : ''}
          <a href="${baseURL}/events/${event.id}/ics" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 16px;">
            📅 Add to Calendar
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

  if (loading) {
    return (
      <div className="border rounded-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2 text-sm">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="border border-dashed rounded-lg p-6 text-center text-gray-500">
        <Calendar size={32} className="mx-auto mb-2 text-gray-400" />
        <p>Select an event to display</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Preview */}
      <div className="p-6 bg-gray-50">
        {event.image_url && (
          <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover rounded-lg mb-4" />
        )}
        
        <h3 className="text-2xl font-bold mb-3">{event.title}</h3>
        
        <div className="space-y-2 text-gray-700 mb-4">
          <p className="flex items-center gap-2">
            <Calendar size={18} />
            {formatEventDate(event.start_date, event.end_date, event.timezone)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={18} />
            {event.location_type === 'virtual' ? 'Virtual Event' : event.location}
          </p>
          {event.max_attendees && (
            <p className="flex items-center gap-2">
              <Users size={18} />
              Limited to {event.max_attendees} attendees
            </p>
          )}
        </div>
        
        {event.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
        )}
        
        <div className="flex gap-3">
          {event.rsvp_enabled && (
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
              RSVP Now
            </button>
          )}
          <button className="px-4 py-2 border rounded-lg">
            📅 Add to Calendar
          </button>
        </div>
      </div>

      {/* Email HTML Code */}
      <div className="p-4 bg-white border-t">
        <details>
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            View Email HTML
          </summary>
          <div className="mt-2">
            <textarea
              readOnly
              value={generateEmailHTML(event)}
              className="w-full p-2 border rounded text-xs font-mono bg-gray-50"
              rows="10"
              onClick={(e) => e.target.select()}
            />
            <p className="text-xs text-gray-500 mt-1">
              Copy this HTML to use in your email campaign
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};

// Export function to generate HTML for use in email campaigns
export const generateEventEmailHTML = (event, baseURL = 'https://your-site.com') => {
  return `
    <div style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 20px 0; font-family: Arial, sans-serif;">
      ${event.image_url ? `
        <img src="${event.image_url}" alt="${event.title}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;" />
      ` : ''}
      
      <h2 style="margin: 0 0 16px 0; font-size: 28px; color: #1f2937; font-weight: bold;">
        ${event.title}
      </h2>
      
      <div style="margin-bottom: 20px;">
        <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
          📅 ${formatEventDate(event.start_date, event.end_date, event.timezone)}
        </p>
        <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
          📍 ${event.location_type === 'virtual' ? 'Virtual Event' : event.location}
        </p>
      </div>
      
      ${event.description ? `
        <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
          ${event.description}
        </p>
      ` : ''}
      
      <div style="text-align: center; margin-top: 24px;">
        ${event.rsvp_enabled ? `
          <a href="${baseURL}/events/${event.id}/rsvp" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-right: 12px;">
            RSVP Now
          </a>
        ` : ''}
        <a href="${baseURL}/events/${event.id}/ics" style="display: inline-block; background-color: #f3f4f6; color: #1f2937; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 16px;">
          📅 Add to Calendar
        </a>
      </div>
    </div>
  `;
};

export default EventEmailBlock;

