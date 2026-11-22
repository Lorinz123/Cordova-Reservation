# Cordova Reservation Portal Frontend

This React frontend follows the folder responsibilities in the teacher's [React Recipe Book structure guide](https://github.com/arielmaestrodev/react-recipe-book/blob/main/docs/frontend-structure-and-api-guide.md), adapted for barangays, equipment, and reservations.

## Source folders

```text
src/
├── assets/                 # Figma images and icons
├── components/
│   ├── common/             # Shared portal header
│   ├── context/            # Signed-in user and session state
│   ├── features/           # Auth, equipment, admin, reservation UI
│   └── ui/                 # Reusable controls
├── lib/                    # Shared fetch client, cookies, and CSRF
├── pages/
│   ├── admin/              # Reservation review and barangay setup
│   ├── auth/               # Login, signup, email verification
│   └── user/               # Equipment, personal reservations, notifications
├── services/               # Named functions for backend API operations
├── styles/                 # Global styles and portal styles
├── types/                  # Shared TypeScript data types
├── App.tsx                 # Screen composition and application state
└── main.tsx                # App entry point and auth provider
```

## Request flow

Pages compose feature components. Feature and page actions call a named function in `services/`. Those functions use the shared `lib/api.ts` client, which sends cookies and obtains a CSRF token for requests that change data.

```text
Page → Feature component → Service → Shared API client → Backend
```

## Run locally

1. Start the backend from the `backend` folder with `npm run dev`.
2. Copy `.env.example` to `.env.local` in this folder. The default API URL is `http://localhost:7000/api`.
3. Start the frontend from this folder with `npm run dev`.

The backend's `FRONTEND_URL` must match the Vite address, usually `http://localhost:5173`, because sign-in uses credentialed browser requests and HttpOnly cookies.

## Build

Run `npm run build` to type-check and create the production frontend in `dist/`.
