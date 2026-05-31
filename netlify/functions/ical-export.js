// =============================================================
//  VILLA ISLAMAR — ical-export Netlify Function
//  Serves your direct bookings (from availability.js) as an iCal
//  feed that Airbnb/VRBO can import to stay in sync.
//
//  SETUP:
//  1. Deploy to Netlify (auto-deploys from GitHub push)
//  2. Your iCal export URL will be:
//     https://YOUR-SITE.netlify.app/.netlify/functions/ical-export
//  3. In Airbnb: Calendar → Availability → Sync calendars →
//     "Import a new calendar" → paste the URL above
//  4. Airbnb will poll this URL every few hours to check for new bookings
//
//  When you add dates to data/availability.js and push to GitHub,
//  this feed automatically updates, and Airbnb will pick up the
//  blocked dates on its next sync (usually within 1-3 hours).
// =============================================================

// Import the blocked dates from availability.js
// Since this is a serverless function, we read the file directly
const fs   = require('fs');
const path = require('path');

function getBlockedDates() {
  try {
    // Read the availability.js file (included via netlify.toml included_files)
    // Try multiple paths: included_files puts it relative to process.cwd()
    const candidates = [
      path.join(__dirname, 'data', 'availability.js'),
      path.join(process.cwd(), 'data', 'availability.js'),
      path.join(__dirname, '..', '..', 'data', 'availability.js'),
    ];
    const filePath = candidates.find(p => fs.existsSync(p));
    if (!filePath) {
      console.error('availability.js not found in:', candidates);
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract the array from the JS file
    // The file defines: const AVAILABILITY_BLOCKED_DATES = [...]
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) return [];

    // Safely parse the array (it contains objects and strings)
    // Use Function constructor to evaluate the array literal
    const dates = new Function(`return ${match[0]}`)();
    return Array.isArray(dates) ? dates : [];
  } catch (err) {
    console.error('Error reading availability.js:', err.message);
    return [];
  }
}

function formatDate(dateStr) {
  // Convert "2026-07-01" to "20260701"
  return dateStr.replace(/-/g, '');
}

function generateIcal(blockedDates) {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Villa Islamar//Direct Bookings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Villa Islamar Direct Bookings',
  ];

  blockedDates.forEach((entry, index) => {
    let startDate, endDate, summary;

    if (typeof entry === 'string') {
      // Single date: "2026-12-24"
      startDate = entry;
      // End date is next day (iCal DTEND is exclusive)
      const d = new Date(entry + 'T12:00:00');
      d.setDate(d.getDate() + 1);
      endDate = d.toISOString().slice(0, 10);
      summary = 'Blocked - Direct Booking';
    } else if (entry && entry.from && entry.to) {
      // Date range: { from: "2026-07-01", to: "2026-07-07" }
      startDate = entry.from;
      endDate = entry.to;
      summary = 'Blocked - Direct Booking';
    } else {
      return; // Skip invalid entries
    }

    ical.push('BEGIN:VEVENT');
    ical.push(`DTSTART;VALUE=DATE:${formatDate(startDate)}`);
    ical.push(`DTEND;VALUE=DATE:${formatDate(endDate)}`);
    ical.push(`DTSTAMP:${timestamp}`);
    ical.push(`UID:direct-booking-${index}-${formatDate(startDate)}@villaislamar.com`);
    ical.push(`SUMMARY:${summary}`);
    ical.push('STATUS:CONFIRMED');
    ical.push('TRANSP:OPAQUE');
    ical.push('END:VEVENT');
  });

  ical.push('END:VCALENDAR');
  return ical.join('\r\n');
}

exports.handler = async () => {
  const blockedDates = getBlockedDates();
  const icalContent  = generateIcal(blockedDates);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="villa-islamar.ics"',
      'Cache-Control': 'no-cache, max-age=0',
    },
    body: icalContent,
  };
};
