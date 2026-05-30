// =============================================================
//  VILLA ISLAMAR — calendar.js
//  Handles: Flatpickr inline calendar, booking form, EmailJS
// =============================================================

// -------------------------------------------------------------
//  EMAILJS SETUP  (one-time, takes ~10 minutes)
//
//  1. Go to https://www.emailjs.com — create a free account
//  2. "Email Services" → "Add New Service" → choose Yahoo Mail
//     → connect laurieford10@yahoo.com → Save
//  3. "Email Templates" → "Create New Template"
//     Paste this as the template body:
//
//       New Booking Request — Villa Islamar
//       ─────────────────────────────────────
//       Name:      {{from_name}}
//       Email:     {{from_email}}
//       Phone:     {{phone}}
//       Guests:    {{guests}}
//       Check-in:  {{checkin}}
//       Check-out: {{checkout}}
//       Message:   {{message}}
//
//     Set "To Email" field to: laurieford10@yahoo.com
//     Save the template.
//
//  4. "Account" → "API Keys" → copy your Public Key
//  5. Replace the three placeholder strings below:
// -------------------------------------------------------------

const EMAILJS_PUBLIC_KEY  = 'YzVU1EgdxMKgtfHs0';
const EMAILJS_SERVICE_ID  = 'service_6bnzm2o';
const EMAILJS_TEMPLATE_ID = 'template_efrhm5e';

// -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

  // Initialize EmailJS (skipped in demo mode)
  const emailJsReady = EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';
  if (emailJsReady) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // ----------------------------------------------------------
  // Blocked dates — tries live iCal sync first, falls back to
  // the manual availability.js list if the function is unavailable.
  // ----------------------------------------------------------
  async function getBlockedDates() {
    try {
      const res = await fetch('/.netlify/functions/ical-sync');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.blocked) && json.blocked.length) {
          return json.blocked;
        }
      }
    } catch (_) { /* network unavailable or running locally */ }
    return (typeof AVAILABILITY_BLOCKED_DATES !== 'undefined')
      ? AVAILABILITY_BLOCKED_DATES
      : [];
  }

  // ----------------------------------------------------------
  // Flatpickr — inline calendar (initialized after fetching dates)
  // ----------------------------------------------------------
  getBlockedDates().then(blockedDates => {
    flatpickr('#calendar-inline', {
      inline:      true,
      mode:        'range',
      dateFormat:  'Y-m-d',
      minDate:     'today',
      disable:     blockedDates,
      showMonths:  window.innerWidth >= 640 ? 2 : 1,
      onChange(selectedDates) {
        const fmt = d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        document.getElementById('checkin').value  = selectedDates[0] ? fmt(selectedDates[0]) : '';
        document.getElementById('checkout').value = selectedDates[1] ? fmt(selectedDates[1]) : '';
      },
    });
  });

  // ----------------------------------------------------------
  // Booking form submission
  // ----------------------------------------------------------
  const form      = document.getElementById('bookingForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText   = submitBtn.querySelector('.btn-text');
  const btnLoad   = submitBtn.querySelector('.btn-loading');
  const successEl = document.getElementById('formSuccess');
  const errorEl   = document.getElementById('formError');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorEl.hidden = true;

    const name     = document.getElementById('guestName').value.trim();
    const email    = document.getElementById('guestEmail').value.trim();
    const guests   = document.getElementById('guests').value;
    const checkin  = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const phone    = document.getElementById('guestPhone').value.trim();
    const message  = document.getElementById('message').value.trim();

    // Honeypot check — bots fill this hidden field, humans don't
    const honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    if (!checkin || !checkout) {
      alert('Please select your check-in and check-out dates on the calendar above.');
      return;
    }
    if (!name || !email || !guests) {
      alert('Please fill in all required fields (Full Name, Email, and Number of Guests).');
      return;
    }
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Loading state
    btnText.hidden = true;
    btnLoad.hidden = false;
    submitBtn.disabled = true;

    const params = {
      from_name:  sanitize(name),
      from_email: sanitize(email),
      phone:      sanitize(phone) || 'Not provided',
      guests:     sanitize(guests),
      checkin:    sanitize(checkin),
      checkout:   sanitize(checkout),
      message:    sanitize(message) || 'No additional message',
    };

    try {
      if (emailJsReady) {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
      } else {
        // Demo mode — simulate network delay (EmailJS not yet configured)
        await new Promise(r => setTimeout(r, 1200));
        console.log('[Villa Islamar] Demo mode — booking request data:', params);
        console.log('[Villa Islamar] Configure EmailJS keys in js/calendar.js to enable real email sending.');
      }
      form.hidden = true;
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      console.error('EmailJS send error:', err);
      errorEl.hidden = false;
      btnText.hidden = false;
      btnLoad.hidden = true;
      submitBtn.disabled = false;
    }
  });

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Basic sanitization — strip HTML tags to prevent injection in email body
  function sanitize(str) {
    return String(str).replace(/<[^>]*>/g, '').trim();
  }

});
