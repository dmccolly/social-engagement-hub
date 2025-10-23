// Event Utilities - Date formatting, timezone handling, and helper functions

export function formatEventDate(startDate, endDate, timezone = 'America/Denver') {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone
  };

  const sameDay = start.toDateString() === end.toDateString();
  
  if (sameDay) {
    const startStr = start.toLocaleString('en-US', options);
    const endTime = end.toLocaleString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      timeZone: timezone 
    });
    return `${startStr} - ${endTime}`;
  } else {
    const startStr = start.toLocaleString('en-US', options);
    const endStr = end.toLocaleString('en-US', options);
    return `${startStr} to ${endStr}`;
  }
}

export function formatShortDate(date, timezone = 'America/Denver') {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone
  });
}

export function getEventStatus(event) {
  const now = new Date();
  const start = new Date(event.start_date);
  const end = new Date(event.end_date);

  if (event.status === 'cancelled') return 'cancelled';
  if (now > end) return 'past';
  if (now >= start && now <= end) return 'ongoing';
  if (now < start) return 'upcoming';
  return 'unknown';
}

export function isEventFull(event, rsvpCount) {
  if (!event.max_attendees) return false;
  return rsvpCount >= event.max_attendees;
}

export function canRSVP(event, rsvpCount) {
  // Check if event allows RSVP
  if (!event.rsvp_enabled) return { can: false, reason: 'RSVP is not enabled for this event' };
  
  // Check if event is published
  if (event.status !== 'published') return { can: false, reason: 'Event is not published yet' };
  
  // Check if event is full
  if (isEventFull(event, rsvpCount)) return { can: false, reason: 'Event is full' };
  
  // Check if RSVP deadline has passed
  if (event.rsvp_deadline) {
    const deadline = new Date(event.rsvp_deadline);
    if (new Date() > deadline) return { can: false, reason: 'RSVP deadline has passed' };
  }
  
  // Check if event has already started
  const start = new Date(event.start_date);
  if (new Date() > start) return { can: false, reason: 'Event has already started' };
  
  return { can: true };
}

export function getTimeUntilEvent(startDate) {
  const now = new Date();
  const start = new Date(startDate);
  const diff = start - now;
  
  if (diff < 0) return 'Event has started';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} away`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} away`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} away`;
  return 'Starting soon';
}

export function getEventDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'Less than a minute';
}

export function getCategoryColor(category) {
  const colors = {
    conference: 'bg-purple-100 text-purple-700',
    webinar: 'bg-blue-100 text-blue-700',
    meetup: 'bg-green-100 text-green-700',
    workshop: 'bg-yellow-100 text-yellow-700',
    social: 'bg-pink-100 text-pink-700',
    training: 'bg-indigo-100 text-indigo-700',
    other: 'bg-gray-100 text-gray-700'
  };
  return colors[category] || colors.other;
}

export function getStatusColor(status) {
  const colors = {
    draft: 'bg-gray-100 text-gray-700',
    published: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    past: 'bg-gray-100 text-gray-500',
    ongoing: 'bg-blue-100 text-blue-700',
    upcoming: 'bg-green-100 text-green-700'
  };
  return colors[status] || colors.draft;
}

export function getResponseColor(response) {
  const colors = {
    yes: 'bg-green-100 text-green-700',
    no: 'bg-red-100 text-red-700',
    maybe: 'bg-yellow-100 text-yellow-700'
  };
  return colors[response] || colors.maybe;
}

export function calculateAttendanceRate(yesCount, checkedInCount) {
  if (yesCount === 0) return 0;
  return Math.round((checkedInCount / yesCount) * 100);
}

export function exportRSVPsToCSV(rsvps, eventTitle) {
  const headers = ['Name', 'Email', 'Response', 'Guests', 'RSVP Date', 'Checked In', 'Notes'];
  const rows = rsvps.map(rsvp => [
    rsvp.name,
    rsvp.email,
    rsvp.response,
    rsvp.guests_count || 0,
    new Date(rsvp.rsvp_date).toLocaleString(),
    rsvp.checked_in ? 'Yes' : 'No',
    rsvp.notes || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${eventTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-rsvps.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

