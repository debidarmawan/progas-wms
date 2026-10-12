# Coding Standards — progas-wms (web)

Scope: Next.js 16 App Router (React 19, TypeScript strict, Tailwind v4) in this repo.
Always active. When unsure, mirror the closest existing page/component.

## 1. Golden rules
- `npm run lint` and `npm run build` MUST pass before a task is considered done.
- Reuse the UI primitives in `components/ui/*` and `cn()` from `lib/utils/cn.ts`; don't hand-roll markup that already exists.
- All backend calls go through `lib/api/<module>.ts` → `apiRequest`. Never `fetch` the API from a page/component, and never manage tokens manually.
- Follow the established list/form/detail page patterns instead of inventing new ones.
- No new dependency without a strong reason; the stack is fixed in `package.json`.

## 2. Structure & placement
- Pages: `app/dashboard/<module>/page.tsx` (list), `.../new/page.tsx` (create), `.../[id]/page.tsx` (detail), `.../[id]/edit/page.tsx` (edit).
- API functions: `lib/api/<module>.ts`. Types: `lib/types/api.ts`. Navigation: `lib/navigation.ts`.
- Shared UI: `components/ui/*`; layout shell: `components/layout/*`.
- Path alias `@/*` maps to the repo root — always import with `@/`.

## 3. Components & rendering
- Interactive pages/components start with `"use client"`. Only `app/layout.tsx` and other truly static files stay server components.
- One component per file; named exports for components; default export only for route `page.tsx`/`layout.tsx`.
- Keep components presentational; data fetching + state live in the page or the shared hook.

## 4. The list-page pattern (follow it)
`useState` for `search` → `useCallback` fetcher calling `lib/api/<module>.ts` → `usePaginatedList(fetcher, search, extraParams?)` → render `DataTable*` + `Pagination`. See any `app/dashboard/<module>/page.tsx`.

## 5. API & errors
- `apiRequest<T>(path, options)` (`lib/api/client.ts`) attaches the bearer token, auto-refreshes once on 401, redirects to `/login?from=<path>` when refresh fails, and unwraps the envelope (`{code,status,message,data}` → `data`).
- Errors surface as `ApiError` (`message`, `code`, `error_code`). Show them with `<Alert variant="error">` or `showToast(msg, "error")`; never swallow them.
- In catch blocks: `err instanceof Error ? err.message : "<fallback>"`.

## 6. UI & styling
- Tailwind utility classes only; no inline styles; no raw hex — use the slate/indigo/rose palette and the CSS variables in `app/globals.css`.
- Conditional classes via `cn(...)`; never string-concatenate class names.
- Prefer `Card`, `PageHeader`, `Button`, `Input`, `DataTable*`, `Pagination`, `SearchInput`, `Badge`, `Alert`, `ConfirmDialog`, and the form helpers in `components/ui/form-layout.tsx`.
- Success/redirect feedback uses `lib/flash.ts`: `setFlashMessage(msg)` before navigating, `showToast(msg)` for in-page updates.
- Dates: `new Date(value).toLocaleDateString("id-ID")`. UI copy in Indonesian (match existing screens).

## 7. Naming
- Files/dirs: kebab-case (`use-paginated-list.ts`, `data-table.tsx`, `sales-orders/`).
- Components/types: PascalCase. Functions/vars: camelCase. API helpers: `listX`, `getX`, `createX`, `updateX`, `deleteX`.

## 8. Types
- TypeScript `strict` is on. No `any` (use `unknown` + narrowing). Define every request/response in `lib/types/api.ts`.
- Reuse the shared `PaginatedList<T>`, `PaginationParams`, and `ApiResponse<T>` types.

## 9. Auth
- Tokens/user live in cookies via `lib/auth/session.ts`; cookie names in `lib/auth/constants.ts`. The route guard is `proxy.ts` (Next 16's renamed middleware) — do not add a `middleware.ts`.
- Never read/write tokens in page components; rely on `apiRequest`.

## 10. Commits
- Conventional Commits: `feat: ...`, `fix: ...`, `chore: ...`, `refactor: ...`, `docs: ...`.
