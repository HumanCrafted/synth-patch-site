# Synth Patch Brand Site

Professional brand site for Synth Patch - Interactive Synthesizer Patch Management.

## Overview

This is a static HTML site with Tailwind CSS (CDN approach) that showcases Synth Patch. The site features an interactive demo, marketing content, and auto-generated legal pages.

**Live Site:** https://synthpatch.io

## Project Structure

```
.
├── index.html              # Main homepage (live synths embedded from the app)
├── contact.html           # Contact form page
├── privacy-policy.md      # Privacy Policy source
├── terms-of-service.md    # Terms of Service source
├── templates/
│   └── legal-template.html   # Template for legal pages
├── partials/              # Head tags, header, cookie banner shared by every page
├── assets/                # site.css (design tokens), tailwind-config.js, site.js
├── scripts/
│   ├── apply-partials.js     # Stamps partials/ into each page
│   ├── convert-markdown.js   # Markdown → HTML converter
│   └── update-synths.js      # Synth grid from the app's synth list
└── brand-assets/          # Logos, favicons, images
```

## Shared header, theme and cookie banner

The header, cookie banner and head tags live in `partials/` and are copied into
each page between `<!-- PARTIAL:name -->` markers by `npm run partials` (also the
first step of `npm run build`). Edit the partial, run the script, commit the pages.

The header mirrors the app's (synth-patch-ui `SimpleLayout.tsx`), and the design
tokens in `assets/site.css` mirror the app's `globals.css`. The theme and the
cookie-banner answer are shared with the app through cookies on `.synthpatch.io`
(`synthpatch-theme`, `synthpatch-consent`), so a choice made on either site
carries over.

## Live synths

The homepage synths are the app's own panel, framed from
`app.synthpatch.io/embed/synth/<slug>` (`?patch=<public patch id>`, `?panel=1`
for the Patch Data panel). `assets/site.js` sizes the frames and drives Reset and
"Use as a new patch" over postMessage. On localhost the frames load from
`http://localhost:3000`, so run the app (`npm run dev` in synth-patch-ui) alongside
a static server for the site (e.g. `npx serve -l 8080 .`).

## Technologies

- **HTML/CSS:** Static pages with Tailwind CSS (CDN)
- **Fonts:** Space Grotesk (headings), IBM Plex Mono (technical)
- **Analytics:** Umami Analytics (privacy-focused)
- **Forms:** Formspree (contact form)
- **Build:** Node.js + marked.js (for markdown conversion)

## Documentation

See `/docs` folder for detailed documentation:
- Design system and technical architecture
- Analytics setup and event tracking
- Development roadmap