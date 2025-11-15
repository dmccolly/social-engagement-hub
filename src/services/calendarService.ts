/*
 * calendarService
 *
 * Provides simple helper functions for retrieving calendar events from
 * the XANO backend. These functions encapsulate fetch logic and
 * filtering to ensure that only upcoming, published events are
 * returned to consumers. The service can be extended in the future
 * with additional endpoints such as event creation, updating or
 * deletion if administrative functions are exposed by the backend.
 */

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  timezone?: string;
  location?: string;
  image_url?: string;
  category?: string;
  tags?: string[];
  [key: string]: any;
}

const XANO_BASE_URL: string =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_XANO_BASE_URL) ||
  'https://xajo-bs7d-cagt.n7e.xano.io/api:PpStJiYV';

/**
 * Fetch a list of events from the backend. Only published events are
 * returned and the list is filtered to include only future events.
 * Results are sorted by start date ascending. An optional limit
 * restricts the number of items returned; an optional tag filter
 * restricts results to events with a matching tag (case-insensitive).
 */
export async function getEvents(options: {
  limit?: number;
  tag?: string | null;
} = {}): Promise<CalendarEvent[]> {
  try {
    let url = `${XANO_BASE_URL}/events?status=published`;
    if (options.tag) {
      // encode tag filter
      url += `&tag=${encodeURIComponent(options.tag)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('calendarService: non-OK response when fetching events', response.status);
      return [];
    }
    let data: CalendarEvent[] = await response.json();
    // Filter out past events and sort by start date
    const now = new Date();
    data = data
      .filter((event) => {
        const start = new Date(event.start_date);
        return start > now;
      })
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    if (options.limit && data.length > options.limit) {
      data = data.slice(0, options.limit);
    }
    return data;
  } catch (err) {
    console.error('calendarService: failed to fetch events', err);
    return [];
  }
}

/**
 * Fetch a single event by ID. If the event is not found or an error
 * occurs, null is returned. Consumers should handle null values.
 */
export async function getEventById(eventId: number): Promise<CalendarEvent | null> {
  try {
    const response = await fetch(`${XANO_BASE_URL}/events/${eventId}`);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as CalendarEvent;
    return data;
  } catch (err) {
    console.error('calendarService: failed to fetch event by id', err);
    return null;
  }
}