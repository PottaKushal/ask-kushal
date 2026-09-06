# Kushal Kumar Potta — portfolio site (v3, full redesign)

An impact-led portfolio: a bold homepage that leads with numbers, two deep-dive case study pages, and a live
interactive demo embedded in one of them. No backend, no API keys, nothing to configure — fully static.

## Pages

- `index.html` — homepage: hero with a stat strip, two case-study cards, a grid of smaller projects, a
  compact experience/education timeline, skills, and contact.
- `case-study-migration.html` — deep dive on the JPMorgan cost-center migration, AI chatbot, Confluence RAG
  assistant, and infra work (AWS ECS, Airflow/EMR, S3, GBIQ/CBCMP, PII masking).
- `case-study-hierarchy.html` — deep dive on the Financial Sponsors ownership-hierarchy tool, with a live,
  click-to-edit recreation of the interaction pattern embedded on the page.
- `hierarchy.js` — the interactive demo logic (pure SVG + vanilla JS, no dependencies). All company names and
  values in it are intentionally fictional (checked against real companies) — see the comment at the top of
  the file before changing them.
- `styles.css` — the whole design system: color tokens, typography (Space Grotesk + Inter via Google Fonts),
  and every component style.

## Deploy steps (GitHub Pages)

Same as before — this is still a fully static site, multiple HTML files work with GitHub Pages with zero
configuration:

1. `github.com/PottaKushal/ask-kushal` → **Settings** → **Pages**.
2. Source: **Deploy from a branch** → branch `main`, folder `/ (root)` → **Save**.
3. Your live URL (e.g. `pottakushal.github.io/ask-kushal`) updates automatically on every push to `main`.

## Testing locally

```bash
cd ask-kushal
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Check both `index.html` and the two case study pages, and click into the
hierarchy demo on the hierarchy case-study page.

## Updating content later

- **Homepage copy, stats, project cards**: edit `index.html` directly.
- **Case study narrative**: edit the relevant `case-study-*.html` file — each follows a Problem → What I
  built → Impact structure; keep that shape when you add detail.
- **Colors/type/spacing**: everything lives in the `:root` variables at the top of `styles.css`.
- **Hierarchy demo data**: `hierarchy.js`, the `tree` object near the top. Keep names obviously fictional.
