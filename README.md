# Interiors by Ashwiinii Dongare

A responsive Next.js, React, TypeScript and Motion portfolio for the Pune-based residential interior design studio. The existing black, white, and orange visual theme, opening animation, and scroll effects are retained.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` exports production files to `out/`.

## Content and assets

- `lib/content.ts`: studio identity, contact details, founder biography, social profiles, services, FAQs, and room-based gallery collections.
- `app/about/page.tsx`: founder story, studio facts, and team disciplines. It uses the supplied 2019 founding date. There are no invented employee identities, client testimonials, satisfaction percentages, or project counts.
- `components/site.tsx`: shared branding, gallery cards, founder statements, social gallery, navigation, contact, and footer.
- `lib/ashwiinii-assets.json`: source and local asset mapping, including optimized WebP paths. Photos, the founder portrait, and the studio mark are from the studio’s public website: https://ashwiiniidongare.com/ and https://ashwiiniidongare.com/gallery/.
- `app/brand.css`: branding and content-specific responsive sizing. General styles remain in `app/globals.css` and animation styles in `app/motion.css`.

The four existing `/works/[slug]` URLs remain available to preserve previous links. Their content now presents room-based collections (living and dining, bedrooms, kitchens and storage, details and finishes), with actual studio photography. Collections do not claim unverified project names, dates, budgets, or completion durations.

The homepage hero uses the user-provided image at `public/images/ashwiinii/herosection.jpg`. Studio photography remains in portfolio, services, team, and social-gallery sections.

All four social destinations use direct Instagram, Facebook, LinkedIn and YouTube links. The footer includes the requested “Designed and developed by Work Globally” credit. Contact details are sourced from https://ashwiiniidongare.com/contact-us-2/; one consistent published number is used throughout.

## Forms

The contact form and newsletter need configured submission endpoints. Until configured, they explicitly report that no submission was sent and direct visitors to the studio’s phone, email or social profiles.

Set before building:

```text
NEXT_PUBLIC_CONTACT_ENDPOINT=https://your-api.example/contact
NEXT_PUBLIC_NEWSLETTER_ENDPOINT=https://your-api.example/newsletter
```

Endpoints receive JSON via POST and must return a successful HTTP status only after accepting the submission. Configure backend validation, spam protection, delivery and CORS there. Secrets must stay on the backend. A static export does not provide server-side message delivery.

## Animation and accessibility

`lib/motion.ts` centralizes motion settings. `components/page-motion.tsx` contains the reusable preloader, hero entrances, intro lifecycle and viewport reveals. The longer studio name automatically fits the preloader width and uses capped character staggers to retain the original sequence length.

The intro replays on a fresh homepage load or refresh, but not internal navigation. It uses no session storage. A six-second deadline restores scrolling and interaction even if animations stall; CSS and no-JavaScript fallbacks keep content readable if hydration fails. Reduced motion skips directly to usable content.

Internal links use a separate warm ivory curtain through `components/route-transition.tsx`. It sweeps up over the current page, changes routes once fully covered, then lifts away from the destination. The destination image gets a bounded 250ms decode window. A five-second recovery deadline restores interaction and completes the requested navigation if animation playback stalls. Reduced motion bypasses the sweep; same-page anchors, external links, modifier-clicks, downloads and browser history retain their native behavior. The menu unmounts immediately on selection and has no dimming shadow. The refresh preloader is not replayed by route transitions.

`components/arrow-icon.tsx` provides the shared rounded SVG arrows. The large contact action uses a compact orange circle; decorative SVGs are hidden from assistive technology.

Entrance scaling and scroll translation use separate layers. Hero parallax and fade reverse on upward scrolling. The ticker loops independently and pauses offscreen. The portfolio title sticks at 72px and releases within the project section. Mission text is scroll-linked. The founding-year figure animates once; other studio facts display as text.

## Verification

```sh
npm run typecheck
npm run test:e2e
npm run build
```

Playwright uses installed Google Chrome, reusing a local server on port 3000 or starting one. The suite covers letter ordering and centering, refresh, navigation/history, slow images, stalled-animation recovery, reduced motion, parallax, ticker continuity, sticky bounds, responsive widths, anchors, mission text, late hydration and no JavaScript.

Visual direction originally reconstructed from the Revana template by Lunis Design: https://lunisdesign.com/framer-templates/revana. Recovered reference settings and reconstructed timings are distinguished in `lib/motion.ts`; exact pixel parity is not claimed.
