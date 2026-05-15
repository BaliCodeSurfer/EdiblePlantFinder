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
- `tenacity` for retry with exponential backoff on transient failures
- `slowapi` for in-memory per-IP rate limiting (no Redis required)
- Docker + `docker-compose` for reproducible local development
- Render Blueprint (`render.yaml`) for Infrastructure-as-Code deployment
- Pytest for testing

## Local development (recommended)

The easiest way to run everything locally is with Docker Compose:

```bash
cd backend

# 1. Create your .env file
cp .env.example .env
# Edit .env and add your PLANT_ID_API_KEY and JWT_SECRET_KEY

# 2. Start the service
docker compose up --build
```

The server runs at http://localhost:8000.

Interactive docs: http://localhost:8000/docs  
Health check: http://localhost:8000/health

### Alternative: Run without Docker

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# copy and fill the key
cp .env.example .env
# edit .env and add your keys

uvicorn app.main:app --reload
```

## Environment variables

| Variable              | Required | Default       | Description |
|-----------------------|----------|---------------|-------------|
| `PLANT_ID_API_KEY`    | yes      | —             | Your Kindwise Plant.id key |
| `JWT_SECRET_KEY`      | yes      | —             | Secret used to sign session JWTs |
| `PLANT_ID_URL`        | no       | full v3 URL   | Override if you need different fields |
| `CORS_ORIGINS`        | no       | `*`           | Comma-separated list of allowed origins |
| `RATE_LIMIT`          | no       | `10/minute`   | Rate limit string (e.g. `100/hour`, `5/second`) |

## Production deployment

### Render.com (recommended)

This project is deployed using a Render Blueprint (`render.yaml`).

1. Push the repository (including `backend/render.yaml` and `backend/Dockerfile`).
2. In the Render Dashboard, go to **New → Blueprint** and select your repository.
3. Render will detect `render.yaml` and create the service with:
   - Runtime: Docker
   - Dockerfile: `backend/Dockerfile`
   - Build context: `backend/`
4. Add the required secrets (`PLANT_ID_API_KEY` and `JWT_SECRET_KEY`) in the dashboard.
5. Deploy.

Free tier sleeps after 15 min of inactivity — fine for a personal/portfolio app.

### Manual Docker deployment

```bash
docker build -t plant-id-proxy .
docker run -p 8000:8000 \
  -e PLANT_ID_API_KEY=your_key \
  -e JWT_SECRET_KEY=your_secret \
  plant-id-proxy
```

## Updating the React Native client

Point `services/plantId.ts` at your new endpoint. The client obtains a JWT automatically via the public `/session` endpoint:

```ts
const SERVER_URL = "https://your-render-service.onrender.com";

let cachedToken: string | null = null;

async function ensureToken(): Promise<void> {
  if (cachedToken) return;
  const res = await fetch(`${SERVER_URL}/session`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  cachedToken = data.access_token;
}

export async function identifyPlant(base64Image: string) {
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

> The React Native frontend is written in **TypeScript** (see root `README.md` for details).

## Security notes

- The Plant.id API key never leaves the server.
- Clients obtain a JWT by calling the public `/session` endpoint (no secret required).
- The JWT is signed with `JWT_SECRET_KEY` and expires after ~30 days (configurable).
- Per-IP rate limiting is applied on `/identify` using `slowapi`.
- All transient errors (network, 5xx, 429) are retried with exponential backoff.
- In production, set `CORS_ORIGINS` to your actual app's origin(s) instead of `*`.

## Next steps

- Persist identification history (SQLite + SQLAlchemy or Postgres)
- Expose rate-limit headers (`X-RateLimit-Remaining`, `Retry-After`)
- Add React Native component tests (Jest + React Native Testing Library)
- Add structured JSON logging + request correlation IDs
- Accept `multipart/form-data` uploads instead of base64
- Multiple pictures to identify a single plant

This service is intentionally small but demonstrates clean architecture, proper secret handling, resilience patterns, testing, and modern infrastructure-as-code practices — exactly what interviewers look for at the senior level.