import { LocalNav, type NavItem } from '@/components/LocalNav';
import { PageMotion } from '@/components/PageMotion';
import { Research } from '@/components/Research';
import { AlwaysOn, Chapter, Contact, Footer, Handles, Intro, Process, Work } from '@/components/Sections';
import { SequenceHero } from '@/components/SequenceHero';
import { projects } from '@/content/projects';
import { SITE } from '@/content/site';

// A Server Component: only the interactive pieces — nav, hero sequence, tabs,
// research diagram, page motion, and inquiry form — ship JavaScript.
export default function Home() {
  const nav: NavItem[] = [
    { href: '#conversations', label: 'Conversations' },
    { href: '#automation', label: 'Automation' },
    { href: '#websites-apps', label: 'Websites & apps' },
    { href: '#how-it-works', label: 'How it works' },
    ...(projects.length > 0 ? [{ href: '#work', label: 'Work' } as NavItem] : []),
    { href: '#research', label: 'Research' },
    { href: '#contact', label: 'Contact' },
  ];

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <a className="pill skip-link" href="#main">
        Skip to content
      </a>
      <span id="top" />
      <LocalNav items={nav} />
      <main id="main">
        <SequenceHero />
        <Intro />
        <Chapter index={0} />
        <AlwaysOn />
        <Handles />
        <Chapter index={1} />
        <Chapter index={2} />
        <Process />
        <Work />
        <Research />
        <Contact />
      </main>
      <Footer nav={nav} />
      <PageMotion />
    </>
  );
}
