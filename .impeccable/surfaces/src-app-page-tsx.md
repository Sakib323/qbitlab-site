---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# Home — qbitlab.tech (v3)

Scope: the single-page official site (home route). Visitor mode: **Persuade**.
Audience: non-technical SMB owners. Action: book a call, send an inquiry, or message on WhatsApp.
Proof: named past projects only (draft-gated). Every image is a single object cut out on transparency — five rendered for this site, the rest licensed stock photographs with their background lifted. No people, no scenes, no client claims.
Constraints: static export; contact values in `src/content/site.json`; media provenance in `src/content/media.ts`.
Direction is brief-pinned by the user (2026-09-17): Apple AirPods Pro product page as the reference, and a "Canvas Scroll Clip" image-sequence scroll animation — not a live 3D model. Second pin, same day: every image is one object with no background of its own, blended into the page the way the AirPods renders are; services are stacked one per row, alternating object-left and object-right, never two in a row. v1 (design annual + live qubit) is archived in `.archive/v1-design-annual`; v2's circuit-board footage and service photography in `.archive/v2-*`.

## Direction contract

THESIS: QBitLab presented like an Apple product page, where the product is the assistant itself: a pinned black chapter in which a phone turns toward the reader and answers a customer, picks up a call, and lists the day's handled work, frame by frame with the scroll — then bright chapters where one object per service stands on the page with nothing behind it. It refuses the generic agency template of icon-card grids, stock hero gradients, and photographs of people at laptops.

OWN-WORLD: Apple product-page grammar. White #FFFFFF and #F5F5F7 fields with a pure #000 hero, a #000 automation chapter, and one #000 panel in "What it handles"; ink #1D1D1F, secondary gray #6E6E73; a blue #0071E3 pill for every primary action. One neo-grotesque (Inter) at 600 for giant headlines with tight tracking and at 19–24px for the service paragraphs, each opening with its bold name and continuing in gray. Objects float free of any card or frame. Small chapter titles above statements and the "QBitLab" line above the hero headline are kept deliberately, against the craft floor's ban, because the pinned reference uses exactly that device. Gradient text appears once, in the customer's quoted words, for the same reason.

STORY: An SMB owner watches a phone turn toward them on black and answer a customer, then a call, then show the day already handled. They pass a headphone bleeding off the right edge — always on — and a black panel quoting what customers actually ask. They scroll three chapters — conversations, automation, websites & apps — meeting one object and one paragraph per service, alternating side to side. They see how a project runs, then book a call, send an inquiry, or message on WhatsApp.

FIRST VIEWPORT: A frosted 52px local nav: QBitLab left, section links, blue "Book a call" pill right. Below it a full-bleed black canvas: the phone on the right, screen toward the reader on its lock screen — the back of the phone never appears, so the page never reads as being about a phone; "QBitLab" small and "AI that does the busywork." set left in white; a scroll cue beneath. Signature interaction: the section pins for about four viewports while 120 rendered frames scrub with the scroll — a message lands on the lock screen, the phone squares up as the chat opens, then a call, then the day's summary — and the copy hands off line by line until the last reveals a Book a call button. Nothing overlaps the phone, so no scrim is needed; in portrait the phone is centred with the copy above it, and the frame set follows the orientation at any size. Motion grammar: scroll-scrubbed image sequence, fade-up once per section, objects easing from 92% to full scale as they enter, and words of the quoted line arriving one at a time.

FORM: Brief-pinned by the user — Apple AirPods Pro page reference plus a Canvas Scroll Clip image sequence. No concept roll (a pinned direction beats the roll).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
