# Phase 25E — Local functional acceptance and UX cleanup

Date: 2026-10-05  
Initial HEAD: `4191491414efab2eb0334b9037306c1b7ecde891`

1. Initial HEAD: `4191491414efab2eb0334b9037306c1b7ecde891`.
2. Final HEAD: recorded after the final acceptance commit.
3. Commits: managed hotel lifecycle fix, operational UX completion, and final local acceptance evidence.
4. PostgreSQL setup: PostgreSQL 17.10 extracted to a non-root temporary runtime and bound to `127.0.0.1:5432`; databases `kiashi` and `kiashi_test` were used.
5. Migrate result: all 9 migrations applied; clean replay reports no pending migration.
6. Seed result: completed; demo customer has 11 orders, 4 wallet entries, 3 support threads and 4,250,000 TOMAN.
7. DB integration result: real PostgreSQL integration suite passed.
8. HotelInventoryAllocation verification: table exists with 11 constraints, 5 indexes and all declared foreign keys/checks.
9. Inventory decrement: direct/demo hotel checkout decrements every stay night transactionally.
10. Refund restoration: allocation-based release restores inventory once.
11. Idempotency: repeated refund/release does not restore the allocation twice.
12. Supplier/hybrid safety: supplier properties stay on the supplier path; manual direct inventory is not mutated for them.
13. Tour end-to-end: published managed Tour catalog/detail and booking contract are available.
14. Ziyarat: published managed Ziyarat detail and booking contract are available.
15. Merchant capability DB result: business-type capability checks and tenant-derived access passed.
16. Program editor UX: destination, itinerary, service/document and media content now use structured row editors.
17. Departure editing: dates, transport, sales window, capacity, notes, duplication, close/reopen and cancellation are editable.
18. Package editing: hotel, room, meal, transport, prices, capacity and active state are editable.
19. Participant summary: total, held, booked, confirmed, pending, cancelled and remaining use the backend capacity snapshot.
20. Registration detail: participant detail and operational links remain connected.
21. Stale code: unused UUID-based `HotelManagement` flow was removed; the live editor moved to `HotelEditor`.
22. Merchant selector: server-backed name/merchant-code search, debounce and bounded 20-row requests replace catalog-wide loading.
23. Pagination: list routes return page metadata and preserve query filters; the >20 hotel-booking contract proves page 2, total 41 and 3 pages.
24. Support: explicit status transitions and two-sided replies remain active.
25. Internal-note isolation: real-DB test proves internal support notes do not appear in merchant responses and cross-tenant detail returns 404.
26. Visa: status/checklist/timeline rules and customer-safe payload tests passed.
27. Last-owner safety: real-DB test rejects suspension/role removal for the last owner, then permits change after a second active owner and verifies audit.
28. Settlement PAID safety: PAID requires a second confirmation, a payment reference, optional description, and audited persistence; no bank transfer is performed.
29. Action Required: operational queue routes and links remain available for internal and merchant scopes.
30. Persian status coverage: shared presentation helper is used on changed operational surfaces.
31. Managed Tour visual QA: 390px screenshot checked; product shell, hero, typography, package and CTA are coherent after data load.
32. Managed Hotel visual QA: search result route renders with zero broken images and no horizontal overflow.
33. Mobile 360: home, managed Tour, managed Ziyarat and hotel results have no horizontal overflow or broken images.
34. Mobile 390: same four routes passed; managed Tour screenshot inspected.
35. Mobile 430: same four routes passed.
36. Mobile 768: same four routes passed.
37. Account regression: real-backend E2E persisted account operations.
38. Tracking regression: invalid and buyer-mobile tracking states passed E2E.
39. Refund regression: refund domain/repository tests and allocation release tests passed.
40. Support regression: account support creation and merchant/internal isolation passed.
41. Notifications regression: full Vitest suite passed.
42. Wallet regression: seeded balance and real-backend account flow passed.
43. Total tests passed: 168 Vitest tests; post-fix targeted E2E runs added 20 passing checks.
44. Total tests failed: 0 in the final Vitest and post-fix targeted E2E runs.
45. Total tests skipped: 1 desktop-only run intentionally skipped the mobile-navigation case by project condition.
46. Remaining local blockers: none for the Phase 25E acceptance scope.
47. Intentionally deferred: real payment, SMS and travel suppliers; CI/deployment investigation; production credentials.
48. Phase 25E status: **LOCALLY ACCEPTED**.

## Validation commands

- `npm run db:generate`
- `npm run db:migrate:deploy`
- `npm run db:seed`
- `DATABASE_URL_TEST=... npm test` → 31 files, 168 tests passed
- `npm run lint`
- `npm run typecheck:web`
- `npm run build:api`
- `npm run build:web`
- targeted Playwright reruns after the search-route correction: mobile 10/10 and desktop 10 passed/1 conditional skip

The first full E2E pass exposed production-preview 500 responses on `/flights/search` and `/hotels/search`. Removing inappropriate `force-dynamic` declarations fixed the production routes while `proxy.ts` continues to enforce `private, no-store`; the failed scenarios then passed in both mobile and desktop reruns.
