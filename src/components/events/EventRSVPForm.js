// Event RSVP Form - Public-facing form for event registration
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, CheckCircle, X, Download } from 'lucide-react';
import { formatEventDate, canRSVP } from '../../utils/eventUtils';
import { downloadICS, getAddToCalendarLinks } from '../../utils/icsGenerator';

const EventRSVPForm = ({ eventId, onClose }) => {
  const [event, setEvent] = useState(null);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    response: 'yes',
    guests_count: 0,
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5';

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${XANO_BASE_URL}/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
        
        // Get RSVP count
        const rsvpResponse = await fetch(`${XANO_BASE_URL}/events/${eventId}/rsvps?response=yes`);
        if (rsvpResponse.ok) {
          const rsvps = await rsvpResponse.json();
          setRsvpCount(rsvps.length);
        }
      }
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (formData.guests_count < 0) newErrors.guests_count = 'Guests count cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      const response = await fetch(`${XANO_BASE_URL}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit RSVP');
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert('Error submitting RSVP');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <p className="text-gray-600">Event not found</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  const rsvpCheck = canRSVP(event, rsvpCount);
  const calendarLinks = getAddToCalendarLinks(event);

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">RSVP Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your {formData.response}! A confirmation email has been sent to {formData.email}.
          </p>

          {formData.response === 'yes' && (
            <div className="space-y-3 mb-6">
              <p className="font-medium text-gray-700">Add this event to your calendar:</p>
              
              <button
                onClick={() => downloadICS(event)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download size={18} />
                Download Calendar File (.ics)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={calendarLinks.google}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Google Calendar
                </a>
                <a
                  href={calendarLinks.outlook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Outlook
                </a>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
              <div className="space-y-1 text-gray-600">
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
                    {rsvpCount} / {event.max_attendees} attending
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Event Image */}
        {event.image_url && (
          <div className="w-full h-64">
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="p-6 border-b">
            <h3 className="font-semibold mb-2">About This Event</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {/* RSVP Form */}
        <div className="p-6">
          {!rsvpCheck.can ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">{rsvpCheck.reason}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold text-lg">RSVP for This Event</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Will you attend? *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['yes', 'no', 'maybe'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData({ ...formData, response: option })}
                      className={`p-3 border rounded-lg text-center font-medium ${
                        formData.response === option
                          ? option === 'yes'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : option === 'no'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {formData.response === 'yes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    value={formData.guests_count}
                    onChange={(e) => setFormData({ ...formData, guests_count: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.guests_count ? 'border-red-500' : ''}`}
                    min="0"
                    max="10"
                  />
                  {errors.guests_count && <p className="text-red-500 text-sm mt-1">{errors.guests_count}</p>}
                  <p className="text-sm text-gray-500 mt-1">Not including yourself</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes or Questions (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Any dietary restrictions, accessibility needs, or questions?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Submit RSVP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRSVPForm;

