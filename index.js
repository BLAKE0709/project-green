const http = require('http');
const fs   = require('fs');
const path = require('path');

// In-memory store of published pages
const pages = {};

// --- API HANDLERS -----------------------------------------------------------
function handleAPI(req, res) {
  const url = new URL(req.url, 'http://localhost');

  // Health check
  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'healthy',
      service: 'project-green',
      timestamp: new Date().toISOString()
    }));
  }

  // Publish a landing page: POST /api/landing/publish { title, description, slug? }
  if (url.pathname === '/api/landing/publish' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    return req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const slug = data.slug || Math.random().toString(36).slice(2, 7);
        pages[slug] = {
          title: data.title || 'Untitled',
          description: data.description || '',
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ slug, status: 'published' }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }

  // Fetch published page: GET /api/landing/:slug
  if (url.pathname.startsWith('/api/landing/') && req.method === 'GET') {
    const slug = url.pathname.replace('/api/landing/', '');
    if (pages[slug]) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(pages[slug]));
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  // Mock agent: POST /api/agent/run { agent, idea, audience }
  if (url.pathname === '/api/agent/run' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    return req.on('end', () => {
      let result = { message: 'agent not implemented' };
      try {
        const input = JSON.parse(body || '{}');
        if (input.agent === 'idea_scout') {
          result = {
            onePager: {
              problem: `${input.audience || 'Audience'} struggles to start ${input.idea || 'an idea'}`,
              offer:   `A tiny 7-day plan to ship the first version of ${input.idea || 'the idea'}`,
              channelHints: ['DMs', 'Email list', 'Local groups']
            },
            outreach: [
              'Quick question—can I show you a 60-sec preview?',
              'I’m offering 3 free pilots in exchange for feedback—interested?',
              'What’s the #1 thing that would make this useful to you today?'
            ]
          };
        }
      } catch {}
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
  }

  return false;
}

// --- STATIC SERVER ----------------------------------------------------------
function serveStatic(req, res) {
  const safe = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(__dirname, 'public', safe);
  const ext = path.extname(filePath).toLowerCase();
  const mime = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'text/javascript',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.gif':  'image/gif'
  }[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/') && handleAPI(req, res)) return;
  serveStatic(req, res);
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Project Green running');
});
