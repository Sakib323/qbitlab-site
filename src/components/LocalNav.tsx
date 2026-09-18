'use client';

import { useEffect, useRef } from 'react';
import { bookingHref } from '@/content/site';

export type NavItem = { href: `#${string}`; label: string };

/**
 * Apple-style local nav: frosted, sticky, and dark over dark sections. The
 * section in view is marked with aria-current.
 */
export function LocalNav({ items }: { items: NavItem[] }) {
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = nav.current;
    if (!el) return;

    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('.localnav__links a'));
    const sections = links
      .map((l) => document.getElementById(l.getAttribute('href')!.slice(1)))
      .filter((s): s is HTMLElement => Boolean(s));

    let frame = 0;
    const update = () => {
      const probeY = el.offsetHeight + 1;

      // Theme: whatever section sits directly under the nav decides it.
      const under = document
        .elementsFromPoint(window.innerWidth / 2, probeY)
        .find((node) => !el.contains(node))
        ?.closest<HTMLElement>('[data-nav-theme]');
      el.dataset.theme = under?.dataset.navTheme === 'dark' ? 'dark' : 'light';

      // Current section: the last one whose top has passed the middle of the screen.
      const middle = window.innerHeight * 0.5;
      let current: HTMLElement | undefined;
      for (const s of sections) {
        const { top, bottom } = s.getBoundingClientRect();
        if (top <= middle && bottom > middle) current = s;
      }
      links.forEach((link) => {
        if (current && link.getAttribute('href') === `#${current.id}`) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const bookingExternal = bookingHref.startsWith('http');

  return (
    <nav ref={nav} className="localnav" data-theme="dark" aria-label="QBitLab">
      <div className="wrap localnav__inner">
        <a className="localnav__title" href="#top">
          QBitLab
        </a>
        <div className="localnav__menu">
          <ul className="localnav__links">
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
          <a
            className="pill pill--small"
            href={bookingHref}
            {...(bookingExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            Book a call
          </a>
        </div>
      </div>
    </nav>
  );
}
