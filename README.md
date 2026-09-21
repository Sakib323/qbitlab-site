# qbitlab.tech

QBitLab's official site, built as an Apple-style product page, and the reference build for future client sites.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/ — needs a contact path set first (src/content/site.json)
```

## Where things live

| To change | Edit |
|---|---|
| Services: copy, chapter, object image | `src/content/services.ts` |
| Image credits, sizing, and sequence settings | `src/content/media.ts` |
| Past projects (drafts show in dev only) | `src/content/projects.ts` |
| Booking link, WhatsApp number, form endpoint | `src/content/site.json` |
| Colors, type, spacing | tokens at the top of `src/app/globals.css` |
| The scroll-scrubbed hero | `src/components/SequenceHero.tsx` |
| Page order | `src/app/page.tsx` |

## The image-sequence hero

The hero is a canvas scroll clip. The section pins for about four viewports while 120 WebP frames
draw onto a `<canvas>` in step with the scroll, and GSAP ScrollTrigger drives both the frames and
the four lines of copy.

- **Fast first paint.** Frame 1 is a plain `<img>` inside a `<picture>`, preloaded, so the first
  paint needs no JavaScript.
- **Progressive loading.** Frames load coarse to fine (every 8th frame first), and the canvas always
  draws the nearest frame that has arrived, so scrubbing works before everything loads.
- **Two framings.** Landscape screens get `public/media/sequence/landscape` (2400×1350) with the
  phone clear of the copy; portrait screens get `portrait` (1080×1920) with the phone below it.
- **Reduced motion.** Nothing scrubs. The hero becomes a still poster with every statement stacked.

## Images

Every image is one object on transparency, with no background of its own.

```bash
node scripts/media/render.mjs hero          # rewrites public/media/sequence/{landscape,portrait}
node scripts/media/render.mjs stills --out /tmp/objects   # the rendered objects, as PNGs
node scripts/media/render.mjs preview --p 0.35 --out /tmp # one hero frame, for tuning the scene
npm run media:objects -- /tmp/objects       # PNGs -> public/media/objects/<name>-{900,1800}.webp
```

The hero and five of the service objects are modelled in `scripts/media/render/` and rendered by
headless Chrome, so they need no licence and can be re-rendered after any copy change. The screen
content lives in `screen.js`; the objects in `objects.js`; the lighting in `studio.js`.

The remaining objects are photographs. To add one, put the photo through the cutout tool, which
uses the Vision framework built into macOS, then encode it with the same command as above:

```bash
swift scripts/media/cutout.swift photo.jpg /tmp/objects/name.png --choke 1 --largest
```

Then add the file to `src/content/media.ts` with its alt text, size, and credit — a photograph
without a credit there is a bug, and the footer renders what it finds.

## The survey

`/survey/` is the outreach form: it asks a business what eats up its week, so there is something
real to build from. Questions and option lists live in `src/content/survey.ts`.

Answers post to whatever `contact.surveyEndpoint` in `src/content/site.json` points at. Until it is
set, the page still builds and the build prints a warning — the form has nowhere to save to.

`scripts/survey-sheet.gs` turns a Google Sheet into that endpoint: it appends one row per answer,
adds columns it has not seen before, and emails a copy. Its own header comments carry the five-step
setup. Any endpoint accepting a `POST` with a JSON body works instead; the request is sent as
`text/plain` so it stays free of a CORS preflight, which a Google Apps Script cannot answer.

Send a separate link per recipient to see who replied:

```
https://qbitlab.tech/survey/?ref=barbaras-flowers
```

`ref` is saved with the answer and is otherwise ignored. Submit the form once after setting the
endpoint and check the row arrives — a wrong deployment setting fails silently until you do.
