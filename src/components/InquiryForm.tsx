'use client';

import { useRef, useState, type FormEvent } from 'react';
import { checkField, checkRequired, clearField, type Messages } from '@/lib/form';

type Status = { tone: 'idle' | 'sending' | 'sent' | 'error'; message: string };

const needs = [
  'Answering customers (chat or phone)',
  'Automating repetitive work',
  'A website or landing page',
  'An app, extension, or plugin',
  'Not sure yet',
];

const messages: Messages = {
  name: () => 'Enter your name so we know who to reply to.',
  email: (f) =>
    f.validity.valueMissing
      ? 'Enter your email so we can reply.'
      : 'Enter an email address like name@business.com.',
};

/**
 * Posts straight to the form service's endpoint, so it still submits with
 * JavaScript off. With JavaScript on, it validates each field when you leave
 * it, submits in place, and reports the result without reloading.
 */
export function InquiryForm({ endpoint }: { endpoint: string | null }) {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>({ tone: 'idle', message: '' });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const el = form.current!;
    if (!checkRequired(el, messages)) {
      setStatus({ tone: 'error', message: 'Some details are missing. Check the highlighted fields.' });
      return;
    }

    if (!endpoint) {
      setStatus({
        tone: 'error',
        message: 'This form isn’t connected yet. Set contact.formEndpoint in site.json.',
      });
      return;
    }

    setStatus({ tone: 'sending', message: 'Sending your inquiry…' });
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(el),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(String(response.status));
      el.reset();
      setStatus({ tone: 'sent', message: 'Inquiry sent. We’ll reply by email.' });
    } catch {
      setStatus({
        tone: 'error',
        message: 'Your inquiry didn’t send. Check your connection and try again.',
      });
    }
  };

  const sending = status.tone === 'sending';

  return (
    <form
      ref={form}
      className="form"
      action={endpoint ?? undefined}
      method="POST"
      noValidate
      onSubmit={onSubmit}
    >
      <div className="form__row">
        <div className="field">
          <label htmlFor="inq-name">Your name</label>
          <input
            id="inq-name"
            name="name"
            className="input"
            autoComplete="name"
            required
            aria-describedby="inq-name-error"
            onBlur={(e) => checkField(e.currentTarget, messages)}
            onInput={(e) => clearField(e.currentTarget, messages)}
          />
          <p id="inq-name-error" className="field__error" />
        </div>
        <div className="field">
          <label htmlFor="inq-email">Email</label>
          <input
            id="inq-email"
            name="email"
            type="email"
            className="input"
            autoComplete="email"
            required
            aria-describedby="inq-email-error"
            onBlur={(e) => checkField(e.currentTarget, messages)}
            onInput={(e) => clearField(e.currentTarget, messages)}
          />
          <p id="inq-email-error" className="field__error" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="inq-business">
          Business name <span className="field__hint">(optional)</span>
        </label>
        <input id="inq-business" name="business" className="input" autoComplete="organization" />
      </div>

      <fieldset className="choices">
        <legend>What do you need help with?</legend>
        {needs.map((need) => (
          <label key={need} className="choice">
            <input type="checkbox" name="needs" value={need} />
            <span>{need}</span>
          </label>
        ))}
      </fieldset>

      <div className="field">
        <label htmlFor="inq-message">
          Tell us a little more <span className="field__hint">(optional)</span>
        </label>
        <textarea
          id="inq-message"
          name="message"
          className="input"
          aria-describedby="inq-message-hint"
        />
        <p id="inq-message-hint" className="field__hint">
          What takes up the most time, and what you’ve tried so far.
        </p>
      </div>

      {/* Spam trap: invisible to people, filled in by bots. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="inq-website">Leave this empty</label>
        <input id="inq-website" name="_gotcha" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid justify-items-start gap-3">
        <button type="submit" className="pill" disabled={sending}>
          {sending ? 'Sending…' : 'Send inquiry'}
        </button>
        <p className="form__status" role="status" aria-live="polite" data-tone={status.tone}>
          {status.message}
        </p>
      </div>
    </form>
  );
}
