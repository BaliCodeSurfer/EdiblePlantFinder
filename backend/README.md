# Plant ID Proxy (FastAPI)

Lightweight, production-style proxy that keeps your Plant.id / Kindwise API key server-side.

## Why this exists

The React Native app must never contain the secret key. This service accepts a base64 image from the mobile client, attaches the key, forwards the request to `api.plant.id`, and returns only the identification result.

## Tech choices

- FastAPI + Pydantic v2 for type safety and automatic validation/docs
- `httpx` for async outbound calls
- `pydantic-settings` for clean 12-factor configuration
- Structured logging and lifespan events
- CORS middleware ready for both local dev and production origins

## Local development

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# copy and fill the key
cp .env.example .env
# edit .env and paste your PLANT_ID_API_KEY

uvicorn app.main:app --reload
```

The server runs at http://localhost:8000.

Interactive docs: http://localhost:8000/docs

Health check: http://localhost:8000/health

## Environment variables

| Variable            | Required | Default | Description |
|---------------------|----------|---------|-------------|
| `PLANT_ID_API_KEY`  | yes      | —       | Your Kindwise Plant.id key |
| `PLANT_ID_URL`      | no       | full v3 URL with details | Override if you need different fields |
| `CORS_ORIGINS`      | no       | `*`     | Comma-separated list of allowed origins (use your production domain in prod) |

## Production deployment (cheap & simple)

### Render.com (recommended free tier)

1. Push this folder to a GitHub repo (or the whole monorepo with a `backend/` subdir).
2. Create a new Web Service on Render.
3. Settings:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add the `PLANT_ID_API_KEY` environment variable in the dashboard.
5. Deploy. You get a public HTTPS URL automatically.

Free tier sleeps after 15 min of inactivity — fine for a personal/portfolio app.

### Alternatives

- Fly.io: `fly launch` then `fly deploy`
- Railway, Google Cloud Run, etc.

## Updating the React Native client

Point `services/plantId.js` at your new endpoint. The client now obtains a JWT automatically via the public `/session` endpoint on first use:

```js
const SERVER_URL = "https://your-render-service.onrender.com";

let cachedToken = null;

async function ensureToken() {
  if (cachedToken) return;
  const res = await fetch(`${SERVER_URL}/session`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  cachedToken = data.access_token;
}

export async function identifyPlant(base64Image) {
  await ensureToken();
  const res = await fetch(`${SERVER_URL}/identify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cachedToken}`,
    },
    body: JSON.stringify({ image_base64: base64Image }),
  });
  if (!res.ok) throw new Error(await res.text());
  const { result } = await res.json();
  return result;
}
```

Remove the old hardcoded key and the `hasApiKey` check.

## Security notes

- The Plant.id API key never leaves the server.
- Clients obtain a JWT by calling the public `/session` endpoint (no secret required).
- The JWT is signed with `JWT_SECRET_KEY` and expires after ~30 days (configurable).
- Rate-limit the `/session` and `/identify` endpoints in production to protect your Plant.id quota.
- In production, set `CORS_ORIGINS` to your actual app's origin(s) instead of `*`.

## Next steps for a stronger portfolio piece

- Add request logging / structured JSON logs
- Persist identification history (SQLite + SQLAlchemy)
- Accept `multipart/form-data` uploads instead of base64
- Add pytest + GitHub Actions
- Dockerize with a slim production image

This service is intentionally small but demonstrates clean architecture, proper secret handling, and production concerns — exactly what interviewers look for.
