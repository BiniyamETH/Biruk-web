const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const dirs = fs.readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory() && fs.existsSync(path.join(root, d.name, 'index.html'))).map(d => d.name);
const pages = ['index.html', ...dirs.map(d => `${d}/index.html`)];
const errors = [];
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
    const url = match[1];
    const target = path.join(root, url, url.endsWith('/') ? 'index.html' : '');
    if (!fs.existsSync(target)) errors.push(`${page}: missing ${url}`);
  }
  for (const match of html.matchAll(/href="(\/[^"]*|#[^"]+)"/g)) {
    const [url, id] = match[1].split('#');
    if (!id) continue;
    const target = url ? path.join(root, url, url.endsWith('/') ? 'index.html' : '') : path.join(root, page);
    if (fs.existsSync(target) && !fs.readFileSync(target, 'utf8').includes(`id="${id}"`)) errors.push(`${page}: missing anchor ${match[1]}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Checked ${pages.length} pages: local links, assets, and anchors resolve.`);
