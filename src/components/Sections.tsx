import { Handles } from './Handles';
import { InquiryForm } from './InquiryForm';
import { chapters, type Chapter as ChapterType, type Service } from '@/content/services';
import { objects, photoCredits, type ObjectImage } from '@/content/media';
import { projects } from '@/content/projects';
import { bookingHref, contact, IS_DEV, SITE } from '@/content/site';

const external = (href: string) =>
  href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {};

function ObjectPhoto({ image, sizes, eager = false }: { image: ObjectImage; sizes: string; eager?: boolean }) {
  // The -900/-1800 suffixes name each file's longest side, but srcset needs real
  // widths: a tall object's -1800 file is far narrower than 1800px.
  const smallWidth = Math.round(image.width * Math.min(1, 900 / Math.max(image.width, image.height)));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${image.base}-900.webp`}
      srcSet={`${image.base}-900.webp ${smallWidth}w, ${image.base}-1800.webp ${image.width}w`}
      sizes={sizes}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={image.scale && image.scale !== 1 ? ({ ['--scale' as string]: image.scale }) : undefined}
    />
  );
}

export function Intro() {
  return (
    <section className="intro" aria-label="What QBitLab does">
      <div className="wrap">
        <p className="intro__text" data-reveal>
          <strong>QBitLab builds AI chatbots, voice agents, and automations</strong> for small and
          growing businesses — plus the websites and apps they run on.
        </p>
        <div className="intro__actions">
          <a className="pill" href={bookingHref} {...external(bookingHref)}>
            Book a call
          </a>
          <a className="more" href="#how-it-works">
            How a project runs
          </a>
        </div>
      </div>
    </section>
  );
}

/** One service: the object on one side, the writing on the other, alternating down the page. */
function ServiceRow({ service, flip }: { service: Service; flip: boolean }) {
  return (
    <article
      id={service.id}
      className="row"
      data-flip={flip ? 'true' : undefined}
      aria-labelledby={`${service.id}-name`}
    >
      <figure className="row__media" data-zoom>
        <ObjectPhoto image={service.image} sizes="(min-width: 834px) 44vw, 78vw" />
      </figure>
      <div className="row__copy" data-reveal>
        <h3 id={`${service.id}-name`} className="row__name">
          {service.name}.
        </h3>{' '}
        <p className="row__text">
          {service.hook} {service.body}
        </p>
        <ul className="tags" aria-label={`${service.name} includes`}>
          {service.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function ChapterHead({ chapter }: { chapter: ChapterType }) {
  return (
    <header className="chapter__head">
      <h2 id={`${chapter.id}-title`} className="chapter__title">
        {chapter.title}
      </h2>
      <p className="chapter__statement" data-reveal>
        {chapter.statement}
      </p>
      <p className="chapter__intro">
        <strong>{chapter.lead}</strong> {chapter.rest}
      </p>
    </header>
  );
}

export function Chapter({ index }: { index: number }) {
  const chapter = chapters[index];
  return (
    <section
      id={chapter.id}
      className={`chapter${chapter.dark ? ' dark' : ''}${index === 2 ? ' chapter--paper' : ''}`}
      data-nav-theme={chapter.dark ? 'dark' : 'light'}
      aria-labelledby={`${chapter.id}-title`}
    >
      <div className="wrap">
        <ChapterHead chapter={chapter} />
        <div className="rows">
          {chapter.services.map((service, i) => (
            <ServiceRow key={service.id} service={service} flip={i % 2 === 1} />
          ))}
        </div>
        {chapter.id === 'automation' && (
          <>
            <ul className="tools" aria-label="Automation platforms we build on" data-reveal>
              <li>n8n</li>
              <li>Make</li>
              <li>Zapier</li>
            </ul>
            <p className="tools__caption">Plus the language models that handle the steps needing judgment.</p>
          </>
        )}
      </div>
    </section>
  );
}

const notes = [
  {
    title: 'Hands over to a person.',
    body: 'When a conversation needs you, it passes across with everything that was said.',
    icon: (
      <>
        <path d="M4 18.5a6 6 0 0 1 12 0" />
        <circle cx="10" cy="7.5" r="3.6" />
        <path d="m16.5 9 3 3-3 3M19.5 12h-6" />
      </>
    ),
  },
  {
    title: 'Speaks in your voice.',
    body: 'Built on your own services, hours, and policies, in the words you use with customers.',
    icon: (
      <>
        <path d="M12 3.5a8 8 0 0 0-8 8v4a3 3 0 0 0 3 3h1.5v-6H4" />
        <path d="M20 15.5v-4a8 8 0 0 0-8-8M20 11.5h-4.5v6H17a3 3 0 0 0 3-3" />
      </>
    ),
  },
];

/** The full-width beat between the chapters: one object, edge to edge. */
export function AlwaysOn() {
  return (
    <section className="bleed" data-nav-theme="light" aria-labelledby="always-on-title">
      <figure className="bleed__media" data-zoom>
        <ObjectPhoto image={objects['always-on']} sizes="(min-width: 834px) 62vw, 100vw" />
      </figure>
      <div className="wrap">
        <div className="bleed__copy" data-reveal>
          <h2 id="always-on-title" className="bleed__lead">
            Always on.
          </h2>{' '}
          <p className="bleed__text">
            Customers don’t keep your opening hours. The message that arrives at 11pm and the call
            that comes while you’re with someone else both get answered, in your business’s voice,
            with the details written down for you.
          </p>
          <ul className="notes">
            {notes.map((note) => (
              <li key={note.title}>
                <span className="notes__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {note.icon}
                  </svg>
                </span>
                <h3 className="notes__title">{note.title}</h3>
                <p className="notes__text">{note.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export { Handles };

const steps = [
  {
    title: 'Tell us where the time goes.',
    body: 'A call about your business, the jobs that eat your week, and the tools you already use.',
  },
  {
    title: 'Agree on a clear plan.',
    body: 'We work out what to automate or build, and agree the scope with you before any work starts.',
  },
  {
    title: 'We build it and launch it.',
    body: 'We build it, test it against your real day-to-day work, and put it live.',
  },
];

export function Process() {
  return (
    <section id="how-it-works" className="chapter" data-nav-theme="light" aria-labelledby="process-title">
      <div className="wrap">
        <header className="chapter__head">
          <h2 id="process-title" className="chapter__title">
            How it works
          </h2>
          <p className="chapter__statement" data-reveal>
            Three steps to less busywork.
          </p>
          <p className="chapter__intro">
            <strong>You don’t need to know which tools or models to use.</strong> You need to know
            what should stop taking up your time. We handle the rest.
          </p>
        </header>
        <ol className="steps">
          {steps.map((step, i) => (
            <li key={step.title} className="step">
              <span className="step__number" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__text">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Work() {
  if (projects.length === 0) return null;
  return (
    <section id="work" className="chapter chapter--paper" data-nav-theme="light" aria-labelledby="work-title">
      <div className="wrap">
        <header className="chapter__head">
          <h2 id="work-title" className="chapter__title">
            Work
          </h2>
          <p className="chapter__statement" data-reveal>
            Built for businesses like yours.
          </p>
        </header>
        <div className="work-grid">
          {projects.map((project) => (
            <article key={project.id}>
              <div className="work-card__media">
                {project.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.image} alt="" loading="lazy" />
                ) : (
                  <span>Project image</span>
                )}
              </div>
              <p className="work-card__meta">
                {project.client} · {project.service}
              </p>
              <h3 className="work-card__name">{project.name}</h3>
              <p className="work-card__text">{project.summary}</p>
              {project.result && <p className="work-card__result">{project.result}</p>}
              {project.draft && <span className="draft">Draft — dev only. Replace in projects.ts</span>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Unconfigured({ setting }: { setting: string }) {
  if (!IS_DEV) return null;
  return (
    <p className="notice">
      Dev only: set <code>{setting}</code> in src/content/site.json. Hidden in production until then.
    </p>
  );
}

const PATH_ICONS = {
  booking: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <path d="M4 9.5h16M8 3v4M16 3v4" />
    </>
  ),
  whatsapp: (
    <path d="M12 3.5c-4.7 0-8.5 3.3-8.5 7.4 0 2.3 1.2 4.4 3.2 5.8-.1.9-.5 2.1-1.4 3.1 1.6-.2 3-.8 4-1.5.9.3 1.8.4 2.7.4 4.7 0 8.5-3.3 8.5-7.4S16.7 3.5 12 3.5Z" />
  ),
  email: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </>
  ),
};

export function Contact() {
  const paths = [
    contact.booking || IS_DEV
      ? {
          key: 'booking',
          icon: 'booking' as const,
          title: 'Book a call',
          body: 'Pick a time that suits you and tell us what’s taking up your week.',
          meta: null,
          href: contact.booking,
          action: 'Choose a time',
          setting: 'contact.bookingUrl',
        }
      : null,
    contact.whatsapp || IS_DEV
      ? {
          key: 'whatsapp',
          icon: 'whatsapp' as const,
          title: 'Message us on WhatsApp',
          body: 'Send a message from your phone and we’ll reply there.',
          meta: null,
          href: contact.whatsapp,
          action: 'Open WhatsApp',
          setting: 'contact.whatsappNumber',
        }
      : null,
    contact.email || IS_DEV
      ? {
          key: 'email',
          icon: 'email' as const,
          title: 'Send an email',
          body: 'Write to us directly and we’ll get back to you.',
          meta: contact.email,
          href: contact.email ? `mailto:${contact.email}` : null,
          action: 'Compose an email',
          setting: 'contact.email',
        }
      : null,
  ].filter((p): p is NonNullable<typeof p> => p !== null);

  const showForm = Boolean(contact.form) || IS_DEV;

  return (
    <section id="contact" className="chapter chapter--paper" data-nav-theme="light" aria-labelledby="contact-title">
      <div className="wrap">
        <header className="chapter__head">
          <h2 id="contact-title" className="chapter__title">
            Contact
          </h2>
          <p className="chapter__statement" data-reveal>
            Let’s take the busywork off your plate.
          </p>
          <p className="chapter__intro">
            <strong>Start with a call, a message, or a few lines about what you need.</strong>{' '}
            Whichever is easiest for you.
          </p>
        </header>

        {paths.length > 0 && (
          <div className="paths">
            {paths.map((path) => (
              <div key={path.key} className="card">
                <span className="card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {PATH_ICONS[path.icon]}
                  </svg>
                </span>
                <h3 className="card__title">{path.title}</h3>
                <p className="card__text">{path.body}</p>
                {path.meta && <p className="card__meta">{path.meta}</p>}
                {path.href ? (
                  <a className="pill" href={path.href} target="_blank" rel="noopener noreferrer">
                    {path.action}
                  </a>
                ) : (
                  <Unconfigured setting={path.setting} />
                )}
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="card">
            <h3 className="card__title">Send an inquiry</h3>
            <p className="card__text">A few details are enough to start. We’ll reply by email.</p>
            {!contact.form && <Unconfigured setting="contact.formEndpoint" />}
            <InquiryForm endpoint={contact.form} />
          </div>
        )}
      </div>
    </section>
  );
}

// Kept separate from the section nav passed in as `nav` — this is a real page,
// not a scroll anchor, and doesn't belong in the sticky top nav's scroll-spy.
const LEGAL_LINKS = [{ href: '/privacy/', label: 'Privacy' }];

export function Footer({ nav }: { nav: { href: string; label: string }[] }) {
  return (
    <footer className="footer" data-nav-theme="light">
      <div className="wrap">
        <p className="footer__note">
          The objects on this page are illustrations of what each service does. Most are rendered for
          this site; the rest are licensed stock photographs, cut out from their backgrounds.
        </p>
        <details className="footer__credits">
          <summary>Image credits</summary>
          <ul>
            {photoCredits.map((image) => (
              <li key={image.base}>
                Photo by{' '}
                <a href={image.credit.source} target="_blank" rel="noopener noreferrer">
                  {image.credit.photographer}
                </a>{' '}
                on {image.credit.site}
              </li>
            ))}
          </ul>
        </details>
        <hr className="footer__rule" />
        <div className="footer__row">
          <span>
            Copyright © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </span>
          <nav className="footer__links" aria-label="Footer">
            {nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
            {LEGAL_LINKS.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
