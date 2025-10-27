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

// Determine the base URL for your Xano backend.  If an environment
// variable is provided (e.g. REACT_APP_XANO_BASE_URL), use that;
// otherwise fall back to a hard‑coded default.  This allows the
// service to be portable between development and production
// environments.
const XANO_BASE_URL = process.env.REACT_APP_XANO_PROXY_BASE || 
  (typeof window !== 'undefined' ? '/xano' : 
    ((typeof process !== 'undefined' && process.env && process.env.REACT_APP_XANO_BASE_URL) || 
      'https://xajo-bs7d-cagt.n7e.xano.io/api:iZd1_fI5'));

/**
 * Fetch a list of events from the backend. Only published events are
 * returned and the list is filtered to include only future events.
 * Results are sorted by start date ascending. An optional limit
 * restricts the number of items returned; an optional tag filter
 * restricts results to events with a matching tag (case‑insensitive).
 *
 * @param {Object} options
 * @param {number} [options.limit] - maximum number of events to return
 * @param {string|null} [options.tag] - optional tag to filter events
 * @returns {Promise<Array>} A promise that resolves to an array of event objects
 */
export async function getEvents(options = {}) {
  const { limit, tag } = options;
  try {
    let url = `${XANO_BASE_URL}/events?status=published`;
    if (tag) {
      url += `&tag=${encodeURIComponent(tag)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('calendarService: non-OK response when fetching events', response.status);
      return [];
    }
    let data = await response.json();
    // Filter out past events and sort by start date
    const now = new Date();
    data = data
      .filter((event) => {
        const start = new Date(event.start_date);
        return start > now;
      })
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    if (limit && data.length > limit) {
      data = data.slice(0, limit);
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
 *
 * @param {number} eventId - ID of the event to fetch
 * @returns {Promise<Object|null>} The event object, or null if not found
 */
export async function getEventById(eventId) {
  try {
    const response = await fetch(`${XANO_BASE_URL}/events/${eventId}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('calendarService: failed to fetch event by id', err);
    return null;
  }
}
