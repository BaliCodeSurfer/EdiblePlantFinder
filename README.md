# Edible Plant Finder

A mobile-first application that lets users photograph wild plants and instantly determine whether they are safe to eat. The app captures a photo on-device, sends it to a secure backend, and returns rich identification results including common names, edibility, toxicity warnings, and confidence scores.

The core technical challenge was calling a paid third-party machine learning API securely from an unauthenticated mobile client without exposing the API key. I solved this by building a lightweight FastAPI proxy that:

- Keeps the Plant.id API key server-side
- Issues short-lived JWTs for anonymous client sessions
- Applies per-IP rate limiting using `slowapi`
- Implements exponential backoff retries with `tenacity` for transient failures (network errors, 5xx, 429)
- Is fully Dockerized with healthchecks and deployed via Infrastructure-as-Code (`render.yaml` Blueprint) on Render

The backend includes 10 focused tests covering authentication, validation, retry logic, and rate limiting. The entire stack can be run locally with a single `docker compose up --build` command.

This project demonstrates production-oriented thinking around security, resilience, observability, testing, and modern deployment practices — skills I bring to senior full-stack engineering roles.

## Tech Stack

- **Mobile**: React Native (Expo) with **TypeScript**
- **Backend**: FastAPI, Pydantic, `httpx`, `tenacity`, `slowapi`
- **Infrastructure**: Docker, `docker-compose`, Render Blueprint (`render.yaml`)

## Live Demo

- Backend API docs: [https://plant-id-proxy.onrender.com/docs](https://plant-id-proxy.onrender.com/docs)

## Getting Started

### Prerequisites

- Docker Desktop (recommended) or Node.js + Python 3.12+
- A Plant.id API key (get one at [plant.id](https://plant.id))

### Run locally with Docker (recommended)

```bash
# 1. Clone the repository
git clone https://github.com/txlee1/EdiblePlantFinder.git
cd EdiblePlantFinder

# 2. Start the backend
cd backend
cp .env.example .env
# Edit .env and add your PLANT_ID_API_KEY and JWT_SECRET_KEY
docker compose up --build
```

The backend will be available at http://localhost:8000.

### Run the React Native app

```bash
cd ..  # back to project root
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or run on a simulator.

## Project Structure

```
EdiblePlantFinder/
├── App.tsx                    # Main React Native entry point (TypeScript)
├── types.ts                   # Shared TypeScript interfaces
├── services/plantId.ts        # API client for the backend
├── components/                # CameraScreen, ResultCard (TypeScript)
├── styles.ts                  # StyleSheet definitions
├── backend/                   # FastAPI proxy service
│   ├── app/
│   │   ├── main.py            # FastAPI app + routes
│   │   ├── services.py        # Plant.id integration + retry logic
│   │   ├── auth.py            # JWT session handling
│   │   ├── config.py          # 12-factor settings
│   │   └── schemas.py         # Pydantic models
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── render.yaml            # Render Blueprint
│   └── README.md              # Detailed backend documentation
└── README.md                  # This file
```

## Backend Documentation

For detailed information about the FastAPI service, environment variables, deployment, and testing, see:

- [`backend/README.md`](backend/README.md)

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built as a portfolio and passion project to demonstrate senior-level full-stack engineering skills.