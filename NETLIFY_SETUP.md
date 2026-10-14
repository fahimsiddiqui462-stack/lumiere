# Lumière Netlify backend setup

This version uses Netlify Functions and Netlify Blobs, so the front-end and backend can run on Netlify together.

## Included backend

- `netlify/functions/booking.mjs` validates a request, stores it in Netlify Blobs, optionally emails the salon, and redirects the visitor to WhatsApp.
- `netlify/functions/admin.mjs` handles login, logout, and protected booking retrieval.
- `admin.html` is the booking dashboard.
- `netlify/shared.mjs` contains shared validation, email, and signed-cookie helpers.
- `netlify.toml` maps `/api/booking`, `/api/admin`, and `/admin` to the correct Netlify routes.

## Netlify environment variables

Set these in Netlify under Site configuration → Environment variables:

- `ADMIN_PASSWORD` — strong password for `/admin`
- `ADMIN_SECRET` — long random secret used to sign admin cookies
- `SALON_NAME` — optional; defaults to Lumière Beauty Studio
- `SALON_EMAIL` — optional; defaults to hello@lumiere.pk
- `WHATSAPP_NUMBER` — optional; digits only, defaults to 923000000000
- `RESEND_API_KEY` — optional; required for email notifications
- `RESEND_FROM_EMAIL` — optional; required for email notifications, and must be a verified Resend sender

If the Resend variables are omitted, bookings still save to Netlify Blobs and WhatsApp still opens, but no email will be sent.

## Deploy

1. Push the complete project folder to GitHub.
2. Create a new Netlify site from that repository.
3. Keep the publish directory as `.` and functions directory as `netlify/functions`.
4. Add the environment variables above.
5. Deploy the site.
6. Open `/admin` and sign in with the `ADMIN_PASSWORD` value.
7. Submit a test booking and verify it appears in the admin dashboard.

Netlify Blobs is persistent storage managed by Netlify. It replaces the old PHP CSV storage, so do not upload or use `booking.php` or `admin.php` with this version.
