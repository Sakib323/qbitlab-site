/**
 * The outreach survey at /survey/. It is sent to businesses to find the work
 * worth automating, so every question earns its place: what they do, what eats
 * the week, where that work happens, and what they'd hand over first.
 *
 * Answers land wherever `contact.surveyEndpoint` points (see README).
 */

export const survey = {
  title: 'Where does your week go?',
  intro:
    'We build AI that takes repetitive work off small businesses. To do that well, we need to hear what that work actually looks like in yours.',
  time: 'About three minutes. Every answer is read by a person.',
};

export const teamSizes = ['Just me', '2–10 people', '11–50 people', 'More than 50'];

export const weeklyHours = [
  'Under 2 hours',
  '2–5 hours',
  '5–10 hours',
  'More than 10 hours',
  'Hard to say',
];

export const places = [
  'Phone calls',
  'WhatsApp or DMs',
  'Email',
  'Spreadsheets',
  'Paper or PDFs',
  'Bookings and calendar',
  'Quotes and invoices',
  'Orders or stock',
  'Social media',
  'Reports',
  'Somewhere else',
];

export const callAnswers = ['Yes, happy to', 'Maybe later', 'No thanks'];
