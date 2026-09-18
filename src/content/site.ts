import site from './site.json';

/**
 * Contact paths. Each stays `null` until the real value exists; unset paths are
 * hidden in production builds and flagged in development, so the site never
 * ships a dead link.
 *
 * - bookingUrl:     a Cal.com or Calendly link
 * - whatsappNumber: international format, digits only (e.g. "8801XXXXXXXXX")
 * - formEndpoint:   a Formspree / Web3Forms form URL
 * - email:          an inbox that's actually read (needs working MX records)
 */
type Contact = {
  bookingUrl: string | null;
  whatsappNumber: string | null;
  whatsappMessage: string;
  formEndpoint: string | null;
  email: string | null;
};

export const SITE = site as { name: string; domain: string; url: string; contact: Contact };

export const IS_DEV = process.env.NODE_ENV !== 'production';

export const contact = {
  booking: SITE.contact.bookingUrl,
  whatsapp: SITE.contact.whatsappNumber
    ? `https://wa.me/${SITE.contact.whatsappNumber}?text=${encodeURIComponent(SITE.contact.whatsappMessage)}`
    : null,
  form: SITE.contact.formEndpoint,
  email: SITE.contact.email,
};

/** Every "Book a call" control resolves somewhere real, even before the booking link exists. */
export const bookingHref = contact.booking ?? '#contact';
