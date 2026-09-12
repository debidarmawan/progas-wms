<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# progas-wms — Agent Notes

Frontend dashboard for Progas WMS (cylinder gas warehouse management). Next.js 16.2.6 (App Router), React 19.2, Tailwind v4.

**Read `../progas-docs/` before making non-trivial changes.** It has the full architecture, module inventory, and business flow so you don't need to explore the whole workspace to get oriented:

- `../progas-docs/01-architecture.md` — frontend page structure, `usePaginatedList` pattern, `apiRequest` client behavior (auto token refresh)
- `../progas-docs/02-modules-api.md` — every backend module/endpoint this app consumes, and current sidebar navigation
- `../progas-docs/03-business-flow.md` — current (as-is) business flow, including the cylinder status lifecycle
- `../progas-docs/04-roadmap.md` — planned PO → SO → DO → Trip flow (NOT yet implemented in the UI)

## Critical facts (avoid re-deriving these by exploring)

- Sales flow today: the "Surat Jalan" (Delivery Order) page creates a DO directly from scanned barcodes — there is NO PO or Sales Order page yet. Don't assume they exist.
- Almost every list page follows the same pattern: `useState` for search/filters → `useCallback` fetcher → `usePaginatedList(fetcher, search, extraParams?)` → `DataTable`. Follow this pattern for new list pages instead of inventing a new one.
- Auth token lives in cookies (`lib/auth/session.ts`); `lib/api/client.ts` auto-refreshes on 401 and redirects to `/login` if refresh fails — don't add manual token handling in page components.

## Business flow changes

Any change to sales/delivery business logic or navigation structure MUST be reflected in `../progas-docs/03-business-flow.md` and `../progas-docs/02-modules-api.md`, and logged in `../progas-docs/CHANGELOG.md`.
