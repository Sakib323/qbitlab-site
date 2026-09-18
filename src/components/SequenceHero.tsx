'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { bookingHref } from '@/content/site';
import { frameUrl, sequence } from '@/content/media';

const CONCURRENCY = 6;
/** How far past "fit the whole frame" the drawing may crop, so wide screens stay filled. */
const MAX_CROP = 1.25;

/**
 * Canvas scroll clip: the section pins for several viewports while a 120-frame
 * image sequence scrubs with the scroll, and four lines of copy hand off to one
 * another on the same timeline. The frames are rendered against black with the
 * phone kept clear of the copy, so nothing needs a scrim.
 *
 * Frame 1 ships as a plain <img>, so the first paint needs no JavaScript. The
 * rest load coarse-to-fine (every 8th frame first), and the canvas always draws
 * the nearest frame that has arrived, so scrubbing works before everything loads.
 */
export function SequenceHero() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const el = section.current!;
        const cv = canvas.current!;
        const ctx = cv.getContext('2d', { alpha: false })!;
        const total = sequence.frames;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        // Same test as the preload and the poster <picture>, so frame 1 downloads once.
        const framesFor = () =>
          window.matchMedia('(orientation: portrait)').matches ? sequence.portrait : sequence.landscape;
        let set = framesFor();
        const images: (HTMLImageElement | undefined)[] = new Array(total);
        const state = { frame: 0 };
        let raf = 0;
        let cancelled = false;

        const nearest = (index: number) => {
          for (let d = 0; d < total; d++) {
            if (images[index - d]) return images[index - d];
            if (images[index + d]) return images[index + d];
          }
          return undefined;
        };

        const paint = (img: HTMLImageElement) => {
          const { width: cw, height: ch } = cv;
          const fit = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
          const scale = Math.min(Math.max(cw / img.naturalWidth, ch / img.naturalHeight), fit * MAX_CROP);
          const w = img.naturalWidth * scale;
          const h = img.naturalHeight * scale;
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
          el.dataset.ready = 'true';
        };

        // Until frames arrive the canvas falls back to the poster, which is already
        // decoded. Without that it would stay transparent, leaving the still poster
        // on screen — a hero that looks frozen however far you scroll.
        const poster = el.querySelector<HTMLImageElement>('.sequence__poster');
        const ready = (img: HTMLImageElement | undefined) =>
          img?.complete && img.naturalWidth > 0 ? img : undefined;

        const draw = () => {
          const img = nearest(Math.round(state.frame)) ?? ready(poster ?? undefined);
          if (img) paint(img);
        };

        // Coalesces the bursts: a dozen frames can land in the same tick.
        const schedule = () => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(draw);
        };

        poster?.addEventListener('load', schedule, { once: true });

        // Coarse pass first so the whole scroll range is covered early.
        const order = [
          ...Array.from({ length: total }, (_, i) => i).filter((i) => i % 8 === 0),
          ...Array.from({ length: total }, (_, i) => i).filter((i) => i % 8 !== 0),
        ];
        // Frames already held are kept until their replacement lands, so turning a
        // phone swaps framing without ever leaving the canvas empty.
        let run = 0;
        const loadFrames = () => {
          const mine = ++run;
          const frames = set;
          let cursor = 0;
          const load = (index: number) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.decoding = 'async';
              img.onload = () => {
                if (cancelled || mine !== run) return resolve();
                images[index] = img;
                schedule();
                resolve();
              };
              img.onerror = () => resolve();
              img.src = frameUrl(frames, index);
            });
          const worker = async () => {
            while (!cancelled && mine === run && cursor < order.length) await load(order[cursor++]);
          };
          Array.from({ length: CONCURRENCY }, worker);
        };
        loadFrames();

        let refresh = 0;
        const resize = () => {
          cv.width = Math.round(cv.clientWidth * dpr);
          cv.height = Math.round(cv.clientHeight * dpr);
          // A resize can flip the orientation, which changes where the phone sits.
          const next = framesFor();
          if (next !== set) {
            set = next;
            loadFrames();
          }
          schedule();
          // The pinned height changes with the viewport, and a browser that resizes
          // without firing a window resize event would otherwise leave it stale.
          clearTimeout(refresh);
          refresh = window.setTimeout(() => ScrollTrigger.refresh(), 200);
        };
        // Size and paint now rather than waiting for the observer's first callback,
        // so the canvas is never left at its default 300×150 with the poster showing
        // through, and the first paint does not wait on an animation frame.
        resize();
        draw();
        const observer = new ResizeObserver(resize);
        observer.observe(cv);

        // Frames follow the scroll with a touch of smoothing. This draws inline
        // rather than through requestAnimationFrame: GSAP is already inside a tick,
        // and one drawImage per update is cheaper than an extra frame of latency.
        gsap.to(state, {
          frame: total - 1,
          ease: 'none',
          onUpdate: draw,
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.4,
          },
        });

        // Copy beats: hide the later ones before handing control to GSAP.
        const beats = gsap.utils.toArray<HTMLElement>('.beat', el);
        gsap.set(beats.slice(1), { autoAlpha: 0, y: 48 });
        el.dataset.live = 'true';

        const tl = gsap.timeline({
          defaults: { ease: 'power2.out', duration: 1 },
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        });
        tl.to('.sequence__cue', { autoAlpha: 0, duration: 0.6 }, 0.2)
          .to(beats[0], { autoAlpha: 0, y: -48 }, 1.3)
          .to(beats[1], { autoAlpha: 1, y: 0 }, 2.1)
          .to(beats[1], { autoAlpha: 0, y: -48 }, 3.7)
          .to(beats[2], { autoAlpha: 1, y: 0 }, 4.5)
          .to(beats[2], { autoAlpha: 0, y: -48 }, 6.1)
          .to(beats[3], { autoAlpha: 1, y: 0 }, 6.9)
          .to({}, { duration: 1.4 }, 7.9);

        return () => {
          cancelled = true;
          cancelAnimationFrame(raf);
          clearTimeout(refresh);
          observer.disconnect();
          delete el.dataset.live;
          delete el.dataset.ready;
        };
      });

      return () => mm.revert();
    },
    { scope: section },
  );

  const bookingExternal = bookingHref.startsWith('http');

  return (
    <section ref={section} className="sequence" data-nav-theme="dark" aria-labelledby="hero-title">
      <div className="sequence__sticky">
        <picture>
          <source media="(orientation: portrait)" srcSet={frameUrl(sequence.portrait, 0)} />
          <img
            className="sequence__poster"
            src={frameUrl(sequence.landscape, 0)}
            alt=""
            fetchPriority="high"
          />
        </picture>
        <canvas ref={canvas} className="sequence__canvas" aria-hidden="true" />

        <div className="sequence__beats">
          <div className="sequence__stage">
            <h1 id="hero-title" className="beat">
              <span className="beat__kicker">QBitLab</span>
              <span className="beat__line">AI that does the busywork.</span>
            </h1>
            <p className="beat">
              <span className="beat__line">Answers every customer.</span>
              <span className="beat__sub">Day and night, in your business’s voice.</span>
            </p>
            <p className="beat">
              <span className="beat__line">Picks up every call.</span>
              <span className="beat__sub">And writes down what the caller needs.</span>
            </p>
            <div className="beat">
              <p className="beat__line">Built around your business.</p>
              <div className="beat__actions">
                <a
                  className="pill"
                  href={bookingHref}
                  {...(bookingExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  Book a call
                </a>
                <a className="more" href="#conversations">
                  See what we build
                </a>
              </div>
            </div>
          </div>
        </div>

        <span className="sequence__cue" aria-hidden="true">
          Scroll to explore
        </span>
      </div>
    </section>
  );
}
