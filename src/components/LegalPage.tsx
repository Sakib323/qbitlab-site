import Link from 'next/link';
import type { ReactNode } from 'react';
import { SITE } from '@/content/site';

/**
 * The shell for plain-text legal pages: a bare bar with the wordmark, the text,
 * and a copyright line. Deliberately not the homepage nav, whose links are
 * scroll anchors that only exist on `/`.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="survey__bar">
        <div className="wrap">
          <Link className="localnav__title" href="/">
            QBitLab
          </Link>
        </div>
      </header>

      <main id="main" className="legal">
        <div className="wrap legal__inner">
          <h1 className="legal__title">{title}</h1>
          <p className="legal__updated">Last updated {updated}</p>
          {children}
        </div>
      </main>

      <footer className="survey__foot">
        <div className="wrap">
          Copyright © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </div>
      </footer>
    </>
  );
}
