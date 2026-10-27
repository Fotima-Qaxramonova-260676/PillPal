# Pillmate — Medication Reminder UI Prototype

Pillmate is a responsive, front-end-only website concept for organizing a personal medication reminder list. It is intended as a clickable design prototype that can be shared through GitHub Pages.

## Features

- Responsive dashboard for desktop and mobile
- Add, edit, search, and delete medication entries
- Store a name, dose/amount label, reminder time, and optional personal note
- Daily schedule view
- Mark an item as taken for the current day
- Overview counters and progress indicator
- Settings page with a reset-demo-data action
- Local browser storage so entries remain after refreshing on the same browser/device
- No backend, server, account system, or database required

## Files

- `index.html` — page structure and interface
- `styles.css` — visual styling and responsive layout
- `script.js` — interactive behavior and local storage
- `README.md` — project overview and setup notes

## Run locally

Open `index.html` in a modern browser. For best results, use a simple local server or the Live Server extension in a code editor.

## Publish with GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html`, `styles.css`, `script.js`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose branch `main` and folder `/(root)`, then save.
6. Wait for the deployment to finish and open the published Pages URL.

## Important limitations

This is a front-end prototype only:

- Entries are saved in `localStorage` on the current browser/device. They are not shared with other visitors and do not sync across devices.
- It does not send background notifications, emails, SMS, or push alerts.
- It does not provide accounts, authentication, a backend, or a database.
- A visitor opening the shared URL sees the interface, but each visitor has their own local demo data.
- The Google Fonts stylesheet requires internet access; the site still has fallback fonts if it is unavailable.

## Health and safety note

Pillmate is a UI demonstration, not a medical device or healthcare service. It does not verify prescriptions, suggest medications or doses, or replace instructions from a healthcare professional or medicine packaging. The “Mark taken” control is a demo tracking feature, not confirmation that a dose was medically appropriate.

## Privacy

Avoid entering real sensitive medical information into a public demo. Data stored in local storage is not sent to a server, but anyone with access to the same browser profile may be able to view it. Clearing browser site data may erase these entries.
