# PillPal — Medicine Reminder Front-End

PillPal is a responsive, clickable front-end prototype for a medicine reminder and wellbeing app. It follows the supplied Medipian screen reference while using the requested product name **PillPal**.

## Files

- `index.html` — page structure and app screens
- `styles.css` — responsive styling, themes and dark mode
- `script.js` — navigation and interactive demo behavior
- `README.md` — project notes and publishing instructions

## Run locally

1. Download all four files into the same folder.
2. Open `index.html` in a modern browser.
3. For the best experience, use a local development server (for example, VS Code Live Server).

No build step, framework, or package installation is required.

## Included screens and interactions

- Home dashboard with today's medicines, dose status and weekly progress
- Add, edit, delete, search, filter and reschedule medicine entries
- Medicine information cards with a safety note
- Calendar month navigation and selected-day list
- Programs with My / Family tabs
- Statistics, mood check-ins and event timeline
- Family integration demo, invite code, connection list and sharing permissions
- Notifications sample screen
- Personal profile and avatar changes
- Settings for dark mode, accent theme, font size, reminder sound preview, vibration toggle, volume and language selection
- Premium plan selector and demo trial
- Responsive sidebar and mobile layout
- Local browser persistence using `localStorage`

## GitHub Pages

1. Create or open your GitHub repository.
2. Upload `index.html`, `styles.css`, `script.js`, and `README.md` into the **repository root** (not inside another folder).
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**, choose branch `main` and folder `/(root)`, then save.
5. Wait for GitHub Pages to finish deploying. The Pages screen will show the published URL.

## Important prototype limitations

This is a front-end demonstration only. It has **no backend** and does not connect to user accounts, a verified medicine database, a camera/barcode scanner, scheduled/push notifications, SMS/email, real family accounts, healthcare providers, payments, subscriptions, or cloud sync. Family links and notifications are illustrative only. Some content (including sample adherence values and sample medicine notes) is demo data.

Medicine information must be checked against a reliable medical source before production use. The app must clearly state that it does not replace advice from a qualified healthcare professional. Do not use a prototype to make treatment decisions or change a prescribed dose.

## Privacy

Demo data is stored in the current browser via `localStorage`. It is not sent to a server by this code. Do not enter real sensitive medical information into a public demo. Use the **Clear data** option in Settings to reset the demo.

## Branding

Product name: **PillPal**  
Visual direction: soft blue and white, rounded cards, warm yellow accents, spacious layout, friendly illustrations.
