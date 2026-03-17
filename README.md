# Digital Asset Management Platform (Frontend)

React + Vite frontend for the Digital Asset Management (DAM) platform.

## Prerequisites

- Node.js 18+ (recommended)
- Backend API running (see `backend/`), or point the UI to an existing API

## Setup

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

By default the app runs on `http://localhost:3000`.

## Environment variables

Create a `.env.local` file in `frontend/` (optional).

### Required / commonly used

- **`VITE_API_URL`**: Base URL for the backend API (including `/api`).
  - **Default**: `http://localhost:3001/api`
  - **Example**:

```bash
VITE_API_URL=http://localhost:3001/api
```

## Scripts

- **`npm run dev`**: start Vite dev server
- **`npm run build`**: production build
- **`npm run test`**: run unit tests (Vitest)
- **`npm run test:watch`**: watch mode
- **`npm run test:ui`**: Vitest UI runner
- **`npm run lint`**: run ESLint
- **`npm run format`**: format with Prettier
- **`npm run format:check`**: check formatting (CI-friendly)

## Features (UI)

- **Authentication**: login/signup screen (JWT-based)
  - Token is stored in `localStorage` (`dam_jwt`)
  - Protected API calls (upload/delete/update-tags) include `Authorization: Bearer <token>`
- **Dashboard**: statistics + charts
- **Asset Gallery**: search/filter/sort + preview modal
- **Uploads**: drag-and-drop upload with progress + polling until processing completes

## Project structure

Key folders/files:

```
src/
  components/        UI components (dashboard, gallery, upload, auth)
  hooks/             React hooks (auth, assets, upload)
  services/          API client (fetch wrappers) + mock data utilities
  utils/             shared helpers (file validation, etc.)
  types.ts           shared app types
  App.tsx            app shell + view switching + auth gating
  main.tsx           React entrypoint (AuthProvider wiring)
```

## Design decisions (high level)

- **No router**: the app switches between views using local state in `App.tsx`.
- **Auth is global**: `AuthProvider` in `src/hooks/useAuth.ts` ensures login state is shared across the app and survives refresh via `localStorage`.
- **API wrapper**: `src/services/api.ts` centralizes calls and token handling (`setAuthToken`).

## Troubleshooting

### Upload/Delete fails with 401

- Ensure you are logged in.
- Ensure `VITE_API_URL` points to the backend you are running.
- Confirm the backend has JWT enabled and you’ve run migrations (`backend`: `npm run migrate`).

### CORS errors

- Backend CORS origin must allow the frontend URL (see backend config `FRONTEND_URL`).

## Related docs

- Backend: see `backend/README.md` (if present) and `backend/src/routes/*`.
- Platform overview: `frontend/src/README.md` (contains broader full-stack notes).
