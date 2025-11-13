import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Globe, Video, Building } from 'lucide-react';
import { getEventById } from '../../services/calendarService';
import { formatShortDate, getCategoryColor } from '../../utils/eventUtils';
import EventRSVPForm from './EventRSVPForm';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEventById(id);
      if (data) {
        setEvent(data);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('Failed to load event:', err);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The event you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const getLocationIcon = () => {
    if (event.location_type === 'virtual') return <Video size={20} />;
    if (event.location_type === 'hybrid') return <Globe size={20} />;
    return <Building size={20} />;
  };

  const getLocationText = () => {
    if (event.location_type === 'virtual') return 'Virtual Event';
    if (event.location_type === 'hybrid') return `${event.location} (Hybrid)`;
    return event.location;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Hero Image */}
        {event.image_url && (
          <div className="mb-6">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}>
                {event.category}
              </span>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-3 text-gray-700 mb-6">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-blue-600" />
              <span className="font-medium">{formatShortDate(event.start_date, event.timezone)}</span>
            </div>
            
            <div className="flex items-center gap-3">
              {getLocationIcon()}
              <span>{getLocationText()}</span>
            </div>

            {event.virtual_link && (
              <div className="flex items-start gap-3">
                <Video size={20} className="text-blue-600 mt-1" />
                <a
                  href={event.virtual_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {event.virtual_link}
                </a>
              </div>
            )}

            {event.max_attendees && (
              <div className="flex items-center gap-3">
                <Users size={20} className="text-blue-600" />
                <span>Maximum {event.max_attendees} attendees</span>
              </div>
            )}

            {event.organizer_name && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <strong>Organized by:</strong> {event.organizer_name}
                  {event.organizer_email && ` (${event.organizer_email})`}
                </p>
              </div>
            )}
          </div>

          {/* Event Description */}
          {event.description && (
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <div 
                className="text-gray-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          )}

          {/* Tags */}
          {event.tags && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex flex-wrap gap-2">
                {event.tags.split(',').map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RSVP Section */}
        {event.rsvp_enabled && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users size={24} />
              RSVP for This Event
            </h2>
            <EventRSVPForm eventId={event.id} eventTitle={event.title} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
