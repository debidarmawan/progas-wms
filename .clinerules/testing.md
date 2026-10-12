# Test Requirements — progas-wms (web)

## 1. Current state
- No test runner is configured today (`package.json` has no `test` script and no test libraries). The required gates are:
  - `npm run lint` (ESLint via `eslint-config-next`)
  - `npm run build` (Next production build)
- Both MUST pass before a task is considered done.

## 2. What to do until a runner is added
- Put non-trivial, deterministic logic (formatting, calculations, mapping, status derivation) in `lib/` helper modules with no React/Next dependencies, so it is unit-testable later.
- Keep components thin; do not bury business rules in JSX.
- Verify UI changes manually (checklist below) and in the running app (`npm run dev`, port 3001).

## 3. Manual verification checklist (per change)
- List pages: search, pagination, empty state, error state, loading state.
- Forms: required-field validation, error alert, success flash/toast, redirect.
- Auth: protected routes redirect to `/login` when logged out; a 401 triggers refresh then retry.
- No console errors/warnings; no layout breakage on narrow widths.

## 4. When a runner is introduced (recommended setup)
- Prefer **Vitest + React Testing Library + jsdom** (React 19 friendly, fast). Add a `test` script to `package.json`.
- Place tests next to the code: `lib/foo.ts` → `lib/foo.test.ts`; components `components/ui/foo.test.tsx`.
- Highest value first: pure helpers in `lib/`, `usePaginatedList` behavior, and the `apiRequest` envelope/refresh logic (mock `fetch`).
- Do not test Next.js internals; test your own code.

## 5. Definition of done (testing)
`npm run lint` + `npm run build` green; new pure logic lives in testable `lib/` modules; UI verified manually against the checklist.
