/*
 * eventShareService
 *
 * Helper functions for sharing calendar events to other parts of the
 * Social Engagement Hub.  Provides utilities to create an email
 * campaign from an event and to create a new blog post from an event.
 */

import { getEventById } from './calendarService';
import { createCampaign } from './email/emailCampaignService';
import { createBlogPost } from './xanoService';
import { generateEventEmailHTML } from '../components/events/EventEmailBlock';
import { formatEventDate } from '../utils/eventUtils';

/**
 * Share an event to email by creating a draft email campaign.  The
 * resulting campaign will include a formatted HTML block with the
 * event details as well as a plain text fallback.  The campaign is
 * saved in Xano and can be edited or scheduled via the email
 * marketing system.
 *
 * @param eventId The ID of the event to convert into an email
 */
export async function shareEventToEmail(eventId: number): Promise<{ success: boolean; campaign?: any; error?: string }> {
  try {
    const event = await getEventById(eventId);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }
    // Build HTML content using the existing generator
    const baseURL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BASE_URL) || '';
    const html_content = generateEventEmailHTML(event, baseURL);
    // Use the event description as plain text fallback if available
    const plain_text_content: string = event.description || '';
    // Subject line includes the event title and start date
    const subject = `${event.title} - ${new Date(event.start_date).toLocaleDateString()}`;
    // Preview text is the first 150 characters of the description
    const preview_text = event.description ? event.description.substring(0, 150) : '';
    // Name the campaign after the event
    const name = `Event: ${event.title}`;
    const result = await createCampaign({ name, subject, preview_text, html_content, plain_text_content });
    return result;
  } catch (err: any) {
    console.error('shareEventToEmail error:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Share an event to the blog by creating a new blog post.  The post
 * will contain the event title, a formatted date/time string,
 * optional location, optional image, the description, and a link
 * inviting readers to RSVP or view more details.  Tags are
 * propagated from the event if present.
 *
 * @param eventId The ID of the event to convert into a blog post
 */
export async function shareEventToBlog(eventId: number): Promise<{ success: boolean; post?: any; error?: string }> {
  try {
    const event = await getEventById(eventId);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }
    const dateInfo = formatEventDate(event.start_date, event.end_date, event.timezone);
    let content = `<h1>${event.title}</h1>`;
    content += `<p><strong>Date:</strong> ${dateInfo}</p>`;
    if (event.location) {
      content += `<p><strong>Location:</strong> ${event.location}</p>`;
    }
    if (event.image_url) {
      content += `<img src="${event.image_url}" alt="${event.title}" style="width:100%;max-width:600px;margin:1rem 0;" />`;
    }
    if (event.description) {
      content += `<p>${event.description}</p>`;
    }
    // Append call to action linking back to the full event page
    const baseURL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_BASE_URL) || '';
    content += `<p><a href="${baseURL}/events/${event.id}" style="color:#2563eb;font-weight:bold;">RSVP / More details</a></p>`;
    const tags = Array.isArray(event.tags) ? event.tags.join(',') : (event.tags || '');
    const postData: any = { title: event.title, content, tags };
    const result = await createBlogPost(postData);
    return result;
  } catch (err: any) {
    console.error('shareEventToBlog error:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}