// Runs before `next build`. A production site with no way to get in touch is a
// dead end: every "Book a call" button would point at an empty contact section.
// The build refuses to continue until at least one contact path is configured.
import { readFileSync } from 'node:fs';

const { contact } = JSON.parse(readFileSync(new URL('../src/content/site.json', import.meta.url), 'utf8'));
const KEYS = ['bookingUrl', 'whatsappNumber', 'formEndpoint', 'email'];
const configured = KEYS.filter((key) => contact[key]);
const missing = KEYS.filter((key) => !contact[key]);

if (missing.length) {
  console.warn(`site.json: not configured yet (hidden in production): ${missing.join(', ')}`);
}

// /survey/ ships either way; without an endpoint its answers have nowhere to land.
if (!contact.surveyEndpoint) {
  console.warn('site.json: contact.surveyEndpoint is unset — /survey/ cannot save answers yet.');
}

if (configured.length === 0) {
  if (process.env.ALLOW_NO_CONTACT === '1') {
    console.warn('site.json: no contact path configured. Building anyway because ALLOW_NO_CONTACT=1 — do not deploy this build.');
  } else {
    console.error(
      'site.json: no contact path is configured, so the built site would have no way to reach you.\n' +
        'Set at least one of contact.bookingUrl, contact.whatsappNumber, or contact.formEndpoint in src/content/site.json.\n' +
        'For a local preview build only, run: ALLOW_NO_CONTACT=1 npm run build',
    );
    process.exit(1);
  }
}
