// Event Calendar Widget - Embeddable calendar for website
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, List, Grid, MapPin, Users, Clock } from 'lucide-react';
import { formatShortDate, getCategoryColor, getTimeUntilEvent } from '../../utils/eventUtils';

const EventCalendarWidget = ({ onEventClick, embedded = false, limit = null, category = null }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'month', 'list'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const XANO_BASE_URL = process.env.REACT_APP_XANO_BASE_URL || 'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV';

  useEffect(() => {
    loadEvents();
  }, [category]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      let url = `${XANO_BASE_URL}/events?status=published`;
      if (category) url += `&category=${category}`;
      
      const response = await fetch(url);
      if (response.ok) {
        let data = await response.json();
        
        // Filter to upcoming events only
        data = data.filter(event => new Date(event.start_date) > new Date());
        
        // Sort by start date
        data.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        
        // Apply limit if specified
        if (limit) data = data.slice(0, limit);
        
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderMonthView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-100" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => {
            setSelectedDate(date);
            if (dayEvents.length > 0) {
              // Show events for this date
            }
          }}
          className={`p-2 border border-gray-100 min-h-[80px] cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-blue-50' : ''
          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
            {day}
          </div>
          {dayEvents.length > 0 && (
            <div className="space-y-1">
              {dayEvents.slice(0, 2).map(event => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick && onEventClick(event);
                  }}
                  className={`text-xs p-1 rounded truncate ${getCategoryColor(event.category)}`}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-semibold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border border-gray-200 rounded-lg overflow-hidden">
          {days}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    if (events.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No upcoming events</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {events.map(event => (
          <div
            key={event.id}
            onClick={() => onEventClick && onEventClick(event)}
            className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex gap-4">
              {/* Date Badge */}
              <div className="flex-shrink-0 text-center">
                <div className="bg-blue-600 text-white rounded-lg p-3 w-16">
                  <div className="text-2xl font-bold">
                    {new Date(event.start_date).getDate()}
                  </div>
                  <div className="text-xs uppercase">
                    {new Date(event.start_date).toLocaleString('default', { month: 'short' })}
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                  </div>
                  {event.rsvp_enabled && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick && onEventClick(event);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      RSVP
                    </button>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Clock size={16} />
                    {formatShortDate(event.start_date, event.timezone)}
                    <span className="text-blue-600 font-medium">
                      • {getTimeUntilEvent(event.start_date)}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={16} />
                    {event.location_type === 'virtual' ? 'Virtual Event' : event.location}
                  </p>
                  {event.max_attendees && (
                    <p className="flex items-center gap-2">
                      <Users size={16} />
                      {event.max_attendees} max attendees
                    </p>
                  )}
                </div>

                {event.description && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading events...</p>
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'bg-white rounded-lg shadow-lg p-6'}>
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar size={24} />
            Upcoming Events
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              title="List View"
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setView('month')}
              className={`p-2 rounded ${view === 'month' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              title="Month View"
            >
              <Grid size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {view === 'month' ? renderMonthView() : renderListView()}
    </div>
  );
};

export default EventCalendarWidget;

