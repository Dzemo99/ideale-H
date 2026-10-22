/**
 * Mini-Build für die Website „Ideale Haushaltshilfe“
 *
 * Setzt jede Seite aus src/pages/*.html mit den gemeinsamen Bausteinen
 * aus src/partials/ (Head, Header, Footer) zusammen und schreibt das
 * fertige Ergebnis nach dist/. Netlify veröffentlicht den Ordner dist/.
 *
 *   npm run build   → einmalig bauen (wird auch von Netlify ausgeführt)
 *   npm run dev     → bauen, Änderungen beobachten, lokal unter http://localhost:8080 anzeigen
 *
 * Firmendaten (Telefon, E-Mail, Adresse, Domain) stehen NUR hier in SITE
 * und werden überall über {{site.xyz}} eingesetzt.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

// ⚠️ PLATZHALTER – bitte mit Ihren echten Daten ersetzen
const SITE = {
  url: 'https://www.ideale-haushaltshilfe.de',
  name: 'Ideale Haushaltshilfe',
  slogan: 'weil unser Herz mit schlägt',
  owner: 'Nestor Schulz',
  phone: '0551 50316976',
  phoneLink: '+4955150316976',
  mobile: '0178 2782978',
  mobileLink: '+491782782978',
  whatsappLink: 'https://wa.me/491782782978',
  email: 'info@ideale-haushaltshilfe.de',
  street: 'Göttinger Straße 61',
  zip: '31134',
  city: 'Hildesheim',
  hours: 'Mo – Fr 8:00 – 17:00 Uhr',
  ik: '000000000',
  year: new Date().getFullYear(),
};

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const read = (p) => fs.readFileSync(p, 'utf8');

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function fill(html, vars) {
  return html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
    const value = key.split('.').reduce((obj, k) => (obj == null ? undefined : obj[k]), vars);
    return value === undefined ? match : String(value);
  });
}

function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  copyDir(path.join(ROOT, 'images'), path.join(DIST, 'images'));
  copyDir(path.join(ROOT, 'js'), path.join(DIST, 'js'));
  copyDir(path.join(SRC, 'static'), DIST);

  // Selbst gehostete Schriften (DSGVO: keine Verbindung zu Google Fonts)
  const fonts = [
    ['@fontsource-variable/lora/files/lora-latin-wght-normal.woff2', 'lora.woff2'],
    ['@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2', 'source-sans-3.woff2'],
    ['@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-italic.woff2', 'source-sans-3-italic.woff2'],
  ];
  fs.mkdirSync(path.join(DIST, 'fonts'), { recursive: true });
  for (const [from, to] of fonts) {
    fs.copyFileSync(path.join(ROOT, 'node_modules', from), path.join(DIST, 'fonts', to));
  }

  const partials = {
    head: read(path.join(SRC, 'partials', 'head.html')),
    header: read(path.join(SRC, 'partials', 'header.html')),
    footer: read(path.join(SRC, 'partials', 'footer.html')),
  };

  const sitemap = [];
  for (const file of fs.readdirSync(path.join(SRC, 'pages')).filter((f) => f.endsWith('.html'))) {
    const raw = read(path.join(SRC, 'pages', file));
    const metaMatch = raw.match(/^<!--\s*meta\s*(\{[\s\S]*?\})\s*-->/);
    if (!metaMatch) throw new Error(`${file}: Meta-Block <!-- meta {...} --> fehlt am Dateianfang`);
    const meta = JSON.parse(metaMatch[1]);
    const content = raw.slice(metaMatch[0].length);

    const slug = file === 'index.html' ? '' : file;
    const page = {
      ...meta,
      canonical: SITE.url + '/' + slug,
      robots: meta.noindex ? 'noindex, follow' : 'index, follow',
    };

    // Aktiven Menüpunkt markieren (barrierefrei über aria-current)
    const header = partials.header.replace(
      new RegExp(`data-nav="${meta.nav}"`, 'g'),
      `data-nav="${meta.nav}" aria-current="page"`
    );

    const html = `<!doctype html>
<html lang="de">
<head>
${partials.head}
</head>
<body class="bg-cream font-sans text-navy-900 antialiased">
${header}
<main id="inhalt">
${content}
</main>
${partials.footer}
</body>
</html>
`;
    fs.writeFileSync(path.join(DIST, file), fill(html, { site: SITE, page }));
    if (!meta.noindex) sitemap.push({ loc: page.canonical, priority: meta.priority || '0.7' });
  }

  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap
  .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`)
  .join('\n')}
</urlset>
`
  );
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

  console.log(`✔ ${sitemap.length} Seiten nach dist/ gebaut`);
}

build();

if (process.argv.includes('--watch')) {
  const tailwind = spawn('npx', ['tailwindcss', '-i', 'src/input.css', '-o', 'dist/css/styles.css', '--watch'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });
  process.on('exit', () => tailwind.kill());

  let timer;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // CSS vor dem Löschen von dist/ retten, damit Tailwind nicht neu starten muss
      const cssPath = path.join(DIST, 'css', 'styles.css');
      const css = fs.existsSync(cssPath) ? read(cssPath) : null;
      try {
        build();
      } catch (err) {
        console.error('✖', err.message);
      }
      if (css) {
        fs.mkdirSync(path.dirname(cssPath), { recursive: true });
        fs.writeFileSync(cssPath, css);
      }
    }, 150);
  };
  for (const dir of [SRC, path.join(ROOT, 'images'), path.join(ROOT, 'js')]) {
    fs.watch(dir, { recursive: true }, rebuild);
  }

  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
  http
    .createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath.endsWith('/')) urlPath += 'index.html';
      let filePath = path.join(DIST, urlPath);
      if (!path.extname(filePath)) filePath += '.html';
      if (!filePath.startsWith(DIST) || !fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': types['.html'] });
        return res.end(fs.existsSync(path.join(DIST, '404.html')) ? read(path.join(DIST, '404.html')) : 'Nicht gefunden');
      }
      res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    })
    .listen(8080, () => console.log('➜ Vorschau: http://localhost:8080'));
}
