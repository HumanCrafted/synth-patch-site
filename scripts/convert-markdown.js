const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configuration for markdown files to convert
const files = [
  {
    markdown: 'privacy-policy.md',
    output: 'privacy-policy.html',
    title: 'Privacy Policy',
    description: 'Privacy Policy for Synth Patch - Learn how we collect, use, and protect your personal information.'
  },
  {
    markdown: 'terms-of-service.md',
    output: 'terms-of-service.html',
    title: 'Terms of Service',
    description: 'Terms of Service for Synth Patch - Please read these terms carefully before using our service.'
  }
];

// Read the HTML template
const templatePath = path.join(__dirname, '..', 'templates', 'legal-template.html');
const template = fs.readFileSync(templatePath, 'utf8');

console.log('Converting markdown files to HTML...\n');

files.forEach(file => {
  try {
    // Read the markdown file
    const markdownPath = path.join(__dirname, '..', file.markdown);
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');

    // Convert markdown to HTML
    const htmlContent = marked.parse(markdownContent);

    // Replace template placeholders
    let finalHtml = template
      .replace(/{{TITLE}}/g, file.title)
      .replace(/{{DESCRIPTION}}/g, file.description)
      .replace(/{{FILENAME}}/g, file.output)
      .replace('{{CONTENT}}', htmlContent);

    // Write the output file
    const outputPath = path.join(__dirname, '..', file.output);
    fs.writeFileSync(outputPath, finalHtml, 'utf8');

    console.log(`✓ Generated ${file.output} from ${file.markdown}`);
  } catch (error) {
    console.error(`✗ Error processing ${file.markdown}:`, error.message);
    process.exit(1);
  }
});

console.log('\n✓ All markdown files converted successfully!');
