import React, { useEffect, useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { getEvents } from '../../services/calendarService';
import { formatEventDate } from '../../utils/eventUtils';
import { formatShortDate } from '../../utils/eventUtils';

/**
 * CalendarMiniWidget
 *
 * A lightweight, embeddable widget for showing a list of upcoming events.
 * It fetches events from the XANO backend and renders a simple list with
 * optional images and location information. The widget can be configured
 * via props to limit the number of events shown, filter by tag/category
 * and adjust basic styling such as title and theme. Clicking on an event
 * will invoke the optional onEventClick callback.
 */
export interface CalendarMiniWidgetProps {
  /** Heading displayed above the list of events.  If null, the internal header will be hidden */
  title?: string | null;
  /** Maximum number of events to display */
  maxItems?: number;
  /** Optional tag/category filter; only events with this tag will be shown */
  tag?: string | null;
  /** Colour theme for the widget */
  theme?: 'light' | 'dark';
  /** Whether to show the event's cover image in the list */
  showImages?: boolean;
  /** Whether to show the time portion of the event date (defaults to true).  If false, only the date is shown */
  showTime?: boolean;
  /** Whether to show the location row (defaults to true) */
  showLocation?: boolean;
  /** Callback fired when a user clicks on an event */
  onEventClick?: (event: any) => void;
}

const CalendarMiniWidget: React.FC<CalendarMiniWidgetProps> = ({
  title = 'Upcoming Events',
  maxItems = 5,
  tag = null,
  theme = 'light',
  showImages = true,
  showTime = true,
  showLocation = true,
  onEventClick
}) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load events whenever the tag or maxItems change
    const load = async () => {
      setLoading(true);
      try {
        const data = await getEvents({ limit: maxItems, tag });
        setEvents(data || []);
      } catch (err) {
        console.error('CalendarMiniWidget: failed to load events', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tag, maxItems]);

  return (
    <div
      className={`calendar-mini-widget rounded-lg overflow-hidden shadow-lg bg-${
        theme === 'dark' ? 'gray-800' : 'white'
      } text-${theme === 'dark' ? 'gray-200' : 'gray-800'}`}
    >
      {title && (
        <div
          className={`p-4 font-semibold text-lg border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
          }`}
        >
          {title}
        </div>
      )}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-gray-500">Loading events…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming events</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded p-2"
              onClick={() => onEventClick && onEventClick(event)}
            >
              {showImages && event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 overflow-hidden">
                <h4 className="font-medium truncate">{event.title}</h4>
                <p className="text-xs flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Calendar size={12} />{' '}
                  {showTime
                    ? formatEventDate(event.start_date, event.end_date, event.timezone)
                    : formatShortDate(event.start_date, event.timezone)}
                </p>
                {showLocation && event.location && (
                  <p className="text-xs flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <MapPin size={12} /> {event.location}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarMiniWidget;