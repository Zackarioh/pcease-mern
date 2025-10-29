# PCease (React SPA)

A faithful React migration of the original PCease static site with pixel/behavior parity.

## Quick start

Prereqs: Node 18+ and npm. For backend API: MongoDB (local or Atlas) and a JWT secret.

- Frontend (Vite React):

  - Install deps: `npm install`
  - Start dev server: `npm run dev` (http://localhost:5173)
  - Build for prod: `npm run build`
  - Preview production build: `npm run preview`

- Backend (Express + Mongo):
  - cd backend; `npm install`
  - Create `backend/.env`:
    - `MONGO_URI=mongodb://127.0.0.1:27017/pcease` (or your Atlas URI)
    - `JWT_SECRET=replace-with-a-dev-secret`
    - `PORT=5000` (optional)
  - Start API: `npm start` (http://localhost:5000)

### Seed initial component data (optional)

The app now reads components from MongoDB via the backend API. If you need to (re)seed:

- From project root: `npm --prefix backend run seed`
- The script will use `backend/scripts/components-seed.json` if present. If no seed file is found it will simply skip.

Dev servers:

- Frontend: http://localhost:5173/
- API: http://localhost:5000/

## Routes

- / — Home
- /browse — Browse Components
- /builder — PC Builder (import via ?build=<base64>)
- /query — Build Advisor (open result in Builder)
- /forum — Local forum (localStorage)
- /login — Login/Register (localStorage-backed)

## Notes

- Styling: Original CSS copied verbatim per page under src/styles to preserve look and feel.
- Theme: useTheme hook mirrors original data-theme behavior; toggle in header.
- Auth: Login/Register routed via backend API (`/api/register`, `/api/login`).
- Data: Components served by backend API (`/api/components`) from MongoDB.
- Share/import: Builder accepts base64-encoded JSON in `?build=` param.

## Folder structure

- src/App.jsx — Router + layout (NavBar, Footer)
- src/pages/\* — Ported pages
- src/styles/\* — Original page CSS
- src/lib/auth.js — Auth utilities
- src/lib/theme.js — Theme hook

## Parity checks

- UI matches original pages (using original CSS classes/structure)
- Behavior parity for: theme toggle, auth, forum threads, browse filters/modal, builder compatibility and save/load/share, advisor presets and recommendations

If anything looks off, please file an issue or tweak the corresponding page JSX while keeping classes intact.
