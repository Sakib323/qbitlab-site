'use client';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { checkField, checkRequired, clearField, type Messages } from '@/lib/form';
import { callAnswers, places, teamSizes, weeklyHours } from '@/content/survey';

type Status = { tone: 'idle' | 'sending' | 'error'; message: string };

const messages: Messages = {
  trade: () => 'Tell us what the business does, even roughly.',
  timeSink: () => 'This is the one we most need — a sentence is plenty.',
  handOver: () => 'Tell us the job you’d hand over first.',
  name: () => 'Enter your name so we know who we’re talking to.',
  email: (f) =>
    f.validity.valueMissing
      ? 'Enter your email so we can come back to you.'
      : 'Enter an email address like name@business.com.',
  consent: () => 'We need your say-so before we get in touch.',
};

/**
 * The survey, posted as JSON to whatever `contact.surveyEndpoint` points at.
 *
 * It sends `Content-Type: text/plain`, which keeps the request "simple" in the
 * CORS sense: a Google Apps Script endpoint never answers the preflight that
 * `application/json` would trigger, so the browser would block it outright.
 * Without JavaScript the form still posts natively to the same endpoint.
 */
export function SurveyForm({ endpoint, email }: { endpoint: string | null; email: string | null }) {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>({ tone: 'idle', message: '' });
  const [sent, setSent] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const el = form.current!;

    if (!checkRequired(el, messages)) {
      setStatus({ tone: 'error', message: 'A few answers are missing. Check the highlighted questions.' });
      return;
    }

    const data = new FormData(el);
    const text = (name: string) => String(data.get(name) ?? '').trim();
    const payload = {
      submittedAt: new Date().toISOString(),
      // Tag a link per recipient — /survey/?ref=their-business — to see who answered.
      ref: new URLSearchParams(window.location.search).get('ref') ?? '',
      business: text('business'),
      trade: text('trade'),
      teamSize: text('teamSize'),
      website: text('website'),
      timeSink: text('timeSink'),
      hours: text('hours'),
      places: data.getAll('places').join(', '),
      tools: text('tools'),
      handOver: text('handOver'),
      blocker: text('blocker'),
      tried: text('tried'),
      name: text('name'),
      email: text('email'),
      whatsapp: text('whatsapp'),
      call: text('call'),
    };

    if (!endpoint) {
      setStatus({
        tone: 'error',
        message: 'This survey isn’t connected to anywhere yet. Set contact.surveyEndpoint in site.json.',
      });
      return;
    }

    setStatus({ tone: 'sending', message: 'Sending your answers…' });
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(String(response.status));
      setSent(true);
    } catch {
      setStatus({
        tone: 'error',
        message: email
          ? `That didn’t send. Try again, or email your answers to ${email} and we’ll pick them up.`
          : 'That didn’t send. Check your connection and try again.',
      });
    }
  };

  if (sent) {
    return (
      <div className="survey__done" role="status">
        <h2 className="survey__done-title">Thank you — that’s exactly what we needed.</h2>
        <p className="survey__done-text">
          We read every answer. If there’s something here we can take off your hands, we’ll come back to you
          with what we’d build and how it would work.
        </p>
        <Link className="more" href="/">
          See what we build
        </Link>
      </div>
    );
  }

  const sending = status.tone === 'sending';
  const field = {
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => checkField(e.currentTarget, messages),
    onInput: (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => clearField(e.currentTarget, messages),
  };

  return (
    <form
      ref={form}
      className="form survey__form"
      action={endpoint ?? undefined}
      method="POST"
      noValidate
      onSubmit={onSubmit}
    >
      <fieldset className="survey__section">
        <legend className="survey__legend">Your business</legend>

        <div className="form__row">
          <div className="field">
            <label htmlFor="sv-business">
              Business name <span className="field__hint">(optional)</span>
            </label>
            <input id="sv-business" name="business" className="input" autoComplete="organization" />
          </div>
          <div className="field">
            <label htmlFor="sv-trade">What does it do?</label>
            <input
              id="sv-trade"
              name="trade"
              className="input"
              placeholder="Florist, dental clinic, builder…"
              required
              aria-describedby="sv-trade-error"
              {...field}
            />
            <p id="sv-trade-error" className="field__error" />
          </div>
        </div>

        <fieldset className="choices">
          <legend>
            How many people work there? <span className="field__hint">(optional)</span>
          </legend>
          {teamSizes.map((size) => (
            <label key={size} className="choice">
              <input type="radio" name="teamSize" value={size} />
              <span>{size}</span>
            </label>
          ))}
        </fieldset>

        <div className="field">
          <label htmlFor="sv-website">
            Website <span className="field__hint">(optional)</span>
          </label>
          <input id="sv-website" name="website" type="url" className="input" placeholder="https://" />
        </div>
      </fieldset>

      <fieldset className="survey__section">
        <legend className="survey__legend">Your week</legend>

        <div className="field">
          <label htmlFor="sv-timesink">What takes up the most time in your week?</label>
          <textarea
            id="sv-timesink"
            name="timeSink"
            className="input"
            required
            aria-describedby="sv-timesink-hint sv-timesink-error"
            {...field}
          />
          <p id="sv-timesink-hint" className="field__hint">
            The repetitive one — the job you do again and again. Say it however you’d say it out loud.
          </p>
          <p id="sv-timesink-error" className="field__error" />
        </div>

        <fieldset className="choices">
          <legend>
            Roughly how long does that take each week? <span className="field__hint">(optional)</span>
          </legend>
          {weeklyHours.map((hours) => (
            <label key={hours} className="choice">
              <input type="radio" name="hours" value={hours} />
              <span>{hours}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="choices">
          <legend>
            Where does that work happen? <span className="field__hint">(tick any)</span>
          </legend>
          {places.map((place) => (
            <label key={place} className="choice">
              <input type="checkbox" name="places" value={place} />
              <span>{place}</span>
            </label>
          ))}
        </fieldset>

        <div className="field">
          <label htmlFor="sv-tools">
            Which tools do you use day to day? <span className="field__hint">(optional)</span>
          </label>
          <input
            id="sv-tools"
            name="tools"
            className="input"
            placeholder="WhatsApp, Excel, QuickBooks, Shopify…"
          />
        </div>
      </fieldset>

      <fieldset className="survey__section">
        <legend className="survey__legend">What would help</legend>

        <div className="field">
          <label htmlFor="sv-handover">If you could hand one job to an assistant tomorrow, what would it be?</label>
          <textarea
            id="sv-handover"
            name="handOver"
            className="input"
            required
            aria-describedby="sv-handover-error"
            {...field}
          />
          <p id="sv-handover-error" className="field__error" />
        </div>

        <div className="field">
          <label htmlFor="sv-blocker">
            What’s holding the business back from growing right now?{' '}
            <span className="field__hint">(optional)</span>
          </label>
          <textarea id="sv-blocker" name="blocker" className="input" />
        </div>

        <div className="field">
          <label htmlFor="sv-tried">
            Tried anything already? <span className="field__hint">(optional)</span>
          </label>
          <input
            id="sv-tried"
            name="tried"
            className="input"
            placeholder="Software you bought, someone you hired, a system that didn’t stick…"
          />
        </div>
      </fieldset>

      <fieldset className="survey__section">
        <legend className="survey__legend">Getting back to you</legend>

        <div className="form__row">
          <div className="field">
            <label htmlFor="sv-name">Your name</label>
            <input
              id="sv-name"
              name="name"
              className="input"
              autoComplete="name"
              required
              aria-describedby="sv-name-error"
              {...field}
            />
            <p id="sv-name-error" className="field__error" />
          </div>
          <div className="field">
            <label htmlFor="sv-email">Email</label>
            <input
              id="sv-email"
              name="email"
              type="email"
              className="input"
              autoComplete="email"
              required
              aria-describedby="sv-email-error"
              {...field}
            />
            <p id="sv-email-error" className="field__error" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="sv-whatsapp">
            WhatsApp number <span className="field__hint">(optional)</span>
          </label>
          <input id="sv-whatsapp" name="whatsapp" type="tel" className="input" autoComplete="tel" />
        </div>

        <fieldset className="choices">
          <legend>
            Open to a short call about it? <span className="field__hint">(optional)</span>
          </legend>
          {callAnswers.map((answer) => (
            <label key={answer} className="choice">
              <input type="radio" name="call" value={answer} />
              <span>{answer}</span>
            </label>
          ))}
        </fieldset>

        <div className="field">
          <label className="survey__consent" htmlFor="sv-consent">
            <input
              id="sv-consent"
              name="consent"
              type="checkbox"
              value="yes"
              required
              aria-describedby="sv-consent-error"
              onChange={(e) => clearField(e.currentTarget, messages)}
            />
            <span>I’m happy for QBitLab to contact me about my answers.</span>
          </label>
          <p id="sv-consent-error" className="field__error" />
        </div>
      </fieldset>

      {/* Spam trap: invisible to people, filled in by bots. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="sv-url">Leave this empty</label>
        <input id="sv-url" name="_gotcha" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="survey__submit">
        <button type="submit" className="pill" disabled={sending}>
          {sending ? 'Sending…' : 'Send my answers'}
        </button>
        <p className="form__status" role="status" aria-live="polite" data-tone={status.tone}>
          {status.message}
        </p>
      </div>
    </form>
  );
}
