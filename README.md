# Accord Tours & Travels — Next.js + Tailwind CSS

This is the Next.js (App Router, latest version) + Tailwind CSS conversion of the
original Vite/React site. All pages are `.jsx` (JavaScript, not TypeScript).

## Structure
- `src/app/layout.js` — root layout, fonts, metadata
- `src/app/page.jsx` — Home page (`/`)
- `src/app/booking/page.jsx` — Booking page (`/booking`)
- `src/lib/constants.js` — shared data (fleet, services, testimonials, FAQs, cabs)
- `src/app/globals.css` — Tailwind + global styles/fonts

## Getting started
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Build
```bash
npm run build
npm run start
```


### KYC retention cleanup
Booking Aadhaar images are stored as a private database buffer (not a public URL) and receive a deletion timestamp 30 days after the trip end date. Configure a daily cron request to `/api/cron/kyc-cleanup?secret=CRON_SECRET` using the existing `CRON_SECRET` environment variable. The endpoint deletes due files and clears their database path.

### Email testing and production switch

For initial testing with Gmail, use a dedicated Gmail account and a Google **App Password** (do not put the normal Gmail password here):

```env
MAIL_PROVIDER=gmail
GMAIL_USER=yourtestingaccount@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
MAIL_FROM="Accord Tours & Travels <yourtestingaccount@gmail.com>"
ADMIN_NOTIFICATION_EMAIL=yourtestingaccount@gmail.com
```

When moving to production, switch the provider and point Nodemailer at the domain mailbox SMTP server:

```env
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.yourmailprovider.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@accordtoursandtravels.com
SMTP_PASSWORD=your-mailbox-password
MAIL_FROM="Accord Tours & Travels <no-reply@accordtoursandtravels.com>"
```

No application-code change is required when switching providers; only the environment variables need to change.
