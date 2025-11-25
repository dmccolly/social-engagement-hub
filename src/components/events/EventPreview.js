import React from 'react';
import { X, Calendar, MapPin, Users, Clock, Mail, ExternalLink } from 'lucide-react';
import { formatEventDate, getCategoryColor } from '../../utils/eventUtils';

/**
 * EventPreview - Read-only preview modal for viewing event details
 * without entering edit mode
 */
const EventPreview = ({ event, onClose }) => {
  if (!event) return null;

  const categories = [
    { value: 'meetup', label: 'Meetup' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'conference', label: 'Conference' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'social', label: 'Social' },
    { value: 'fundraiser', label: 'Fundraiser' },
    { value: 'other', label: 'Other' }
  ];

  const categoryLabel = categories.find(c => c.value === event.category)?.label || event.category || 'Other';
  const dateInfo = formatEventDate(event.start_date, event.end_date, event.timezone);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold">Event Preview</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Event Image */}
            {event.image_url && (
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <img 
                  src={event.image_url} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title and Status */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  event.status === 'published' ? 'bg-green-100 text-green-700' :
                  event.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {event.status}
                </span>
              </div>

              {/* Category and Tags */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}>
                  {categoryLabel}
                </span>
                {event.tags && event.tags.split(',').map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <Calendar size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p>{dateInfo}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Location</p>
                  {event.location_type === 'virtual' ? (
                    <div>
                      <p>Virtual Event</p>
                      {event.virtual_link && (
                        <a 
                          href={event.virtual_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          Join Meeting <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p>{event.location || 'Location TBD'}</p>
                  )}
                </div>
              </div>

              {event.organizer_name && (
                <div className="flex items-start gap-3">
                  <Users size={20} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Organizer</p>
                    <p>{event.organizer_name}</p>
                    {event.organizer_email && (
                      <a 
                        href={`mailto:${event.organizer_email}`}
                        className="text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <Mail size={14} />
                        {event.organizer_email}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {event.rsvp_enabled && (
                <div className="flex items-start gap-3">
                  <Users size={20} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">RSVP</p>
                    <p>
                      {event.max_attendees ? `Max ${event.max_attendees} attendees` : 'Unlimited attendees'}
                    </p>
                    {event.rsvp_deadline && (
                      <p className="text-sm text-gray-600">
                        Deadline: {new Date(event.rsvp_deadline).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h3 className="font-semibold text-lg mb-2">About This Event</h3>
                <div 
                  className="text-gray-700 whitespace-pre-wrap prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPreview;
