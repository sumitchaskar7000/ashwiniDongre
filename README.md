# Revana Studio

A responsive Next.js App Router / React / TypeScript reconstruction of the Revana architecture portfolio. Includes Home, About, Works, four detailed case studies, and a custom 404.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` produces a portable static export in `out/`. `npm run typecheck` checks TypeScript.

## Edit

- `lib/content.ts`: central studio identity, email, project content, canonical years, related projects, services, FAQs.
- `components/site.tsx`: shared navigation, forms, service selector, accordion, carousel, metrics, and footer.
- `app/globals.css`: responsive typography, spacing, layouts, and motion.
- `lib/asset-map.json`: reference media URLs, local paths, descriptions and focal points. Gallery mappings are stored under `pages`.
- `app/about/page.tsx`: illustrative team and partner content.

This is an independent demonstration. Team profiles, metrics, project narratives, partners and testimonials are sample content. Photography was downloaded from the user-provided reference for the requested reconstruction; confirm your rights to use it or replace it with licensed project photography before commercial use. Original design: Lunis Design, https://lunisdesign.com/framer-templates/revana.

## Forms

Forms deliberately show a demonstration message and do not claim delivery when endpoints are absent. To enable delivery, set these variables before building:

```text
NEXT_PUBLIC_CONTACT_ENDPOINT=https://your-api.example/contact
NEXT_PUBLIC_NEWSLETTER_ENDPOINT=https://your-api.example/newsletter
```

Endpoints receive JSON via POST and must return a successful HTTP status only after accepting the submission. Configure CORS for your site origin, validation, spam protection and an email/newsletter provider in that backend. No credentials belong in `NEXT_PUBLIC_` variables. Static hosting does not provide server-side form delivery by itself.

## Notes

Uses locally stored photography, next/image, next/font (Inter), and Motion for React. Menu supports Escape, focus trapping and restoration. Native forms validate required fields and email addresses. Motion respects reduced-motion preferences. No-JavaScript content remains readable; animated counters render final values initially. The navigation, service selector, accordion, carousel and forms require JavaScript.

The reference’s unpublished animation timelines have not been recovered. This implementation uses reconstruction timings, rewritten demo copy and a custom error page; exact pixel parity is not claimed.
