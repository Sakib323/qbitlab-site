import { objects, type ObjectImage } from './media';

export type Service = {
  /** Deep-link anchor, e.g. qbitlab.tech/#voice-agents */
  id: string;
  name: string;
  /** The problem, in the owner's own words. */
  hook: string;
  /** What we build, in plain language. */
  body: string;
  /** Supporting specifics for the few who look for them. */
  includes: string[];
  image: ObjectImage;
};

export type Chapter = {
  id: string;
  /** The chapter's name — the section heading. */
  title: string;
  /** The large statement under the heading. */
  statement: string;
  /** Intro paragraph; `lead` renders emphasized, `rest` follows it. */
  lead: string;
  rest: string;
  dark?: boolean;
  services: Service[];
};

export const chapters: Chapter[] = [
  {
    id: 'conversations',
    title: 'Customer conversations',
    statement: 'Never miss a customer again.',
    lead: 'Customers message at midnight and call while you’re busy with someone else.',
    rest: 'We build AI chatbots and voice agents that answer in your business’s voice, handle the common questions, and pass the rest to you.',
    services: [
      {
        id: 'chatbots',
        name: 'AI chatbots & assistants',
        hook: 'The same questions, answered by hand, all day.',
        body: 'An assistant trained on your business that answers customers on your website or messaging apps, day and night, and hands the conversation to a person when one should step in.',
        includes: ['Website chat', 'Messaging apps', 'Custom assistants', 'Machine learning'],
        image: objects.chatbots,
      },
      {
        id: 'voice-agents',
        name: 'AI voice agents',
        hook: 'Every missed call is a customer who rang someone else.',
        body: 'A voice agent that answers your phone, handles the common questions, and takes down the caller’s details, so calls are covered even when you can’t pick up.',
        includes: ['Answering calls', 'Common questions', 'Caller details', 'Hand-off to a person'],
        image: objects['voice-agents'],
      },
    ],
  },
  {
    id: 'automation',
    title: 'Automation',
    statement: 'The busywork, handled.',
    lead: 'Hours disappear into copying details between apps and hunting through documents.',
    rest: 'We connect the tools you already use and add AI where a step needs judgment, so the work moves on its own.',
    dark: true,
    services: [
      {
        id: 'workflow-automation',
        name: 'Workflow automation',
        hook: 'Copying the same details from one app into another.',
        body: 'We connect your forms, email, spreadsheets, and CRM with n8n, Make, or Zapier, so information moves by itself, with AI handling the steps that need judgment.',
        includes: ['n8n', 'Make', 'Zapier', 'AI steps'],
        image: objects['workflow-automation'],
      },
      {
        id: 'knowledge-assistant',
        name: 'Company knowledge assistant',
        hook: 'The answer is in a document somewhere. Nobody knows which one.',
        body: 'An internal assistant that answers your team’s questions from your own documents and policies, and shows where each answer came from. Built for growing and mid-size companies.',
        includes: ['RAG', 'Your documents', 'Answers with sources'],
        image: objects['knowledge-assistant'],
      },
    ],
  },
  {
    id: 'websites-apps',
    title: 'Websites & apps',
    statement: 'Everything your business runs on.',
    lead: 'A website that works, a page for every campaign, and the apps your customers carry.',
    rest: 'Designed and built with AI where it helps, and available on a monthly plan if you’d rather not pay for it all up front.',
    services: [
      {
        id: 'ai-websites',
        name: 'AI websites',
        hook: 'A website that looks fine and does nothing.',
        body: 'A fast, modern website with AI built in, from a chat assistant to enquiry capture, so it works for the business instead of just sitting there.',
        includes: ['Design & build', 'AI features', 'Enquiry capture'],
        image: objects['ai-websites'],
      },
      {
        id: 'landing-pages',
        name: 'Landing pages',
        hook: 'Paying for ads that land on the wrong page.',
        body: 'One focused page for one offer or campaign, designed and built to turn visitors into enquiries.',
        includes: ['Campaign pages', 'Offer pages', 'Enquiry forms'],
        image: objects['landing-pages'],
      },
      {
        id: 'mobile-apps',
        name: 'AI mobile apps',
        hook: 'An app idea, and no team to build it.',
        body: 'Mobile apps with AI features, designed and built from the first screen to launch.',
        includes: ['App design', 'AI features', 'Launch'],
        image: objects['mobile-apps'],
      },
      {
        id: 'subscription',
        name: 'Apps & web services on subscription',
        hook: 'You need custom software, not a large upfront bill.',
        body: 'Get a mobile app or web service on a monthly subscription instead of paying for one large project up front.',
        includes: ['Mobile apps', 'Web services', 'Monthly plan'],
        image: objects.subscription,
      },
      {
        id: 'extensions-plugins',
        name: 'Browser extensions & plugins',
        hook: 'Your tool, inside the software people already use.',
        body: 'Browser extensions and WordPress, Shopify, and Figma plugins, published to the marketplaces where your users are already looking.',
        includes: ['Browser extensions', 'WordPress', 'Shopify', 'Figma'],
        image: objects['extensions-plugins'],
      },
    ],
  },
];

export const services: Service[] = chapters.flatMap((c) => c.services);
