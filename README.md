# Ask Kushal — AI-powered portfolio site

A one-page portfolio with two things that actually run, not just describe themselves:

1. **Ask Kushal** — a live chat backed by Claude (Anthropic's API), grounded only in your resume/project
   content (see `api/knowledge.js`), so it answers recruiter questions about your background instead of a
   generic chatbot.
2. **A live ownership-hierarchy demo** — a from-scratch recreation of the Financial Sponsors hierarchy
   visualizer from your resume: edit a leaf value, watch every parent total recalculate.

Everything else (experience, projects, skills, contact) is a normal static section.

---

## What you need before deploying

1. A **GitHub account** (you already have one: `github.com/PottaKushal`).
2. A **free Vercel account** — sign up at [vercel.com](https://vercel.com) with "Continue with GitHub" so it's
   already linked.
3. A **free Anthropic API key** — sign up at [console.anthropic.com](https://console.anthropic.com), go to
   **API Keys**, create one. New accounts get a small free credit grant; after that this app is extremely
   cheap to run (a portfolio-traffic amount of chat messages should cost cents to low dollars a month — each
   reply is capped at 500 tokens). You can also set a hard spend limit in the Anthropic console under
   **Settings → Limits** so it can never run away on you.

Keep the API key private — never paste it into the HTML/JS files or commit it to GitHub. It only ever goes
into Vercel's environment variable settings (step 3 below).

---

## Deploy steps

### 1. Push this folder to a new GitHub repo

```bash
cd ask-kushal
git init
git add .
git commit -m "Initial version of AI-powered portfolio site"
git branch -M main
git remote add origin https://github.com/PottaKushal/ask-kushal.git   # create this repo on GitHub first (empty, no README)
git push -u origin main
```

### 2. Import the repo into Vercel

- Go to [vercel.com/new](https://vercel.com/new), pick the `ask-kushal` repo.
- Framework preset: choose **"Other"** (this isn't Next.js/React — it's static HTML + one serverless
  function in `/api`, which Vercel supports natively).
- Leave build settings as default (no build command needed) and click **Deploy**.

### 3. Add your API key

- In the Vercel project, go to **Settings → Environment Variables**.
- Add `ANTHROPIC_API_KEY` = your key from console.anthropic.com, for the **Production** (and Preview, if you
  want) environment.
- Redeploy (Vercel → Deployments → ⋯ → Redeploy) so the function picks up the new variable.

You'll get a live URL like `ask-kushal.vercel.app`. Test the chat there.

### 4. (Optional) Custom domain

If you own a domain (or want to buy `kushalpotta.dev` or similar for ~$10-15/yr), add it under
**Settings → Domains** in Vercel and follow the DNS instructions. Otherwise the default `*.vercel.app` URL is
totally fine to put on a resume.

### 5. Put the link on your resume

Add it next to your LinkedIn/GitHub line, e.g.:
`kushalkumarpotta@gmail.com | linkedin.com/in/kushal-kumar-potta | github.com/PottaKushal | ask-kushal.vercel.app`

---

## Testing locally (optional, before you deploy)

```bash
npm install -g vercel      # one-time
cd ask-kushal
cp .env.example .env       # then put your real key in .env
vercel dev
```

This runs the static site *and* the `/api/chat` serverless function locally at `localhost:3000`.

---

## Updating the content later

- **Resume/experience text shown on the page**: edit the relevant `<section>` in `index.html`.
- **What the AI chat knows about you**: edit `api/knowledge.js` — this is the entire "knowledge base" the
  model is grounded in. Update it whenever your resume changes (new internship, new project, etc.) so the
  chat never gets out of sync with what's on the page. Push to GitHub and Vercel auto-redeploys.
- **Hierarchy demo data**: the sample company names/values are illustrative, in `hierarchy.js` near the top
  (the `tree` object) — change them to whatever story you want to tell, or leave as-is since it's clearly
  a demo.

## How the chat actually works (for when someone asks you in an interview)

- Every message you send goes to a Vercel serverless function (`api/chat.js`), never directly to Anthropic
  from the browser — this keeps your API key server-side and lets you rate-limit abuse (capped at 20
  requests/minute per IP, in-memory).
- The function sends your conversation plus a fixed **system prompt** (`api/knowledge.js`, your full resume
  and project context) to Claude, and the model is instructed to answer only from that document.
- This is a lightweight, "context-stuffing" form of retrieval-augmented generation — appropriate because a
  resume-sized knowledge base easily fits in one prompt. If you wanted the "harder" version with a real
  vector database and chunked retrieval (closer to the Confluence assistant you built at JPMorgan), that's a
  natural next iteration to mention if asked "how would you scale this."
