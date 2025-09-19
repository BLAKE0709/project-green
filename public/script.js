const out = document.getElementById('out');

document.getElementById('publish').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('desc').value;

  const r = await fetch('/api/landing/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });
  const data = await r.json();
  out.textContent = 'Published at /api/landing/' + data.slug + '\n' + JSON.stringify(data, null, 2);
});
