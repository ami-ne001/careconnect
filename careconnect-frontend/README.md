# CareConnect Frontend

React 18 + TypeScript + Vite + MUI + Tailwind CSS. Talks to the API gateway at `http://localhost:8088`.

## Prerequisites

- Node.js 18+
- api-gateway (8088) and auth-service (8081) running for login

## Setup

```bash
cd careconnect-frontend
npm install
cp .env.example .env   # optional — defaults to http://localhost:8088
npm run dev
```

Open **http://localhost:5173**

## Project structure

```
src/
├── api/              # axios instance + service modules
├── components/       # shared UI (layout, placeholders)
├── pages/            # screens per role (auth, admin, doctor, …)
├── routes/           # router config + ProtectedRoute / GuestRoute
├── store/            # Zustand auth state (persisted)
├── theme/            # MUI theme
└── types/            # TypeScript interfaces
```

## Environment

| Variable | Default |
|----------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8088` |

JWT is stored in `localStorage` as `cc_token`. Axios attaches `Authorization: Bearer <token>` on every request.

## Legacy UI

The previous mock prototype lives under `src/_legacy/` (if present) for visual reference when building new pages.
