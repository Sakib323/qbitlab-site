'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

const RESEARCH_URL = 'https://research.qbitlab.tech';

/*
 * The diagram, in a small 3D space drawn with a fixed oblique projection. The
 * plane stands for the directions the model's earlier knowledge depends on; the
 * arrows are one update, before and after GPM removes the part lying in that plane.
 */
const S = 100;
const iso = (x: number, y: number, z: number): [number, number] => [
  Math.round((x - z) * 0.9 * S * 10) / 10,
  Math.round(((x + z) * 0.32 - y) * S * 10) / 10,
];

const H = 1.25;
const G: [number, number, number] = [1.15, 1.25, -0.5];

const PLANE = [iso(-H, 0, -H), iso(H, 0, -H), iso(H, 0, H), iso(-H, 0, H)];
const GRID = [-0.6, -0.2, 0.2, 0.6].flatMap((t) => [
  [iso(-H, 0, t * H), iso(H, 0, t * H)],
  [iso(t * H, 0, -H), iso(t * H, 0, H)],
]);
const RAW = iso(...G);
const OVERLAP = iso(G[0], 0, G[2]);
const KEPT = iso(0, G[1], 0);

// A right-angle mark between the kept update and the plane.
const M = 0.17;
const U = Math.hypot(G[0], G[2]);
const SQUARE = [
  iso((G[0] / U) * M, 0, (G[2] / U) * M),
  iso((G[0] / U) * M, M, (G[2] / U) * M),
  iso(0, M, 0),
];

const WHITE = '#f5f5f7';
const GREY = '#a1a1a6';
const BLUE = '#2997ff';

const pts = (p: [number, number][]) => p.map((q) => q.join(',')).join(' ');

function Head({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill={color} />
    </marker>
  );
}

const STEPS = [
  {
    text: 'A new lesson produces an update to the model.',
    swatch: <line x1="4" y1="18" x2="34" y2="6" stroke={WHITE} strokeWidth="2.5" markerEnd="url(#rs-head-white)" />,
  },
  {
    text: 'Part of it runs along the directions earlier knowledge depends on.',
    swatch: (
      <>
        <polygon points="2,14 20,6 38,14 20,22" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" />
        <line x1="12" y1="14" x2="30" y2="12" stroke={GREY} strokeWidth="2" strokeDasharray="4 3" />
      </>
    ),
  },
  {
    text: 'GPM removes that part and keeps the rest.',
    swatch: <line x1="20" y1="22" x2="20" y2="4" stroke={BLUE} strokeWidth="2.5" markerEnd="url(#rs-head-blue)" />,
  },
];

/**
 * A glimpse of QBitLab Research: the goal, one thread of work, and one mechanism
 * drawn out as the page scrolls. The detail lives on research.qbitlab.tech.
 */
export function Research() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const steps = gsap.utils.toArray<HTMLElement>('.research__steps li');
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          // Finishes with the whole figure still on screen, so the complete drawing is seen at rest.
          scrollTrigger: { trigger: '.research__figure', start: 'top 90%', end: 'bottom 70%', scrub: 0.6 },
        });
        // Each step's line brightens as its part of the drawing arrives.
        [0, 1.2, 2.4].forEach((at, i) => tl.fromTo(steps[i], { opacity: 0.35 }, { opacity: 1, duration: 0.4 }, at));

        tl.fromTo('.rs-raw', { attr: { x2: 0, y2: 0 }, opacity: 0 }, { attr: { x2: RAW[0], y2: RAW[1] }, opacity: 1, duration: 1 }, 0)
          .fromTo(
            '.rs-overlap',
            { attr: { x2: 0, y2: 0 }, opacity: 0 },
            { attr: { x2: OVERLAP[0], y2: OVERLAP[1] }, opacity: 1, duration: 1 },
            1.2,
          )
          .fromTo('.rs-link', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.6)
          .fromTo('.rs-kept', { attr: { x2: 0, y2: 0 }, opacity: 0 }, { attr: { x2: KEPT[0], y2: KEPT[1] }, opacity: 1, duration: 1 }, 2.4)
          .to('.rs-raw', { opacity: 0.3, duration: 0.8 }, 2.6)
          .to(['.rs-overlap', '.rs-link'], { opacity: 0.45, duration: 0.8 }, 2.6)
          .fromTo('.rs-square', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 3.2)
          .to({}, { duration: 0.4 });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} id="research" className="chapter dark research" data-nav-theme="dark" aria-labelledby="research-title">
      <div className="wrap">
        <header className="chapter__head">
          <h2 id="research-title" className="chapter__title">
            Research
          </h2>
          <p className="chapter__statement" data-reveal>
            Toward general intelligence.
          </p>
          <p className="chapter__intro">
            <strong>QBitLab Research works in many directions, all aimed at artificial general intelligence.</strong>{' '}
            One of them is continual learning: AI that keeps learning after it ships, without forgetting what it
            already knows.
          </p>
        </header>

        <div className="research__lead">
          <h3 className="research__name">Gradient Projection Memory.</h3>{' '}
          <p className="research__text">
            One mechanism we’re developing for it. It’s designed to let a model learn something new while
            protecting what it learned before.
          </p>
        </div>

        <figure className="research__figure">
          <svg viewBox="-250 -150 500 240" role="img" aria-labelledby="research-diagram-title">
            <title id="research-diagram-title">
              An update to the model is split in two. GPM removes the part that lies along what the model already
              knows and keeps the part at right angles to it.
            </title>
            <defs>
              <Head id="rs-head-white" color={WHITE} />
              <Head id="rs-head-grey" color={GREY} />
              <Head id="rs-head-blue" color={BLUE} />
            </defs>

            <polygon points={pts(PLANE)} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
            {GRID.map(([a, b], i) => (
              <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            ))}

            <line
              className="rs-link"
              x1={KEPT[0]}
              y1={KEPT[1]}
              x2={RAW[0]}
              y2={RAW[1]}
              stroke={GREY}
              strokeWidth="1.5"
              strokeDasharray="5 5"
              opacity="0.45"
            />
            <line
              className="rs-overlap"
              x1="0"
              y1="0"
              x2={OVERLAP[0]}
              y2={OVERLAP[1]}
              stroke={GREY}
              strokeWidth="2"
              strokeDasharray="6 5"
              markerEnd="url(#rs-head-grey)"
              opacity="0.45"
            />
            <line
              className="rs-raw"
              x1="0"
              y1="0"
              x2={RAW[0]}
              y2={RAW[1]}
              stroke={WHITE}
              strokeWidth="2.5"
              markerEnd="url(#rs-head-white)"
              opacity="0.3"
            />
            <polyline className="rs-square" points={pts(SQUARE)} fill="none" stroke={BLUE} strokeWidth="1.5" />
            <line
              className="rs-kept"
              x1="0"
              y1="0"
              x2={KEPT[0]}
              y2={KEPT[1]}
              stroke={BLUE}
              strokeWidth="3"
              markerEnd="url(#rs-head-blue)"
            />
            <circle r="3.5" fill={WHITE} />
          </svg>
        </figure>

        <ol className="research__steps">
          {STEPS.map((step) => (
            <li key={step.text}>
              <svg className="research__swatch" viewBox="0 0 40 28" aria-hidden="true">
                {step.swatch}
              </svg>
              {step.text}
            </li>
          ))}
        </ol>

        <div className="research__actions">
          <a className="pill" href={RESEARCH_URL} target="_blank" rel="noopener">
            Visit QBitLab Research
          </a>
          <span className="research__note">research.qbitlab.tech · opening soon</span>
        </div>
      </div>
    </section>
  );
}
