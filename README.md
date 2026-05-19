# Edible Plant Finder

A polished React Native experience for identifying wild plants and determining whether they are safe to eat. The app emphasizes smooth micro-interactions, thoughtful motion design, and robust accessibility to create a trustworthy, delightful interface for a safety-critical use case.

## UI & Interaction Highlights

- **Spring-based animations** built with React Native's built-in `Animated` API:
  - Photo capture: scale + fade "pop" entrance
  - Analyze button: press-scale feedback + loading pulse while waiting for results
  - Result card: slide-up + fade entrance on successful identification
- **Full semantic accessibility** using `accessibilityRole`, `accessibilityLabel`, and `accessibilityHint` throughout — designed so screen readers can navigate the entire flow meaningfully
- **Responsive large-screen layout**: photo preview scales to ~60% of screen height (with max cap) on tablets and wide screens, with larger touch targets and centered content
- **Safety-first design**: a pragmatic toxicity classifier that distinguishes genuine danger warnings from "safe / non-toxic" descriptions returned by the underlying ML API
- **Error boundary**: catches unhandled runtime errors and renders a friendly fallback screen rather than crashing — with error reporting hooks ready for Sentry/Datadog in production
- **Frontend tests** using `@testing-library/react-native` covering rendering states, accessibility props, and the toxicity safety logic

The app is built end-to-end with a production-grade FastAPI backend that handles third-party ML API calls securely, rate limiting, retries with exponential backoff, and Dockerized deployment. This demonstrates not only strong UI craft but also the ability to deliver a complete, resilient product experience.

This project showcases attention to motion, accessibility, and interaction quality — skills I bring to senior UI engineering roles.

## Tech Stack

- **Mobile**: React Native (Expo) with **TypeScript**
- **Backend**: FastAPI, Pydantic, `httpx`, `tenacity`, `slowapi`
- **Infrastructure**: Docker, `docker-compose`, Render Blueprint (`render.yaml`)
- **CI/CD**: GitHub Actions (TypeScript type checking + pytest)

## Demo

[Download demo video (84 MB)](https://github.com/BaliCodeSurfer/EdiblePlantFinder/releases/download/Demo/RPReplay_Final1778988151.MOV)

Additional links:

- Backend API docs: [https://plant-id-proxy.onrender.com/docs](https://plant-id-proxy.onrender.com/docs)

## Testing

### Frontend

```bash
npm test
```

Runs the React Native test suite with Jest and React Native Testing Library. Currently covers `ResultCard` (rendering states, accessibility, toxicity logic) and `ErrorBoundary` (fallback UI and reset behavior).

### Backend

See [`backend/README.md`](backend/README.md) for `pytest` instructions and test details.

## CI & Testing

This project uses GitHub Actions for continuous integration:

- TypeScript type checking on every push and pull request
- Frontend tests (`npm test`) on every push and pull request
- Python tests (`pytest`) on the backend
- Manual trigger support via `workflow_dispatch`

You can view the latest CI runs in the **Actions** tab of the repository.

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
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI (TypeScript + pytest)
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

## Notes & Limitations

The Plant.id API was trained exclusively on plant imagery. Non-plant objects (cars, pets, etc.) may still return low-confidence plant predictions. Always cross-reference results with a trusted field guide before foraging.

## License

This project is open source and available under the [MIT License](LICENSE).