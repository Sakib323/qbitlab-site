# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript + Tailwind — user's choice (2026-09-16), picked for SEO on
marketing sites. GSAP is user-mandated for motion. Three.js runs only offline, as a dev
dependency: `scripts/media/render.mjs` renders the hero's frames and the service objects in
headless Chrome, and the site itself ships no 3D (user's instruction, 2026-09-17: an image
sequence on a canvas, not a live 3D model).

Delivered as a **static export** deployed to Netlify from a private repo, `Sakib323/qbitlab-site`
(branch `main`) — GitHub Pages was ruled out because its terms exclude commercial/business sites,
and the legacy repo `sakib323/qbitlab.tech` (still serving a WordPress dump, DNS previously pointed
there) carries exposed `wp-config.php` history, so it isn't reused. Custom domain `qbitlab.tech` is
registered at Hostinger; DNS points at Netlify (apex A record → 75.2.60.5, `www` CNAME → the site's
`.netlify.app` subdomain). No server runtime: no API routes, no server actions, no image
optimization server. See [DEPLOY.md](DEPLOY.md) for the full cutover steps.

## Users

Non-technical small and medium business owners. They arrive wanting a business result — hours
saved, leads answered, customers served, a site or app live — not a technology. They do not
know or care what n8n, RAG, or an LLM is, and the site must not require them to.

## Product Purpose

QBitLab's official site (qbitlab.tech). It sells QBitLab's AI and software build services and
converts visitors into conversations. It also doubles as QBitLab's reference piece shown to
prospective clients, and becomes the base template for future client sites.

Success: an SMB owner understands within seconds what QBitLab can do for their business, finds
the service that matches their problem, and books a call, sends an inquiry, or messages on
WhatsApp.

## Positioning

A full-service AI build partner for SMBs, spanning automation, conversational AI, and shipped
software. One team covers what an SMB would otherwise piece together from several vendors.

Open decision: the sharper, uncopyable claim is not yet confirmed — do not invent one.

## Operating Context

Services offered (confirmed 2026-09-17):

- **Workflow automation build-outs** — n8n, Make, Zapier, combined with LLMs.
- **AI voice agents.**
- **AI mobile app development.**
- **AI website development.**
- **Chatbot and assistant development**, including ML programming.
- **RAG / internal knowledge-base implementation** for mid-size companies.
- **Landing pages.**
- **Mobile apps or web services on monthly subscription.**
- **Browser extensions and WordPress / Shopify / Figma plugins** (marketplace-distributed).

Lead capture (confirmed): book a call, project inquiry form, WhatsApp message. No email CTA.

## Capabilities and Constraints

- Static hosting means the inquiry form must post to a third-party form service
  (e.g. Formspree, Web3Forms). Provider not yet chosen.
- `qbitlab.tech` has **no MX records**: no `@qbitlab.tech` mailbox exists. Never show one.
- Open decisions, awaiting the user: booking URL (Cal.com / Calendly), form endpoint,
  WhatsApp number, subscription pricing, logo.
- Sector change: the previous business (Vitro, a VR education platform) is **retired**.
  None of its content, claims, or statistics carry over.

## Brand Commitments

- Name: **QBitLab** (capital Q, B, L), domain **qbitlab.tech**.
- No existing visual identity is being preserved; the old site is anti-reference only.

## Evidence on Hand

- Past projects: the user can name real ones but **has not supplied them yet**. Until they do,
  project entries are drafts and must not ship to production.
- **Absences that must not be fabricated:** client names, logos, testimonials, project
  results, delivery counts, years in business, team size, pricing.
- The market-growth figures in the brief (+49% voice agents, +92% AI mobile apps, +39% AI
  websites, +179% chatbots, +24% ML) are the user's internal research. **Not site copy**
  unless the user supplies a citable source.
- The retired Vitro site's figures (1500+ students, 250 users, 25 institutions) are void.

## Product Principles

1. **Outcomes before technology.** Lead with what changes for the business; tool names are
   supporting detail for the few who look for them.
2. **Show how it works, never claim what we haven't done.** Illustrate a service's mechanism
   freely; every factual claim about QBitLab must be real.
3. **Every path ends in a conversation.** Booking, inquiry, or WhatsApp is always one step away.
4. **The site is its own portfolio.** Its craft is evidence of the web and AI work being sold.
