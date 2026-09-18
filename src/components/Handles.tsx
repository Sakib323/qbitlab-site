'use client';

import { useEffect, useRef, useState } from 'react';

const TABS = [
  {
    id: 'messages',
    label: 'Messages',
    said: 'Do you have anything free on Saturday morning?',
    lead: 'Website and messaging chat.',
    body: 'Your assistant answers questions about your hours, prices, and availability wherever customers write to you — and takes the booking when that’s what they’re after.',
  },
  {
    id: 'calls',
    label: 'Calls',
    said: 'Hi — can I move my appointment to next week?',
    lead: 'The phone, picked up.',
    body: 'A voice agent answers when you can’t, handles the questions you get every day, writes down the caller’s details, and hands the call to you when it should.',
  },
  {
    id: 'busywork',
    label: 'Busywork',
    said: 'New order from the website. Add it to the sheet and send the invoice.',
    lead: 'Work that moves itself.',
    body: 'We connect the tools you already use, so details stop being copied by hand between your forms, inbox, spreadsheets, and CRM.',
  },
  {
    id: 'questions',
    label: 'Questions',
    said: 'What’s our refund policy on custom orders?',
    lead: 'Answers from your own documents.',
    body: 'An assistant your team can ask, which answers from your documents and policies and shows where each answer came from.',
  },
];

const ROTATE_MS = 8000;

/**
 * What the assistant handles, in the customer's own words. The panel rotates on
 * its own until someone picks a tab, after which it stays where they put it.
 */
export function Handles() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const section = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (held) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        clearInterval(timer);
        if (entry.isIntersecting) {
          timer = setInterval(() => setActive((i) => (i + 1) % TABS.length), ROTATE_MS);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(section.current!);
    return () => {
      clearInterval(timer);
      observer.disconnect();
    };
  }, [held]);

  const choose = (index: number, focus = false) => {
    setHeld(true);
    setActive(index);
    if (focus) tabs.current[index]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowRight: (active + 1) % TABS.length,
      ArrowLeft: (active - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    choose(keys[event.key], true);
  };

  const tab = TABS[active];

  return (
    <section ref={section} className="handles" data-nav-theme="light" aria-labelledby="handles-title">
      <div className="wrap">
        <h2 id="handles-title" className="handles__title">
          What it handles.
        </h2>

        <div className="handles__panel" role="tabpanel" id="handles-panel" aria-labelledby={`tab-${tab.id}`}>
          <p key={tab.id} className="handles__said">
            {tab.said.split(' ').map((word, i) => (
              <span key={`${tab.id}-${i}`} style={{ ['--i' as string]: i }}>
                {word}{' '}
              </span>
            ))}
          </p>
        </div>
        <p className="handles__caption">
          Examples of what an assistant is asked in a day. Every answer comes from your own
          information.
        </p>

        <div className="handles__tabs" role="tablist" aria-label="What it handles" onKeyDown={onKeyDown}>
          {TABS.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={i === active}
              aria-controls="handles-panel"
              tabIndex={i === active ? 0 : -1}
              className="handles__tab"
              onClick={() => choose(i)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="handles__copy">
          <h3 className="handles__lead">{tab.lead}</h3>{' '}
          <p className="handles__text">{tab.body}</p>
        </div>
      </div>
    </section>
  );
}
