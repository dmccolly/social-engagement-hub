// ICS (iCalendar) File Generator
// Generates .ics files for "Add to Calendar" functionality

export function generateICS(event) {
  const formatDate = (date) => {
    // Convert to YYYYMMDDTHHMMSSZ format
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text) => {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const location = event.location_type === 'virtual' 
    ? event.virtual_link || 'Virtual Event'
    : event.location || 'TBA';

  const description = event.description 
    ? escapeText(event.description)
    : 'Event details available at registration.';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Social Engagement Hub//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:event-${event.id}@social-engagement-hub.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.start_date)}`,
    `DTEND:${formatDate(event.end_date)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${escapeText(location)}`,
    `ORGANIZER;CN=${escapeText(event.organizer_name)}:mailto:${event.organizer_email}`,
    `STATUS:CONFIRMED`,
    `SEQUENCE:0`,
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Event reminder - starts in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

export function downloadICS(event) {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function getAddToCalendarLinks(event) {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  
  const formatGoogleDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const title = encodeURIComponent(event.title);
  const description = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(
    event.location_type === 'virtual' 
      ? event.virtual_link || 'Virtual Event'
      : event.location || ''
  );

  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}&details=${description}&location=${location}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${description}&location=${location}`,
    office365: `https://outlook.office.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${description}&location=${location}`,
    yahoo: `https://calendar.yahoo.com/?v=60&title=${title}&st=${formatGoogleDate(startDate)}&et=${formatGoogleDate(endDate)}&desc=${description}&in_loc=${location}`
  };
}

