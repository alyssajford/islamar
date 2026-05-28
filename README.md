# Villa Islamar — Owner's Guide

Everything you need to manage, update, and deploy your website.

---

## Files Overview

```
islamar/
├── index.html              ← Home page (hero + featured photos)
├── gallery.html            ← Full photo gallery (all 26 images)
├── rates.html              ← Nightly rates + booking form
├── location.html           ← Map, nearby beaches, directions
├── about.html              ← Villa details + amenities
├── css/style.css           ← all colors, fonts, layout
├── js/
│   ├── main.js             ← sidebar navigation & animations
│   └── calendar.js         ← booking calendar & form
├── data/
│   └── availability.js     ← ✏️ YOU EDIT THIS to block booked dates
├── pics/                   ← all property photos (named descriptively)
├── netlify.toml            ← Netlify hosting config
└── README.md               ← this guide
```

**Navigation:** Fixed left sidebar on all pages. Each page has the full booking form at the bottom.

---

## 1. Blocking Dates After a Booking

When a guest books, add their dates to `data/availability.js` so the calendar grays them out.

**On GitHub (easiest — no install required):**
1. Go to [github.com](https://github.com) → your repository
2. Click `data` → click `availability.js`
3. Click the ✏️ **pencil (Edit) icon** in the top right
4. Add the dates inside the `[ ]` brackets:

```javascript
const AVAILABILITY_BLOCKED_DATES = [
  { from: "2026-07-01", to: "2026-07-07" },    // July 1–7 booking
  { from: "2026-12-20", to: "2027-01-03" },    // Christmas/New Year
  "2027-03-15",                                // single blocked day
];
```

5. Click **"Commit changes"** → the site updates automatically in ~30 seconds.

---

## 2. Setting Up the Booking Email (One-Time)

Right now the form works in "demo mode" — it shows success but doesn't actually send an email. Here's how to activate real email sending.

**Steps (takes ~10 minutes, completely free):**

1. Go to [emailjs.com](https://www.emailjs.com) → **Sign Up Free**
2. Click **"Email Services"** → **"Add New Service"** → choose **Yahoo Mail**
3. Connect `laurieford10@yahoo.com` → click **Save**
4. Click **"Email Templates"** → **"Create New Template"**
5. Set the **Subject** to: `New Booking Request — Villa Islamar`
6. Paste this in the **Message** body:
   ```
   New Booking Request — Villa Islamar
   ─────────────────────────────────────
   Name:       {{from_name}}
   Email:      {{from_email}}
   Phone:      {{phone}}
   Guests:     {{guests}}
   Check-in:   {{checkin}}
   Check-out:  {{checkout}}
   
   Message:
   {{message}}
   ```
7. Set **"To Email"** to: `laurieford10@yahoo.com` → **Save**
8. Go to **"Account"** → **"API Keys"** → copy your **Public Key**
9. Note your **Service ID** (shown beside your email service)
10. Note your **Template ID** (shown beside your template)
11. In GitHub, open `js/calendar.js` and replace the three placeholder values:
    ```javascript
    const EMAILJS_PUBLIC_KEY  = 'abc123xyz';      // ← your Public Key
    const EMAILJS_SERVICE_ID  = 'service_xxxxx';  // ← your Service ID
    const EMAILJS_TEMPLATE_ID = 'template_xxxxx'; // ← your Template ID
    ```
12. **Commit changes** — done! The form now sends real emails.

> **Free tier**: 200 emails/month — more than enough for a vacation rental.

---

## 3. Deploying to Netlify & Connecting Your Domain

### Step 1 — Push code to GitHub
1. Create a free account at [github.com](https://github.com)
2. Click **"New repository"** → name it `villa-islamar` → click **"Create repository"**
3. On the next screen, click **"uploading an existing file"**
4. Drag and drop all files from your `islamar/` folder → click **"Commit changes"**

### Step 2 — Deploy on Netlify
1. Go to [netlify.com](https://netlify.com) → create a free account
2. Click **"Add new site"** → **"Import an existing project"** → choose **GitHub**
3. Select your `villa-islamar` repository
4. Leave all build settings blank (no build command needed — it's pure HTML)
5. Click **"Deploy site"** — live in ~60 seconds at a random `.netlify.app` URL

### Step 3 — Connect villaislamar.com
1. In Netlify: **Site overview** → **"Domain settings"** → **"Add a domain"**
2. Type `villaislamar.com` → click **Verify** → **Add domain**
3. Netlify shows you the DNS records to add

### Step 4 — Update DNS at Your Domain Registrar
Log into wherever you bought `villaislamar.com` (GoDaddy, Namecheap, Google Domains, etc.):

| Type  | Name | Value                            |
|-------|------|----------------------------------|
| A     | @    | `75.2.60.5`                      |
| CNAME | www  | `your-site-name.netlify.app`     |

> Replace `your-site-name` with the actual subdomain Netlify assigned you.

4. Save the records. DNS changes take **1–48 hours** to fully propagate worldwide.
5. Netlify automatically provides **free HTTPS / SSL** once DNS is set up.

---

## 4. Making Future Edits

| What to change | Where |
|----------------|-------|
| Home page text / hero    | `index.html` |
| Villa description        | `about.html` — edit text in the About section |
| Amenities cards          | `about.html` — edit the Highlights section |
| Colors / fonts           | `css/style.css` — change the values in `:root { }` at the top |
| Nightly rates            | `rates.html` — search for `$200`, `$275`, `$350` |
| Add / remove photos      | `gallery.html` — add/remove gallery item `<a>` blocks |
| Block booked dates       | `data/availability.js` |
| Email recipients         | `js/calendar.js` — update `to_email` inside `params` |
| Location / map           | `location.html` — edit the Google Maps embed or beach list |

---

## 5. Booking Workflow Summary

```
Guest visits site
    ↓
Selects available dates on calendar
    ↓
Fills out name / email / guests / message
    ↓
Clicks "Send Booking Request"
    ↓
Email arrives at laurieford10@yahoo.com
    ↓
You reply to confirm & arrange payment
    ↓
Add their dates to data/availability.js on GitHub
    ↓
Calendar automatically updates (~30 sec)
```

---

## Questions?
Contact Alyssa for any technical help! 🌺
