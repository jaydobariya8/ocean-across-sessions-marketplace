# Sessions Marketplace — Design Spec
Date: 2026-05-09
Assignment: Ocean Across Full-Stack Developer Assessment

---

## Overview
Online coaching sessions marketplace. Users browse and book sessions. Creators publish and manage sessions. OAuth login (GitHub + Google). JWT auth. Stripe payments. MinIO uploads.

---

## Stack
| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router) |
| Backend | Django 4.2 + DRF |
| Database | PostgreSQL 15 |
| Auth | social-django + SimpleJWT |
| Payments | Stripe (test mode) |
| Storage | MinIO (S3-compatible) |
| Proxy | Nginx |
| Infra | Docker Compose |

---

## Architecture
```
Browser → Nginx :80
  /api/*    → Django :8000
  /media/*  → MinIO  :9000
  /*        → Next.js :3000

Docker services: nginx, frontend, backend, db, minio
```

---

## Data Models

### User (extends AbstractUser)
- role: `user` | `creator`
- avatar: CharField (MinIO URL)
- bio: TextField
- oauth_provider: `github` | `google`

### Session
- creator: FK(User)
- title, description, category: CharField/TextField
- price: DecimalField
- duration_minutes: IntegerField
- max_participants: IntegerField
- scheduled_at: DateTimeField
- image: CharField (MinIO URL)
- status: `draft` | `published` | `cancelled`

### Booking
- user: FK(User)
- session: FK(Session)
- status: `pending` | `confirmed` | `cancelled` | `completed`
- stripe_payment_id: CharField
- amount_paid: DecimalField
- booked_at: DateTimeField

---

## Auth Flow
1. Frontend → Django `/auth/github/` or `/auth/google/`
2. social-django handles OAuth callback
3. Django issues JWT (access 15min, refresh 7days)
4. Frontend stores JWT in httpOnly cookie
5. API calls send `Authorization: Bearer <token>`

---

## API Endpoints

### Auth
- `POST /api/auth/token/refresh/` — refresh JWT
- `GET /api/auth/user/` — current user info
- `POST /api/auth/logout/` — blacklist refresh token
- `GET /auth/github/` — OAuth redirect
- `GET /auth/google/` — OAuth redirect

### Sessions
- `GET /api/sessions/` — public catalog (filter, search, paginate)
- `POST /api/sessions/` — create (creator only)
- `GET /api/sessions/:id/` — detail
- `PUT/PATCH /api/sessions/:id/` — update (owner only)
- `DELETE /api/sessions/:id/` — delete (owner only)

### Bookings
- `GET /api/bookings/` — my bookings (user)
- `POST /api/bookings/` — book a session
- `GET /api/bookings/:id/` — booking detail
- `PATCH /api/bookings/:id/` — cancel booking
- `GET /api/creator/bookings/` — all bookings for creator's sessions

### Profile
- `GET/PATCH /api/profile/` — view/update profile
- `POST /api/profile/avatar/` — upload avatar to MinIO

### Stripe
- `POST /api/payments/create-intent/` — create PaymentIntent
- `POST /api/payments/webhook/` — Stripe webhook (confirm booking)

### Upload
- `POST /api/upload/session-image/` — upload session image to MinIO

---

## Pages
| Route | Page | Auth |
|-------|------|------|
| `/` | Catalog — list sessions, login CTA | public |
| `/sessions/[id]` | Session Detail — info + Book Now | public |
| `/login` | OAuth login buttons | guest |
| `/dashboard` | User Dashboard — bookings + profile | user |
| `/creator` | Creator Dashboard — manage sessions | creator |
| `/profile` | Profile edit | any auth |

---

## Bonus Features
- **Stripe**: PaymentIntent on booking, webhook confirms
- **MinIO**: avatar + session image storage
- **Rate Limiting**: DRF throttling — 10req/min on auth, 20req/min on bookings

---

## Docker Compose Services
```
nginx      — reverse proxy, port 80
frontend   — Next.js, port 3000
backend    — Django/gunicorn, port 8000
db         — PostgreSQL 15, port 5432
minio      — MinIO, ports 9000/9001
```

---

## Build Phases
1. Docker + project scaffold
2. Django models + admin + migrations
3. OAuth + JWT auth endpoints
4. Sessions CRUD API
5. Bookings API
6. Next.js setup + auth flow
7. Catalog + Session detail pages
8. User dashboard
9. Creator dashboard
10. MinIO integration
11. Stripe integration
12. Rate limiting + security
13. README + .env.example + polish
