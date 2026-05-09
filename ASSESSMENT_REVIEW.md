# Ocean Across Assessment Review

Date: 2026-05-09

## Verdict

This is a strong full-stack submission and it covers most assignment requirements: Next.js frontend, Django REST backend, PostgreSQL, Docker Compose, Nginx, OAuth/JWT, roles, sessions, bookings, dashboards, Stripe, MinIO, throttling, README, and `.env.example`.

It is not perfect yet. I would fix the security and booking edge cases below before final submission.

## Verified

- Backend tests passed: `65 passed`.
- Frontend production build passed.
- `docker compose build` passed.
- `docker compose up -d` started the stack.
- `http://localhost` returned `200`.
- `http://localhost/api/sessions/` returned `200`.
- Django system check passed.
- Migration check showed no model changes missing.

## Good

- Clean backend/frontend separation.
- Docker has separate frontend, backend, database, MinIO, and Nginx services.
- OAuth flow exists for GitHub and Google.
- Backend issues JWT tokens.
- Role-based creator/user permissions are implemented.
- Public catalog, session detail, booking flow, user dashboard, creator dashboard, and profile page exist.
- Bonus work is present: Stripe, MinIO uploads, and DRF throttling.
- Backend test coverage is good for core APIs.

## Main Improvements Needed

1. **JWT tokens are passed in URL query params.**  
   OAuth redirects to `/auth/callback?access=...&refresh=...`, and those tokens appear in Nginx logs. This is the biggest security issue. Prefer secure HttpOnly cookies or a one-time callback code.

2. **Public session detail can expose unpublished sessions.**  
   The catalog hides drafts, but `/api/sessions/:id/` can return any session by ID. Non-owners should not see draft/cancelled private sessions.

3. **Creators can see all sessions in catalog API.**  
   Authenticated creators are not filtered to published sessions in `GET /api/sessions/`, so they may see other creators' draft/cancelled sessions.

4. **Booking capacity is not fully safe.**  
   Capacity counts only confirmed bookings, so many pending bookings can be created. Booking creation is also not atomic, so concurrent users can overbook.

5. **Free sessions stay pending.**  
   Frontend treats free sessions as booked, but backend still creates a pending booking. Free bookings should become confirmed immediately.

6. **Payment confirmation should validate more.**  
   Confirm payment should verify Stripe intent metadata, amount, currency, and that the intent belongs to the same booking.

7. **Frontend expects `page_size`, backend ignores it.**  
   Pages request `page_size=50/100`, but DRF pagination does not enable `page_size_query_param`, so dashboards may show only the default 12 records.

8. **Frontend/e2e tests are missing.**  
   Backend tests are good, but login callback, dashboard rendering, booking payment UI, and creator session management should have frontend or e2e coverage.

## Final Assessment

Good project, likely acceptable for the assignment, and stronger than a basic implementation. The main thing to improve before submitting is security around JWT delivery and correctness around booking/payment edge cases.
