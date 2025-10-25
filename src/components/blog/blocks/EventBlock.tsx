import React, { useEffect, useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { formatEventDate } from '../../../utils/eventUtils';
import { CalendarEvent, getEventById } from '../../../services/calendarService';

/**
 * EventBlock
 *
 * A reusable block component for embedding event information inside
 * blog posts. This component can be passed either a complete event
 * object or an eventId. When only an ID is provided, the event
 * details will be fetched on mount. The block renders a card with
 * the event title, date, location, description preview and action
 * buttons for RSVP or adding the event to the reader's calendar.
 */
export interface EventBlockProps {
  /** Pre-loaded event object. If provided, no fetch will occur. */
  event?: CalendarEvent;
  /** ID of the event to fetch from the backend. Ignored if event is provided. */
  eventId?: number;
  /** Base URL used for RSVP and add-to-calendar links. Defaults to the root domain. */
  baseURL?: string;
}

const EventBlock: React.FC<EventBlockProps> = ({ event, eventId, baseURL = '' }) => {
  const [data, setData] = useState<CalendarEvent | null>(event || null);

  useEffect(() => {
    if (!event && eventId) {
      // Fetch the event details from the backend
      getEventById(eventId).then((res) => setData(res));
    }
  }, [event, eventId]);

  if (!data) {
    return (
      <div className="border border-dashed rounded-lg p-6 text-center text-gray-500">
        <Calendar size={32} className="mx-auto mb-2 text-gray-400" />
        <p>Select an event to embed</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Visual header */}
      {data.image_url && (
        <img
          src={data.image_url}
          alt={data.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6 bg-gray-50">
        <h3 className="text-xl font-bold mb-2">{data.title}</h3>
        <div className="space-y-1 text-sm text-gray-700 mb-4">
          <p className="flex items-center gap-2">
            <Calendar size={16} />
            {formatEventDate(data.start_date, data.end_date, data.timezone)}
          </p>
          {data.location && (
            <p className="flex items-center gap-2">
              <MapPin size={16} />
              {data.location}
            </p>
          )}
        </div>
        {data.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">{data.description}</p>
        )}
        <div className="flex gap-3">
          {data.rsvp_enabled && (
            <a
              href={`${baseURL}/events/${data.id}/rsvp`}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-center"
            >
              RSVP Now
            </a>
          )}
          <a
            href={`${baseURL}/events/${data.id}/ics`}
            className="px-4 py-2 border rounded-lg text-center"
          >
            📅 Add to Calendar
          </a>
        </div>
      </div>
    </div>
  );
};

export default EventBlock;