# Product Pulse — Analytics Dashboard

A daily health instrument for a PM on a matrimonial app. Signal band up top flags what moved, seven analysis tabs, six segment filters.

Vite + React. Vercel auto-detects the framework, so no config needed.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

**Option A — GitHub (your usual flow)**

```bash
git init
git add .
git commit -m "Product Pulse analytics dashboard"
git remote add origin git@github.com:nidhiiiiihere/product-pulse.git
git push -u origin main
```

Then on vercel.com: New Project → import the repo → Deploy. Build settings auto-fill (`vite build`, output `dist`). You get the shareable link once it finishes.

**Option B — Vercel CLI (fastest, no GitHub step)**

```bash
npm i -g vercel
vercel        # first run links/creates the project
vercel --prod # gives you the production shareable URL
```

The `--prod` URL is the one to share.
