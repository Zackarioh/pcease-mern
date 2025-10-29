# PCease (React SPA)

A faithful React migration of the original PCease static site with pixel/behavior parity.

## Quick start

Prereqs: Node 18+ and npm

- Install deps:
  - npm install
- Start dev server:
  - npm run dev
- Build for prod:
  - npm run build
- Preview production build:
  - npm run preview

Dev server runs at http://localhost:5173/

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
- Auth: LocalStorage-based auth ported (no backend).
- Data: componentsDB converted to ES module at src/shared/components-data.js.
- Share/import: Builder accepts base64-encoded JSON in `?build=` param.

## Folder structure

- src/App.jsx — Router + layout (NavBar, Footer)
- src/pages/\* — Ported pages
- src/styles/\* — Original page CSS
- src/lib/auth.js — Auth utilities
- src/lib/theme.js — Theme hook
- src/shared/components-data.js — Shared data

## Parity checks

- UI matches original pages (using original CSS classes/structure)
- Behavior parity for: theme toggle, auth, forum threads, browse filters/modal, builder compatibility and save/load/share, advisor presets and recommendations

If anything looks off, please file an issue or tweak the corresponding page JSX while keeping classes intact.
