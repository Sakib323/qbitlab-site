import type { Metadata } from 'next';
import Link from 'next/link';
import { SurveyForm } from '@/components/SurveyForm';
import { survey } from '@/content/survey';
import { contact, IS_DEV, SITE } from '@/content/site';

const description =
  'Tell us what eats up your week. We build AI that takes repetitive work off small businesses, and this is how we find out what to build.';

export const metadata: Metadata = {
  title: 'Survey',
  description,
  alternates: { canonical: '/survey/' },
  openGraph: { title: `${survey.title} — QBitLab`, description, url: '/survey/' },
};

export default function Survey() {
  return (
    <>
      <header className="survey__bar">
        <div className="wrap">
          <Link className="localnav__title" href="/">
            QBitLab
          </Link>
        </div>
      </header>

      <main id="main" className="survey">
        <div className="wrap survey__inner">
          <div className="survey__head">
            <h1 className="survey__title">{survey.title}</h1>
            <p className="survey__intro">{survey.intro}</p>
            <p className="survey__time">{survey.time}</p>
          </div>

          <div className="survey__card">
            {IS_DEV && !contact.survey && (
              <p className="notice">
                Dev only: set <code>contact.surveyEndpoint</code> in src/content/site.json, or answers have
                nowhere to go. See the Survey section of README.md.
              </p>
            )}
            <SurveyForm endpoint={contact.survey} email={contact.email} />
          </div>

          <p className="survey__small">
            We use your answers to work out what to build, and to get back to you about it. Nothing else, and
            nobody else.{' '}
            {contact.email && (
              <>
                Questions? <a href={`mailto:${contact.email}`}>{contact.email}</a>.
              </>
            )}
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
