# Project Green

Minimal, dependency-free Node server + tiny landing page.  
Runs on Replit without any `npm install`.

## Run
1. Create a Node.js Repl, import this repo (or copy files), name it something other than “Greenlight”.
2. Replit will use `.replit` to run: `node index.js`.
3. Visit the Repl URL → the landing page is served from `/`.

## API
- `GET /api/health`
- `POST /api/landing/publish` — `{ title, description, slug? }` → `{ slug }`
- `GET /api/landing/:slug`
- `POST /api/agent/run` — `{ agent: "idea_scout", idea, audience }` → stubbed result
