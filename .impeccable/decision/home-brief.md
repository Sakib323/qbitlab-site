# Home — qbitlab.tech

Scope: the single-page official site (home route). Visitor mode: **Persuade**.
Audience: non-technical SMB owners. Action: book a call, send an inquiry, or message on WhatsApp.
Proof: named past projects only (draft-gated until supplied); illustrations of how a service works are labeled as illustrations.
Constraints: static export, no server; contact endpoints and WhatsApp number supplied later via `src/content/site.ts`.

## Direction contract

THESIS: QBitLab's services set as a design annual's plate section: one continuous near-white sheet where a live 3D qubit is the registered plate, its state arrow turning to each service as you scroll. It refuses the AI-agency default of a glowing neural blob on black above a card grid.

OWN-WORLD: Uncoated near-white sheet #F5F4F6 drifting to #FAF6F5 and #EEF3EF at the edges; ink #16181A, never black; 1px #C9C7C4 hairlines build the grid; crosshair marks register every plate corner; an 8px dot matrix fills voids; one periwinkle #DCDDF3 seal with a rotating text ring. One grotesque at weight 400 for display and body; an 11px mono in caps at 0.14em for credits, tokens, and controls. Zero-radius ink rects. The plate render is untinted glass and steel.

STORY: A busy SMB owner reads in one line that QBitLab builds AI that does the busywork. Scrolling the plate section, they find their own problem named in plain words under one of nine services while the qubit turns to it. They see how an engagement runs, then book a call, send an inquiry, or message on WhatsApp.

FIRST VIEWPORT: A 72px sticky bar: monogram and wordmark left, mono nav tokens center, WhatsApp token and outline Book a call rect right. Left half: a 400-weight display headline over three lines, two lines of plain subcopy, a filled ink Book a call rect, and a dot matrix in the void beside it. Right half: the live qubit plate with crosshairs at its corners and the periwinkle seal half off its lower-left corner; a mono credit row beneath names the current state. A hairline closes the viewport. Signature interaction: as each service entry crosses the reading line, the qubit's arrow swings to that service's direction and the credit row updates; dragging the plate tilts the sphere. Motion grammar: scroll-bound state change, the seal's 25s ring, instant ink inversions on controls; no parallax, no section-entrance fades.

FORM: Design annual plate section on uncoated near-white stock — the dealt challenger `design-annual-s-plate-section`, chosen by the user over the assigned direction; seed key 989d4790.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions

- Booking URL, form endpoint, WhatsApp number (`src/content/site.ts`).
- Real past projects (`src/content/projects.ts`, draft-gated).
- Logo: the monogram is provisional.
