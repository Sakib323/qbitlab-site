import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { SITE } from '@/content/site';
import { frameUrl, sequence } from '@/content/media';
import './globals.css';

// Inter is the closest open face to the neo-grotesque of the Apple reference.
// next/font downloads it at build time and serves it from this site.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  axes: ['opsz'],
});

const description =
  'QBitLab builds AI chatbots, voice agents, and workflow automations for small and growing businesses, plus the websites, apps, and plugins they run on.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'QBitLab — AI that does the busywork',
    template: '%s — QBitLab',
  },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE.url,
    siteName: SITE.name,
    title: 'QBitLab — AI that does the busywork',
    description,
    images: [{ url: frameUrl(sequence.landscape, 43), width: 2400, height: 1350 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QBitLab — AI that does the busywork',
    description,
    images: [frameUrl(sequence.landscape, 43)],
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* The first sequence frame is the first thing painted: fetch it early. */}
        <link rel="preload" as="image" href={frameUrl(sequence.landscape, 0)} media="(orientation: landscape)" />
        <link rel="preload" as="image" href={frameUrl(sequence.portrait, 0)} media="(orientation: portrait)" />
      </head>
      <body>{children}</body>
    </html>
  );
}
