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
tokens in `assets/site.css` mirror the app's `globals.css`. The cookie-banner
answer is shared with the app through a cookie on `.synthpatch.io`
(`synthpatch-consent`), so a visitor only answers it once.

## Synth embeds

The homepage synths use the app's patch embed
(`https://app.synthpatch.io/embed/<public patch id>?mode=interactive|static&bg=transparent`),
the same one the app's Share → Embed dialog generates. The hero embeds a blank
public DFAM patch; "Your Patches, Precisely Stored" embeds a saved patch in static
mode next to a copy of its Patch Data JSON.

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