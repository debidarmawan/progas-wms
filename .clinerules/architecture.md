# Architecture & Structural Decisions — progas-wms (web)

Frontend dashboard for Progas WMS.
Stack: Next.js 16.2.6 (App Router), React 19.2, TypeScript strict, Tailwind CSS v4.

## 1. Runtime shape
- Next.js App Router. Root layout (`app/layout.tsx`) is a server component; every dashboard page is a client component (`"use client"`).
- No global state library — state is local React hooks (see `hooks/use-paginated-list.ts`).
- The route guard is `proxy.ts` (Next 16 renamed `middleware` to `proxy`). It redirects unauthenticated users away from `/dashboard/*` and authenticated users away from `/login`.

## 2. Directory map
```
app/
  login/                     login page
  dashboard/
    layout.tsx               DashboardShell (sidebar + toast host)
    <module>/page.tsx        list
    <module>/new/page.tsx    create
    <module>/[id]/page.tsx   detail
    <module>/[id]/edit/      edit
  api/v1/[...path]/route.ts  server-side proxy to the backend
components/
  ui/                        shared primitives
  layout/                    dashboard shell + sidebar
hooks/                       shared hooks (usePaginatedList)
lib/
  api/<module>.ts            per-module API callers
  api/client.ts              apiRequest (auth, refresh, envelope unwrap)
  auth/                      cookie session + constants
  types/api.ts               all request/response types
  navigation.ts              sidebar structure (single source of truth)
  flash.ts                   toast/flash messaging
  utils/cn.ts                class merge
proxy.ts                     route guard (Next 16 middleware)
```

## 3. Data flow
`page/component` → `lib/api/<module>.ts` → `apiRequest` (`lib/api/client.ts`)
- dev: `NEXT_PUBLIC_API_BASE_URL` (browser → backend directly)
- prod: `NEXT_PUBLIC_API_BASE_URL=/api/v1` → `app/api/v1/[...path]/route.ts` → `API_PROXY_TARGET` (HTTPS→HTTP, avoids mixed content).

## 4. Auth & session
- Tokens + user stored in cookies (`lib/auth/session.ts`; names in `lib/auth/constants.ts`).
- `apiRequest` attaches `Authorization: Bearer`, refreshes once on 401, redirects to `/login?from=` when refresh fails.
- `proxy.ts` gates `/`, `/login`, `/dashboard/:path*`.

## 5. UI system
- Tailwind CSS v4 with design tokens/vars in `app/globals.css`; shared primitives in `components/ui/*`.
- Layout: `DashboardShell` renders the sidebar (from `lib/navigation.ts`) and `ToastHost`.
- Feedback: `Alert` (inline), toast via `lib/flash.ts`, `ConfirmDialog` for destructive actions.

## 6. Navigation
- `lib/navigation.ts` is the single source: `mainNavigation` (sections + children), `comingSoonModules`, `moduleDescriptions`. Adding a page means adding an entry here.

## 7. Config & environment
- `NEXT_PUBLIC_API_BASE_URL` (browser-facing; `/api/v1` in prod) and `API_PROXY_TARGET` (proxy target). Document new vars in `.env.example`.
- `next.config.ts` uses `output: "standalone"` for the Docker image.

## 8. Documentation contract
- Changes to sales/delivery UI or navigation MUST be reflected in `../progas-docs/03-business-flow.md` and `../progas-docs/02-modules-api.md`, and logged in `../progas-docs/CHANGELOG.md` (see `AGENTS.md`).

## 9. Extension checklist — adding a module/page
1. Add types + API callers (`lib/types/api.ts`, `lib/api/<module>.ts`).
2. Add the nav entry in `lib/navigation.ts` (`mainNavigation` + `moduleDescriptions`).
3. List page `app/dashboard/<module>/page.tsx` using `usePaginatedList` + `DataTable`.
4. Create/edit pages using `components/ui/form-layout.tsx` helpers + `Alert`/toast for feedback.
5. Detail page `app/dashboard/<module>/[id]/page.tsx` when applicable.
6. Endpoints/permissions come from the backend (`../progas-wms-be`); the UI only calls what the API exposes.
7. Verify `npm run lint` and `npm run build`.

## 10. Deployment
- Docker (multi-stage, `.next/standalone`). CI: `.github/workflows/deploy-dev.yml` deploys on push to `development`. Branches: `main`, `development` (active).
