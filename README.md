# School Madrasa Balkh (SMB) — Donation Website

This package is the **frontend prototype / launch-ready static shell** for the SMB fundraising website.

## What is already included

- Responsive modern design for phone, tablet and desktop
- School Madrasa Balkh (SMB) branding
- Project goal: **$780,000**
- Raised / remaining / donor count dashboard
- Progress bar
- Donation form UI
- Country, currency, name, email and anonymous donation fields
- Email-confirmation wording
- Transparency / expense-report section
- Construction updates section
- Documents section
- Instagram placeholder
- 18-language selector
- Demo-only donation simulation using browser localStorage

## Important

This version **does not process real money**. Do not publish real bank/card details in these files.

A real donation system needs:
1. An adult/authorized representative to complete the organization's registration and payment-provider verification.
2. A bank account belonging to the legally authorized recipient.
3. A payment provider that supports the recipient's country and the desired donor countries/payment methods.
4. A secure backend/database for donor records and donation history.
5. Server-side payment verification and webhook handling.
6. Email delivery for donation receipts.
7. Privacy Policy, Terms/Donation Policy and the final legal documents.

## GitHub Pages

GitHub Pages can host the static frontend directly from a GitHub repository. The entry file is `index.html`.

Basic flow:
1. Create a GitHub account.
2. Create a new repository, e.g. `smb-donation-site`.
3. Upload `index.html`, `styles.css` and `script.js`.
4. Open **Settings → Pages**.
5. Choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
6. Save and wait for deployment.
7. GitHub will show the published site link.

For the final real-money version, keep donor data and secret payment keys out of GitHub. The public site can stay on GitHub Pages while the secure backend/payment service runs separately.

## Data placeholders to replace

- Official charity legal name
- Registration number
- Official responsible person
- Official phone/email/address
- Verified bank/payment information
- Instagram/Facebook links
- Project photos/video
- Architectural plan
- Legal documents
- Initial raised amount
- Monthly reports

## Suggested final architecture

Frontend: GitHub Pages
Backend/API: secure server or managed backend
Database: secure hosted database
Payments: provider chosen after the recipient organization's country/account eligibility is confirmed
Email: transactional email provider
Storage: private/controlled storage for documents and photos

Never put API secret keys, bank login credentials, donor database exports or private documents in a public GitHub repository.
