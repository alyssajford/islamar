// =============================================================
//  VILLA ISLAMAR — ical-sync Netlify Function
//  Fetches Airbnb + VRBO iCal feeds and returns blocked dates
//  so the booking calendar stays in sync automatically.
//
//  SETUP (one-time, ~2 minutes):
//  1. Get your iCal URLs:
//     • Airbnb:  Listing → Availability → Sync calendars → Export Calendar
//     • VRBO:    Calendar → Import/Export → Export Calendar
//  2. In Netlify dashboard → Site settings → Environment variables, add:
//     • AIRBNB_ICAL_URL  =  https://www.airbnb.com/calendar/ical/XXXXX.ics?s=...
//     • VRBO_ICAL_URL    =  https://www.vrbo.com/icalendar/XXXXX.ics?...
//  3. Re-deploy (or just save — Netlify auto-deploys from GitHub).
//
//  The calendar on book.html will then auto-block any dates booked
//  on Airbnb or VRBO within seconds of a reservation.
// =============================================================

const https = require('https');
const http  = require('http');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    // Only allow URLs with https/http schemes (prevent SSRF)
    if (!/^https?:\/\//i.test(url)) {
      return reject(new Error('Invalid URL scheme'));
    }
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, { timeout: 8000 }, res => {
      // Only accept iCal content types
      const ct = (res.headers['content-type'] || '').toLowerCase();
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject).on('timeout', () => reject(new Error('Request timed out')));
  });
}

function parseIcal(text) {
  const blocked = [];
  const events  = text.split('BEGIN:VEVENT').slice(1);
  for (const ev of events) {
    // Handle both date-only (DTSTART;VALUE=DATE:20261224) and datetime formats
    const startMatch = ev.match(/DTSTART(?:[^:]*)?:(\d{8})/);
    const endMatch   = ev.match(/DTEND(?:[^:]*)?:(\d{8})/);
    if (!startMatch || !endMatch) continue;
    const fmt = s => `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
    blocked.push({ from: fmt(startMatch[1]), to: fmt(endMatch[1]) });
  }
  return blocked;
}

exports.handler = async () => {
  const urls = [
    process.env.AIRBNB_ICAL_URL,
    process.env.VRBO_ICAL_URL,
  ].filter(u => u && u.trim());

  if (urls.length === 0) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked: [], note: 'No iCal URLs configured' }),
    };
  }

  try {
    const feeds   = await Promise.allSettled(urls.map(fetchUrl));
    const blocked = feeds
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => parseIcal(r.value));

    return {
      statusCode: 200,
      headers: {
        'Content-Type':  'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
      body: JSON.stringify({ blocked }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch calendar feeds' }),
    };
  }
};
