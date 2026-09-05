# Kushal Kumar Potta — portfolio site

A one-page portfolio to link from your resume, built from the content on `Kushal Kumar Potta Resume 4.pdf`.

**What it is:**
- A clean hero, experience timeline, projects, skills, and contact section.
- **A live, interactive ownership-hierarchy demo** — a from-scratch recreation of the parent-child ownership
  visualizer you built for Financial Sponsors at JPMorgan. Click a leaf investment value to edit it and watch
  every parent total recalculate instantly (`hierarchy.js`, pure SVG + vanilla JS, no dependencies).

No backend, no API keys, no accounts, nothing to configure or ever get billed for. It's fully static.

---

## Deploy steps (GitHub Pages — free, no extra signups)

You already have this code in `github.com/PottaKushal/ask-kushal`. To make it a live site:

1. Go to your repo on GitHub → **Settings** → **Pages** (left sidebar, under "Code and automation").
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: `main`, folder: `/ (root)`. Click **Save**.
4. Wait a minute or two, then refresh that Pages settings page — it'll show your live URL, something like
   `https://pottakushal.github.io/ask-kushal/`.

Every time you `git push` to `main`, the live site updates automatically within a minute or so.

### Alternative: Vercel or Netlify

Either also hosts static sites for free — import the GitHub repo, leave build settings empty (there's no
build step), deploy. Useful mainly if you want a nicer custom-domain flow later.

### Put the link on your resume

`kushalkumarpotta@gmail.com | linkedin.com/in/kushal-kumar-potta | github.com/PottaKushal | pottakushal.github.io/ask-kushal`

---

## Testing locally

```bash
cd ask-kushal
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

---

## Updating the content later

- **Resume/experience text shown on the page**: edit the relevant `<section>` in `index.html`.
- **Hierarchy demo data**: the sample company names/values are illustrative, in `hierarchy.js` near the top
  (the `tree` object) — change them to whatever story you want to tell, or leave as-is since it's clearly a
  demo, not real portfolio data.
