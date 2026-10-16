// Stamps the shared pieces in partials/ (head tags, header, cookie banner) into
// every page between their markers, so the pages stay plain HTML that works
// without a build but are edited in one place:
//
//   <!-- PARTIAL:header -->  ...replaced...  <!-- /PARTIAL:header -->
//
// In partials, {{nav:<page>}} becomes the active-link class on that page and the
// muted class elsewhere, like the app's header.
//
// Runs first in `npm run build` (so the legal pages, generated from the template,
// get the result too) and on its own with `npm run partials`. Commit the output.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGES = [
  { file: 'index.html', nav: null },
  { file: 'pricing.html', nav: 'pricing' },
  { file: 'contact.html', nav: 'contact' },
  { file: 'features.html', nav: null },
  { file: 'templates/legal-template.html', nav: null },
];
const ACTIVE = 'text-foreground';
const INACTIVE = 'text-muted-foreground';

const partials = {};
for (const file of fs.readdirSync(path.join(ROOT, 'partials'))) {
  if (file.endsWith('.html')) {
    partials[path.basename(file, '.html')] = fs.readFileSync(path.join(ROOT, 'partials', file), 'utf8').trimEnd();
  }
}

let failed = false;
for (const page of PAGES) {
  const pagePath = path.join(ROOT, page.file);
  let html = fs.readFileSync(pagePath, 'utf8');
  let count = 0;

  html = html.replace(
    /( *)<!-- PARTIAL:([\w-]+) -->[\s\S]*?<!-- \/PARTIAL:\2 -->/g,
    (block, indent, name) => {
      if (!(name in partials)) {
        console.error(`✗ ${page.file}: no partials/${name}.html`);
        failed = true;
        return block;
      }
      count++;
      const body = partials[name].replace(/\{\{nav:([\w-]+)\}\}/g, (_, nav) => (nav === page.nav ? ACTIVE : INACTIVE));
      return `${indent}<!-- PARTIAL:${name} -->\n${indent}${body}\n${indent}<!-- /PARTIAL:${name} -->`;
    }
  );

  fs.writeFileSync(pagePath, html);
  console.log(`✓ ${page.file}: ${count} partial${count === 1 ? '' : 's'}`);
}

if (failed) process.exit(1);
