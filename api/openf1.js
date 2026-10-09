// Vercel serverless function: proxies OpenF1 requests and adds the live-data token.
// Live mode turns on when OPENF1_USERNAME and OPENF1_PASSWORD are set in the Vercel project's
// environment variables. Without them, GET /api/openf1?status=1 reports { live: false } and the
// site uses OpenF1's free historical data directly from the browser.

const ALLOWED = new Set([
  'car_data', 'drivers', 'intervals', 'laps', 'location', 'meetings', 'pit', 'position',
  'race_control', 'sessions', 'session_result', 'starting_grid', 'stints', 'weather'
]);

let token = null;
let tokenExpires = 0;

async function getToken() {
  const username = process.env.OPENF1_USERNAME;
  const password = process.env.OPENF1_PASSWORD;
  if (!username || !password) return null;
  if (token && Date.now() < tokenExpires - 60_000) return token;
  const r = await fetch('https://api.openf1.org/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ username, password }).toString()
  });
  if (!r.ok) throw new Error('OpenF1 token request failed with status ' + r.status);
  const j = await r.json();
  token = j.access_token;
  tokenExpires = Date.now() + (Number(j.expires_in) || 3600) * 1000;
  return token;
}

module.exports = async (req, res) => {
  const raw = (req.url || '').split('?')[1] || '';
  const params = new URLSearchParams(raw);

  if (params.has('status')) {
    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.status(200).json({ live: Boolean(process.env.OPENF1_USERNAME && process.env.OPENF1_PASSWORD) });
  }

  const ep = params.get('ep');
  if (!ALLOWED.has(ep)) return res.status(400).json({ error: 'Unknown endpoint' });

  // Forward the original query string untouched (keeps filters like date>=... intact), minus "ep".
  const forward = raw.split('&').filter((p) => p && !p.startsWith('ep=')).join('&');

  try {
    const t = await getToken();
    const upstream = await fetch(`https://api.openf1.org/v1/${ep}?${forward}`, {
      headers: t ? { Authorization: 'Bearer ' + t } : {}
    });
    const body = await upstream.text();
    res.setHeader('Content-Type', 'application/json');
    // Short shared cache so many viewers polling the same URL cost one upstream request.
    res.setHeader('Cache-Control', 'public, s-maxage=2, stale-while-revalidate=5');
    return res.status(upstream.status).send(body);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
};
