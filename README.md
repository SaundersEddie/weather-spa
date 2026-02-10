# Weather Compare SPA

A two-panel weather comparison app built with React and Open-Meteo.  
Designed to quickly compare **home vs destination** weather with zero API keys and no backend.

## Features

- 🔍 ZIP code lookup (US)
- 🏠 Two independent panels (Home / Destination)
- ⏱️ Current conditions + next 24 hours
- 📅 7-day forecast
- 🌡️ °C / °F toggle
- 💾 ZIP + unit persistence via localStorage
- 🧪 Unit tests (Vitest + Testing Library)
- 🌐 E2E tests (Playwright, fully mocked)

## Tech Stack

- React + TypeScript
- Vite
- Bootstrap (layout + base UI)
- Open-Meteo API (no auth, no keys)
- Vitest + MSW (component/data tests)
- Playwright (mocked E2E)

## Getting Started

```bash
npm install
npm run dev
```

App runs at:
http://localhost:5173

## Tests

```bash
npm run test:run
npm run e2e
```

Notes

Open-Meteo is used directly from the client — no backend required.  
E2E tests mock all API traffic to ensure deterministic runs.  
This project intentionally favors clarity and maintainability over over-engineering.

## License

MIT
