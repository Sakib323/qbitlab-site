import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';
import { contact, SITE } from '@/content/site';

const description = 'The terms for using qbitlab.tech and for work QBitLab does for you.';

export const metadata: Metadata = {
  title: 'Terms',
  description,
  alternates: { canonical: '/terms/' },
  openGraph: { title: 'Terms — QBitLab', description, url: '/terms/' },
};

// Moves only when the terms' own text does.
const UPDATED = '19 October 2026';

export default function Terms() {
  const email = contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : 'us';

  return (
    <LegalPage title="Terms" updated={UPDATED}>
      <p>
        These terms cover two things: using {SITE.domain}, and work QBitLab (“we”, “us”) does for you. They’re
        written for businesses. If you’re buying as an individual rather than for a business, your legal
        rights as a consumer aren’t affected by anything here.
      </p>

      <h2>Using this website</h2>
      <p>
        You’re welcome to browse the site and use its forms for their intended purpose. Please don’t misuse
        it: no attempts to break or overload it, to get into parts you haven’t been invited to, or to send us
        anything unlawful or misleading. We may change or remove parts of the site at any time.
      </p>
      <p>
        The site’s design, text, and images belong to us or are used under licence. You can share a link to it
        freely, but please don’t copy it and present it as your own.
      </p>
      <p>
        What the site says about our services describes what we do in general. It isn’t an offer, and it isn’t
        a quote — those come in writing, as below.
      </p>

      <h2>Work we do for you</h2>
      <p>
        Before work starts, we agree in writing what we’ll build, what it will cost, and how it’s billed —
        once or monthly. That agreement is what governs the work. If it conflicts with these terms, the
        agreement wins, and anything it doesn’t cover falls back to these terms.
      </p>
      <p>
        We’ll do the work with reasonable care and skill, and we’ll tell you if something you ask for is
        outside what was agreed. A change to the scope is agreed in writing too, and may change the price or
        timing.
      </p>
      <p>To do our part, we need you to:</p>
      <ul className="legal__list">
        <li>give us accurate information, and the access we need, in good time</li>
        <li>make sure you’re entitled to give us any content, data, or accounts you ask us to work with</li>
        <li>tell us promptly if something isn’t working as you expected</li>
      </ul>
      <p>
        Dates we give are our best estimate. If we’re waiting on something from you, they move accordingly.
      </p>

      <h2>Fees and payment</h2>
      <p>
        You pay what the agreement says, when it says. If a payment is late, we may pause the work or the
        service until it’s settled. Prices exclude VAT where VAT applies. Third-party costs you’ve agreed to —
        such as messaging, phone, or AI usage charges — are passed on as agreed.
      </p>

      <h2>What you own</h2>
      <p>
        Your content, your customer data, and your business’s name and branding stay yours. We use them only
        to do the work you’ve asked for. Where we handle personal data on your behalf, we’ll agree the terms
        for that in the agreement, and the <Link href="/privacy/">privacy policy</Link> explains what we
        collect through this site.
      </p>
      <p>
        The agreement says who owns what we build. We keep ownership of the general tools, templates, and
        know-how we use across clients, and give you the right to use them as part of what we deliver. Parts
        made by others — fonts, stock images, AI models, software libraries — stay under their own licences.
      </p>

      <h2>AI, and what it can’t promise</h2>
      <p>
        The systems we build use AI, which can be wrong, and can give different answers to the same question.
        We test what we deliver against your real use, but we can’t promise it will be error-free or always
        available, and it isn’t legal, medical, financial, or other professional advice. Review anything it
        says or does on your behalf before relying on it where a mistake would matter.
      </p>
      <p>
        What we build often depends on services we don’t run — messaging platforms, phone networks, cloud
        providers, AI model providers. If one of them changes, goes down, or ends access, parts of your system
        may stop working. We’ll help you deal with it, but it isn’t something we control.
      </p>

      <h2>Our responsibility to you</h2>
      <p>
        Nothing in these terms limits anything the law doesn’t allow us to limit, including liability for
        death or personal injury caused by negligence, or for fraud.
      </p>
      <p>
        Beyond that, we aren’t liable for losses that weren’t a foreseeable result of our failing — such as
        lost profit, lost business, or lost data you hadn’t backed up — and our total liability for anything
        connected with a piece of work is limited to the fees you paid us for it in the 12 months before the
        claim. The site and anything on it that you haven’t paid for are provided as they are.
      </p>

      <h2>Ending things</h2>
      <p>
        Either of us can end an agreement as it provides, and either of us can end it for a serious breach the
        other hasn’t put right within a reasonable time of being told. If it ends, you pay for work done up to
        that point, and we’ll hand over what’s yours.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        If we change these terms, we’ll update this page and move the date at the top. A change doesn’t alter
        an agreement we’ve already made with you unless you agree to it.
      </p>

      <h2>Law and disputes</h2>
      <p>
        These terms are governed by the law of England and Wales, and the courts of England and Wales decide
        any dispute — though if you’re a consumer elsewhere in the UK, you can use your local courts. We’d
        always rather sort a problem out directly first.
      </p>

      <h2>Contact</h2>
      <p>Questions about any of this: {email}.</p>
    </LegalPage>
  );
}
