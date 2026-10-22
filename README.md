# Ideale Haushaltshilfe – Website

Mehrseitige Website (HTML5 + Tailwind CSS) für eine nach § 45a SGB XI anerkannte Haushaltshilfe.

## Struktur

```
├── src/
│   ├── pages/        ← Inhalte der einzelnen Seiten (hier bearbeiten)
│   ├── partials/     ← head.html, header.html, footer.html (gelten für ALLE Seiten)
│   └── input.css     ← Tailwind + eigene Komponenten (.btn-primary, .card …)
├── images/           ← Bilder (relative Pfade: images/…)
├── js/main.js        ← Mobiles Menü, Budget-Rechner
├── build.js          ← Setzt Seiten zusammen → dist/  (Firmendaten in SITE!)
├── tailwind.config.js← Farben (brand = Logo-Grün, navy = Logo-Blau), Schriften
└── netlify.toml      ← Build-Einstellungen für Netlify
```

## Lokal arbeiten (VS Code)

```bash
npm install      # einmalig
npm run dev      # Vorschau auf http://localhost:8080, aktualisiert sich bei Änderungen
npm run build    # Produktions-Build nach dist/
```

## Deployment (GitHub → Netlify)

1. Ordner als GitHub-Repository hochladen (`dist/` und `node_modules/` werden per `.gitignore` ausgelassen).
2. In Netlify: *Add new site → Import from GitHub* → Repository wählen. Build-Befehl und Ordner werden aus `netlify.toml` übernommen.
3. Formulare (`rueckruf`, `erstberatung`) erscheinen automatisch unter *Netlify → Forms*. Dort E-Mail-Benachrichtigung einrichten.

## Vor dem Livegang ausfüllen ⚠️

- `build.js` → `SITE`: Domain, Telefon, E-Mail, Adresse, Inhaber, IK-Nummer
- Kundenstimmen auf der Startseite (nur echte Bewertungen – § 5b UWG)
- Stundensatz + Kündigungsfrist in der FAQ (`kostenuebernahme.html`)
- Anerkennende Behörde / Aktenzeichen (`uber-uns.html`, `impressum.html`)
- Impressum und Datenschutzerklärung rechtlich prüfen lassen
- Fehlende Bilder: `images/waesche-textilpflege.jpg`, `images/einkaufen-begleitung.jpg` (Stellen im Code mit 📷 markiert)

Suche im Projekt nach `PLATZHALTER` bzw. `[` findet alle offenen Stellen.
