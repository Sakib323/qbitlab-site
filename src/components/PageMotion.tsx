'use client';

import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * The page's motion outside the hero, applied from data attributes so the
 * sections themselves stay Server Components:
 *
 * - `data-reveal`: headlines rise into place once as they enter.
 * - `data-zoom`: object images rise, fade in, and ease up to full size as the
 *   page scrolls them into view — a lighter echo of the hero's scroll-linked
 *   motion, for the images carrying real weight on the page.
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
          { scale: 0.82, y: 48, autoAlpha: 0 },
          {
            scale: 1,
            y: 0,
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 32%', scrub: 0.6 },
          },
        );
      });

      // These images load lazily, well after ScrollTrigger's own start/end
      // measurements settle — without a refresh once each one arrives, a
      // trigger range can go stale and leave its image stuck invisible.
      const images = gsap.utils.toArray<HTMLImageElement>('[data-zoom] img');
      images.forEach((img) => {
        if (img.complete) return;
        img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
      });
    });

    return () => mm.revert();
  });

  return null;
}
