'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

/**
 * The page's motion outside the hero, applied from data attributes so the
 * sections themselves stay Server Components:
 *
 * - `data-reveal`: headlines rise into place once as they enter.
 * - `data-zoom`: photo cards ease from 92% to full size, tied to the scroll.
 *
 * Everything is visible in the HTML. Only elements still below the fold get
 * hidden, so nothing on screen flickers, and reduced motion skips it all.
 */
export function PageMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight;

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        if (!belowFold(el)) return;
        gsap.from(el, {
          autoAlpha: 0,
          y: 56,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-zoom]').forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.92 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 35%', scrub: 0.5 },
          },
        );
      });
    });

    return () => mm.revert();
  });

  return null;
}
