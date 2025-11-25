// Event List Manager - Manage all events in one place
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Copy, Eye, Users, Search, Filter, Mail, FileText, Share2, Facebook as FacebookIcon, Twitter, Linkedin, MessageSquare } from 'lucide-react';
import SocialShareButtons from '../SocialShareButtons';
import { getStatusColor, getCategoryColor, formatShortDate } from '../../utils/eventUtils';
import { shareEventToEmail, shareEventToBlog, shareEventToNewsfeed } from '../../services/eventShareService';
import EventCreator from './EventCreator';
import EventRSVPDashboard from './EventRSVPDashboard';
import EventPreview from './EventPreview';

const EventListManager = ({ currentUser }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreator, setShowCreator] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingRSVPs, setViewingRSVPs] = useState(null);
  const [previewingEvent, setPreviewingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // State to manage which event's share menu is open
  const [shareMenuEvent, setShareMenuEvent] = useState(null);

  const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV';

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, statusFilter, categoryFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${XANO_BASE_URL}/events`);
      if (response.ok) {
        const data = await response.json();
        // Sort by start date (newest first)
        data.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        setEvents(data);
      } else {
        setError(`Failed to load events: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setError('Cannot reach Events API. This may be a CORS configuration issue. Please ensure the Xano API allows requests from this domain.');
      } else {
        setError(`Failed to load events: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredEvents(filtered);
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${XANO_BASE_URL}/events/${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Event deleted successfully');
        loadEvents();
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  const handleDuplicate = async (event) => {
    const newEvent = {
      ...event,
      id: undefined,
      title: `${event.title} (Copy)`,
      status: 'draft',
      created_at: undefined,
      updated_at: undefined
    };

    try {
      const response = await fetch(`${XANO_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });

      if (response.ok) {
        alert('Event duplicated successfully');
        loadEvents();
      } else {
        alert('Failed to duplicate event');
      }
    } catch (error) {
      console.error('Error duplicating event:', error);
      alert('Error duplicating event');
    }
  };

  const categories = ['all', 'conference', 'webinar', 'meetup', 'workshop', 'social', 'training', 'other'];

  // Toggle share menu for a specific event
  const toggleShareMenuEvent = (id) => {
    setShareMenuEvent(prev => (prev === id ? null : id));
  };

  // Share event to a social network
  const shareEventToNetwork = (eventItem, network) => {
    // Build URL pointing to the event details page (assuming /events/{id})
    const url = `${window.location.origin}/events/${eventItem.id}`;
    const title = eventItem.title || '';
    let shareUrl = '';
    if (network === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (network === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    } else if (network === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setShareMenuEvent(null);
  };

  // Determine user permissions
  const userRole = currentUser?.role || 'member';
  const isMainApp = !window.location.pathname.startsWith('/widget/');
  const canManageEvents = isMainApp || userRole === 'admin' || userRole === 'editor';
  
  console.log('[EventListManager] User role:', userRole, '| Can manage:', canManageEvents, '| Is main app:', isMainApp);

  /**
   * Create a draft email campaign from the given event.  Prompts the user
   * for confirmation before sending the request to the backend.  Displays
   * a success or error message based on the result.
   */
  const handleShareToEmail = async (eventItem) => {
    if (!confirm('Create a draft email campaign from this event?')) {
      return;
    }
    try {
      const result = await shareEventToEmail(eventItem.id);
      if (result && result.success) {
        alert('Email campaign created successfully!');
      } else {
        alert(`Failed to create email campaign: ${result?.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Share to email error:', err);
      alert('Error creating email campaign');
    }
  };

  /**
   * Create a blog post from the given event.  Prompts the user
   * for confirmation before sending the request to the backend.  Displays
   * a success or error message based on the result.
   */
  const handleShareToBlog = async (eventItem) => {
    if (!confirm('Create a new blog post from this event?')) {
      return;
    }
    try {
      const result = await shareEventToBlog(eventItem.id);
      if (result && result.success) {
        alert('Blog post created successfully!');
      } else {
        alert(`Failed to create blog post: ${result?.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Share to blog error:', err);
      alert('Error creating blog post');
    }
  };

  const handleShareToNewsfeed = async (eventItem) => {
    if (!confirm('Create a newsfeed post from this event?')) {
      return;
    }
    try {
      const result = await shareEventToNewsfeed(eventItem.id);
      if (result && result.success) {
        alert('Newsfeed post created successfully!');
      } else {
        alert(`Failed to create newsfeed post: ${result?.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Share to newsfeed error:', err);
      alert('Error creating newsfeed post');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading events...</p>
      </div>
    );
  }

  if (viewingRSVPs) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setViewingRSVPs(null)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Events
          </button>
          <h2 className="text-2xl font-bold mt-2">{viewingRSVPs.title} - RSVPs</h2>
        </div>
        <EventRSVPDashboard eventId={viewingRSVPs.id} eventTitle={viewingRSVPs.title} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar size={28} />
          Event Management
        </h2>
        {canManageEvents && (
          <button
            onClick={() => {
              setEditingEvent(null);
              setShowCreator(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus size={20} />
            Create Event
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error Loading Events</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={loadEvents}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No events found</p>
          <p className="text-gray-500 mt-2">Create your first event to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <div className="flex gap-6">
                {/* Event Image */}
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={48} className="text-gray-400" />
                  </div>
                )}

                {/* Event Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold">{event.title}</h3>
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1 mb-3">
                    <p>📅 {formatShortDate(event.start_date, event.timezone)}</p>
                    <p>📍 {event.location_type === 'virtual' ? 'Virtual Event' : event.location}</p>
                    {event.rsvp_enabled && (
                      <p className="flex items-center gap-1">
                        <Users size={14} />
                        RSVP Enabled
                        {event.max_attendees && ` • Max ${event.max_attendees} attendees`}
                      </p>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {event.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {canManageEvents && (
                      <>
                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditingEvent(event);
                            setShowCreator(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-50 text-sm"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        {/* Preview */}
                        <button
                          onClick={() => setPreviewingEvent(event)}
                          className="flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-50 text-sm"
                        >
                          <Eye size={14} />
                          Preview
                        </button>
                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicate(event)}
                          className="flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-50 text-sm"
                        >
                          <Copy size={14} />
                          Duplicate
                        </button>
                        {/* Share to Email */}
                        <button
                          onClick={() => handleShareToEmail(event)}
                          className="flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-50 text-sm"
                        >
                          <Mail size={14} />
                          Email
                        </button>
                        {/* Add to Blog */}
                        <button
                          onClick={() => handleShareToBlog(event)}
                          className="flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-50 text-sm"
                        >
                          <FileText size={14} />
                          Blog
                        </button>
                        {/* Share to Newsfeed */}
                        <button
                          onClick={() => handleShareToNewsfeed(event)}
                          className="flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-50 text-sm"
                        >
                          <MessageSquare size={14} />
                          Newsfeed
                        </button>
                        {/* Share to Social Networks */}
                        <div className="flex items-center">
                          <SocialShareButtons
                            url={`${window.location.origin}/events/${event.id}`}
                            title={event.title}
                            description={event.description || ''}
                            size="sm"
                            showLabels={false}
                          />
                        </div>
                        {/* View RSVPs */}
                        {event.rsvp_enabled && (
                          <button
                            onClick={() => setViewingRSVPs(event)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            <Users size={14} />
                            View RSVPs
                          </button>
                        )}
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm ml-auto"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Creator Modal */}
      {showCreator && (
        <EventCreator
          event={editingEvent}
          onSave={() => {
            loadEvents();
            setShowCreator(false);
            setEditingEvent(null);
          }}
          onClose={() => {
            setShowCreator(false);
            setEditingEvent(null);
          }}
        />
      )}

      {previewingEvent && (
        <EventPreview
          event={previewingEvent}
          onClose={() => setPreviewingEvent(null)}
        />
      )}
    </div>
  );
};

export default EventListManager;

