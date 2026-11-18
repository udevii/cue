# Cue

Cue is a streaming app prototype I built to work on web, phones and TV. You can browse it like a normal streaming app, or just type what you're in the mood for ("something funny under 30 minutes") and it finds something.

I mostly wanted to test two things:

1. Can the same components work right with a mouse, a phone and a TV remote?
2. Can you ask for something in plain words and have the app show you how it understood you, so you can fix it if it got it wrong?

## What's in it

- Home screen with a featured banner, Continue watching, Top 10, Live now, "Because you watched" and a few mood rows
- TV mode: move around with the arrow keys (or the remote on screen), Enter to select, Esc or Backspace to go back. Each row remembers which card you were on.
- Works on phones too. It uses container queries, so the phone preview is the real layout.
- Loading placeholders, an error with Try again if a row fails, and an empty My List screen
- **Ask Cue**: type a request and an AI model picks titles from the catalog. It shows how it read your request as chips you can remove, and each pick says why it was chosen. If the AI isn't available it uses a simpler keyword matcher instead.
- A **Prototype controls** panel for testing, where you can switch devices, slow down the network, make a row fail on purpose or turn off motion

All the shows, people and channels are made up. The poster art is generated SVG, so there are no image files.

## Running it

```bash
npm install
cp .env.example .env.local   # optional, add AI_API_KEY (an Anthropic API key) for AI answers
npm run dev                  # http://localhost:3000
```

Without an API key, Ask Cue still works using the keyword matcher.

Other scripts:

```bash
npm run typecheck     # TypeScript check
npm run build         # production build
npm run build:demo    # makes one HTML file in dist/cue.html that runs with no server
```

## Deploying

1. Push it to GitHub.
2. On Vercel, go to Add New → Project, import the repo and deploy. The defaults work.
3. If you want AI answers, add `AI_API_KEY` (an Anthropic API key) under Settings → Environment Variables and redeploy.

## How it's set up

```
app/
  page.tsx                 Next.js page
  api/catalog/route.ts     catalog (?latency=ms to fake a slow network)
  api/trending/route.ts    Top 10 ids (?fail=1 to fake an outage)
  api/discover/route.ts    Ask Cue, uses AI or the keyword matcher
src/
  types.ts                 shared types, including CueApi
  data/catalog.ts          fake catalog
  lib/api.ts               two versions of CueApi: server and in-browser
  lib/discover.ts          prompt, checking the AI's answer, keyword matcher
  lib/spatialNav.ts        arrow key navigation
  components/              App, Hero, Rail, Card, Poster, AskCue, Overlays, Controls
  styles/cue.css           all the styles
demo/                      entry for the single file build
```

The whole UI talks to one interface, `CueApi`. One version calls the Next.js API routes and the other runs in the browser, so the same components work as the full app and as the single-file demo.
