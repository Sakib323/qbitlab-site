# Deploying qbitlab.tech

The site builds to plain static files in `out/`. Any static host serves it as-is.

## Before the first deploy

1. **Set at least one contact path** in `src/content/site.json`:
   - `contact.email` — an inbox that's actually read (needs working MX records)
   - `contact.bookingUrl` — a Cal.com or Calendly link
   - `contact.whatsappNumber` — international format, digits only, no `+`
   - `contact.formEndpoint` — a Formspree or Web3Forms form URL

   `npm run build` refuses to run until one is set, so a site with no way to reach you can't ship. Unset paths are hidden in production.
2. **Add real projects** in `src/content/projects.ts` and set `draft: false` on each. Drafts never appear in production, and the Work section and its nav link stay hidden until at least one real project exists.
3. Run `npm run build` and check `out/` locally, for example with `python3 -m http.server 4173 --directory out`.

## Host — Netlify

GitHub's own documentation says GitHub Pages is "not intended for or allowed to be used as a free web-hosting service to run your online business." A lead-generation site for a services company sits squarely in that gray area, so GitHub Pages was ruled out even though DNS for `qbitlab.tech` used to point there. Netlify's free plan carries no such restriction, deploys from **private** repositories at no extra cost, and — unlike Cloudflare Pages — supports a bare apex domain (`qbitlab.tech`, no `www`) with a single `A` record, so Hostinger stays the DNS host; no nameserver migration required.

1. Source lives in a private GitHub repo (`Sakib323/qbitlab-site`), connected to Netlify's own Git integration so every push to `main` builds and deploys automatically. `netlify.toml` in this repo sets the build command (`npm run build`) and publish directory (`out`).
2. Netlify site → Domain management → Add a domain → `qbitlab.tech`.
3. At Hostinger (DNS for `qbitlab.tech`), point the domain at Netlify:
   - `A` record, host `@`, value `75.2.60.5` (Netlify's load-balancer IP)
   - `CNAME` record, host `www`, value `<your-site-name>.netlify.app`
   Remove the old GitHub Pages `A` records (185.199.108–111.153) and the `www` CNAME to `sakib323.github.io`.
4. Netlify auto-provisions a Let's Encrypt certificate once DNS resolves (can take up to a few hours). HTTPS is enforced by default.

## Security: the old repository

`sakib323/qbitlab.tech` is public and its files include `wp-config.php` and a `.private/` directory from an old WordPress install. Replacing the files does not remove them from git history.

- Treat any database password or keys in that `wp-config.php` as exposed. Change them wherever they are still used.
- This project deploys from a fresh, private repository instead, so none of that history carries over.
