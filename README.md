# Pit Wall

A Formula 1 tracker built on real timing data from [OpenF1](https://openf1.org). It has two pages: a live tracker, and a 2026 calendar with championship standings.

## Live tracker

- Replays any finished 2026 session (practice, qualifying, sprint or race) from real data, at 1×, 5× or 20× speed. A timeline lets you jump to any point.
- Draws the track map from real car GPS data, with every car moving on it.
- The timing tower shows positions, gaps, intervals, tyres with tyre age, pit stops, fastest lap, and positions gained or lost.
- A race control feed shows flags, safety cars, stewards' decisions and pit stops. The page also shows track status and weather.
- Click a car or a tower row to follow that driver.
- Keyboard: Space plays or pauses, ←/→ jumps 30 seconds, ↑/↓ switches driver.

## Calendar & standings

The real 2026 calendar, with cancelled rounds marked, a countdown to the next session, and replay buttons for every finished session. Standings show drivers and constructors after the latest race.

## Live data during sessions (optional)

OpenF1 data is free once a session has ended. Real-time data during a session needs OpenF1's paid plan.

1. Subscribe at <https://openf1.org> to get an OpenF1 username and password.
2. In Vercel, open the project, then **Settings → Environment Variables**, and add:
   - `OPENF1_USERNAME` with your OpenF1 username
   - `OPENF1_PASSWORD` with your OpenF1 password
3. Redeploy the project.

The site then shows a **Watch live** button during sessions. The key stays on the server, in `api/openf1.js`, and is never sent to visitors' browsers.

## Files

- `index.html`: the whole site, with no build step.
- `api/openf1.js`: the Vercel function that adds the live key to requests.

This is an unofficial fan project and is not associated with Formula 1.
