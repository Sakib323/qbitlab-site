import type { Metadata } from 'next';
import Link from 'next/link';
import { contact, SITE } from '@/content/site';

const description = 'What QBitLab collects through qbitlab.tech, why, and what you can do about it.';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description,
  alternates: { canonical: '/privacy/' },
  openGraph: { title: 'Privacy Policy — QBitLab', description, url: '/privacy/' },
};

// Kept in one place so "last updated" only moves when the policy's own text does.
const UPDATED = '22 September 2026';

export default function Privacy() {
  const channels = [
    contact.survey && {
      title: 'The survey',
      body: 'business details, what takes up your time, the tools you use, what you’d hand over to an assistant, your name, email, and WhatsApp number if you give it — plus, if you followed a link we sent you, a tag identifying which one, so we know who answered.',
    },
    {
      title: 'The contact form and email',
      body: 'your name, email, business name, what you need help with, and anything you write to us.',
    },
    contact.whatsapp && {
      title: 'WhatsApp',
      body: 'your number and the conversation, if you message us there — handled through WhatsApp’s own platform, under Meta’s privacy policy.',
    },
    contact.booking && {
      title: 'Booking a call',
      body: 'whatever the booking page itself asks for, handled by that page’s own provider.',
    },
  ].filter((c): c is { title: string; body: string } => Boolean(c));

  return (
    <>
      <header className="survey__bar">
        <div className="wrap">
          <Link className="localnav__title" href="/">
            QBitLab
          </Link>
        </div>
      </header>

      <main id="main" className="legal">
        <div className="wrap legal__inner">
          <h1 className="legal__title">Privacy Policy</h1>
          <p className="legal__updated">Last updated {UPDATED}</p>

          <p>
            QBitLab (“we”, “us”) builds AI chatbots, voice agents, and automations for small
            businesses. This page explains what we collect through {SITE.domain}, why, and what you can do about
            it. If anything here isn’t clear, write to{' '}
            {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : 'us'} and ask.
          </p>

          <h2>No cookies, no tracking</h2>
          <p>
            This site carries no analytics, advertising, or tracking scripts of any kind, and sets no cookies.
            Nothing about your visit is recorded unless you fill in a form, send an email, or message us directly
            — in which case, this is what we collect:
          </p>

          <h2>What we collect</h2>
          <ul className="legal__list">
            {channels.map((c) => (
              <li key={c.title}>
                <strong>{c.title}:</strong> {c.body}
              </li>
            ))}
          </ul>

          <h2>Why, and on what basis</h2>
          <p>
            If you answer the survey, we use it to understand what repetitive work businesses deal with, so we
            can design solutions worth building, and to follow up about it. That follow-up relies on the
            permission you give on the form itself — you can withdraw it at any time by telling us.
          </p>
          <p>
            If you get in touch through the contact form, email, or WhatsApp, we use what you send to answer you
            and, where it leads to a project, to take the steps needed to work with you. That’s a legitimate
            interest we have in responding to enquiries sent to us directly, rather than something we ask separate
            consent for.
          </p>
          <p>
            We don’t sell your data, and we don’t use it for anything beyond what’s described here.
          </p>

          <h2>Where it’s stored</h2>
          <p>
            Survey answers are saved to a Google Sheet using Google’s infrastructure, which may process data
            outside the UK under Google’s own safeguards. Email and WhatsApp messages stay within those
            services’ own systems. We don’t hand your data to anyone else.
          </p>

          <h2>How long we keep it</h2>
          <p>
            We keep survey and enquiry answers for as long as we’re actively considering or working on them,
            and for a while afterwards in case we follow up or you get back to us — normally no more than 12
            months, unless we’re actively working with you. You can ask us to delete your answers sooner at
            any time.
          </p>

          <h2>Your rights</h2>
          <p>Under UK GDPR, you can ask us to:</p>
          <ul className="legal__list">
            <li>show you what we hold about you</li>
            <li>correct it if it’s wrong</li>
            <li>delete it</li>
            <li>stop or restrict how we use it</li>
            <li>hand it to you in a portable format</li>
          </ul>
          <p>
            To do any of that, write to{' '}
            {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : 'us'}. If you’re not
            satisfied with our answer, you can complain to the UK’s Information Commissioner’s Office at{' '}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
              ico.org.uk
            </a>
            .
          </p>

          <h2>Children</h2>
          <p>
            This site and its survey are for business owners and the people who run them, not children. We don’t
            knowingly collect data from anyone under 18.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If what we collect or do with it changes, we’ll update this page and move the date at the top.
          </p>
        </div>
      </main>

      <footer className="survey__foot">
        <div className="wrap">
          Copyright © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </footer>
    </>
  );
}
