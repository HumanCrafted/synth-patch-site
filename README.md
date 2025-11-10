# Synth Patch Brand Site

Professional brand site for Synth Patch - Interactive Synthesizer Patch Management.

## Overview

This is a static HTML site with Tailwind CSS (CDN approach) that showcases Synth Patch. The site features an interactive demo, marketing content, and auto-generated legal pages.

**Live Site:** https://synthpatch.io

## Project Structure

```
.
├── index.html              # Main homepage
├── app-demo.html          # Interactive demo
├── contact.html           # Contact form page
├── privacy-policy.md      # Privacy Policy source
├── terms-of-service.md    # Terms of Service source
├── templates/
│   └── legal-template.html   # Template for legal pages
├── scripts/
│   └── convert-markdown.js   # Markdown → HTML converter
├── brand-assets/          # Logos, favicons, images
└── modern-sounds-pluto/   # Interactive synth components
```

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