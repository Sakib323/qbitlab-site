'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Single registration point for GSAP plugins.
 *
 * ScrollTrigger touches `document` at registration, so it must never run during
 * SSR. Every component imports gsap from here rather than from 'gsap' directly,
 * which guarantees the plugin is registered exactly once before first use.
 */
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
