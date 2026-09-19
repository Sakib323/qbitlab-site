/**
 * Every image the site ships, and where it came from.
 *
 * All of them are cut out: one object, on transparency, with no background of its
 * own, so it sits directly on the page. Most are rendered from the scene in
 * scripts/media/render/ (see README); the rest are photographs whose background
 * was lifted by scripts/media/cutout.swift.
 */

export type ObjectImage = {
  /** Base path under /public; variants are `${base}-900.webp` and `${base}-1800.webp`. */
  base: string;
  alt: string;
  /** Natural size of the -1800 variant, for aspect ratio. */
  width: number;
  height: number;
  /** Where the photograph came from. Null for images rendered for this site. */
  credit: { photographer: string; source: string; site: string } | null;
  /** Nudges how large this object is drawn, so the set carries equal weight. */
  scale?: number;
};

const rendered = (name: string, alt: string, width: number, height: number, scale = 1): ObjectImage => ({
  base: `/media/objects/${name}`,
  alt,
  width,
  height,
  credit: null,
  scale,
});

const photo = (
  name: string,
  alt: string,
  width: number,
  height: number,
  photographer: string,
  source: string,
  site: string,
  scale = 1,
): ObjectImage => ({
  base: `/media/objects/${name}`,
  alt,
  width,
  height,
  credit: { photographer, source, site },
  scale,
});

export const objects = {
  chatbots: rendered('chatbots', 'A speech bubble with three dots, mid-reply.', 1078, 969),
  'voice-agents': rendered(
    'voice-agents',
    'A phone mid-call, answered by the AI assistant, with a live waveform and transcript.',
    552,
    1140,
    1.3,
  ),
  'workflow-automation': photo(
    'workflow-automation',
    'A white robotic arm, jointed from base to head.',
    507,
    1800,
    'Kindel Media',
    'https://www.pexels.com/photo/9028874/',
    'Pexels',
    1.2,
  ),
  'knowledge-assistant': rendered(
    'knowledge-assistant',
    'A database with one document lifted out of it, a passage highlighted.',
    780,
    1325,
    1.2,
  ),
  'ai-websites': rendered('ai-websites', 'An open laptop showing a business website with a chat button.', 1343, 1110, 1.1),
  'landing-pages': rendered('landing-pages', 'A megaphone.', 1131, 1216),
  'mobile-apps': rendered('mobile-apps', 'A phone showing an app that lists the day’s handled work.', 484, 1001, 1.3),
  subscription: rendered('subscription', 'A calendar with one date marked.', 815, 905, 0.92),
  'extensions-plugins': rendered('extensions-plugins', 'A jigsaw piece.', 1103, 1079, 0.95),
  'always-on': rendered('always-on', 'A wireless earbud, just lifted out, beside its charging case.', 852, 848),
} satisfies Record<string, ObjectImage>;

/**
 * The scroll-scrubbed hero: 120 frames rendered from scripts/media/render/, in
 * two framings. Landscape keeps the phone clear of the copy on its left;
 * portrait puts it below the copy.
 */
export const sequence = {
  frames: 120,
  landscape: { path: '/media/sequence/landscape/frame_', width: 2400, height: 1350 },
  portrait: { path: '/media/sequence/portrait/frame_', width: 1080, height: 1920 },
  extension: '.webp',
  pad: 3,
};

export const frameUrl = (set: { path: string }, index: number) =>
  `${set.path}${String(index + 1).padStart(sequence.pad, '0')}${sequence.extension}`;

/** The photographs, for the footer's credits. */
export const photoCredits = Object.values(objects).filter(
  (image): image is ObjectImage & { credit: NonNullable<ObjectImage['credit']> } => image.credit !== null,
);
