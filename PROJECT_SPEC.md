# QR-Dine: Project Specification

## 1. Project Goal
Design and build a simple, reliable, secure, and fast QR-based dine-in ordering system for small-scale restaurants.

### System Requirements
- Works on slow internet (2G/3G)
- Works on low-end smartphones
- Extremely easy for restaurant owners
- Secure payment handling
- Operates with minimal training
- Handles network interruptions gracefully
- Single-restaurant system

### Target Capacity
- 20 active tables simultaneously
- 200+ daily orders

---

## 2. Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Real-time | Supabase Realtime (postgres_changes) |
| Styling | Tailwind CSS |
| Auth | JWT via jose (Edge-compatible) |
| Validation | Zod |
| Data Fetching | SWR |
| QR Generation | qrcode (npm) |
| Password Hashing | bcryptjs |
| Deployment | Vercel + Supabase |

---

## 3. User Roles

### Customer (Dine-in)
- No authentication required
- Identified by table session
- Can: view menu, add to cart, place orders, view order status, pay

### Restaurant Owner (Admin)
- Email + password authentication
- Can: manage menu, manage tables, manage kitchen staff, view orders, confirm payments, view metrics

### Kitchen Staff
- PIN-based authentication
- Can: view order queue, update order status, toggle menu item availability

---

## 4. Core System Flow
```
Customer scans QR
    → Table validated on server
    → Unique session created (one active per table)
    → Menu loads (categorized, real-time availability)
    → Customer adds items to cart (persists in localStorage)
    → Customer places order (idempotency key prevents duplicates)
    → Kitchen receives order instantly (Supabase Realtime)
    → Kitchen updates status (Placed → Preparing → Ready → Completed)
    → Customer sees live status updates
    → Customer selects payment method (UPI/Cash/Counter)
    → Payment confirmed server-side
    → Order completed
```

---

## 5. Data Models

### Restaurant
- id, name, taxPercent, currency, createdAt, updatedAt

### Staff
- id, name, role (ADMIN/KITCHEN), email (admin only), passwordHash (admin only), pin (kitchen only), isActive

### Table
- id, number (unique int), label, capacity, status (AVAILABLE/OCCUPIED/RESERVED/DISABLED), qrCodeUrl, isActive

### Session
- id, tableId, status (ACTIVE/COMPLETED/EXPIRED/CANCELLED), guestCount, startedAt, expiresAt, completedAt

### Category
- id, name (unique), sortOrder, isActive

### MenuItem
- id, name, description, price, categoryId, imageUrl, isVeg, isAvailable, isActive, sortOrder

### Order
- id, orderNumber (auto-increment), sessionId, tableId, status (PLACED/CONFIRMED/PREPARING/READY/COMPLETED/CANCELLED), specialNotes, subtotal, taxAmount, totalAmount

### OrderItem
- id, orderId, menuItemId, name (denormalized), price (denormalized), quantity, notes

### OrderStatusLog
- id, orderId, fromStatus, toStatus, changedBy, note, createdAt

### Payment
- id, orderId (unique), sessionId, method (UPI/CASH/PAY_AT_COUNTER), status (PENDING/PROCESSING/COMPLETED/FAILED/REFUNDED), amount, transactionId, metadata, paidAt

---

## 6. API Routes

### Authentication
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/auth/admin-login | None | Admin login → JWT |
| POST | /api/auth/kitchen-login | None | Kitchen PIN login → JWT |
| GET | /api/auth/me | Staff | Validate token, return role |

### Tables
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/tables | ADMIN | List all tables |
| POST | /api/tables | ADMIN | Create table |
| GET | /api/tables/[tableId] | ADMIN | Get table |
| PATCH | /api/tables/[tableId] | ADMIN | Update table |
| DELETE | /api/tables/[tableId] | ADMIN | Soft-delete table |
| GET | /api/tables/[tableId]/qr | ADMIN | Generate QR code |

### Sessions
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/sessions | None | Create session for table scan |
| GET | /api/sessions/[sessionId] | Session | Get session details |
| PATCH | /api/sessions/[sessionId] | ADMIN | Update session status |
| GET | /api/sessions/[sessionId]/validate | None | Quick validation check |

### Menu
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/menu | None | Public menu list by category |
| POST | /api/menu | ADMIN | Create menu item |
| GET | /api/menu/[itemId] | None | Get item details |
| PATCH | /api/menu/[itemId] | ADMIN | Update item |
| DELETE | /api/menu/[itemId] | ADMIN | Soft-delete item |
| PATCH | /api/menu/[itemId]/availability | ADMIN/KITCHEN | Toggle availability |

### Categories
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/categories | None | List categories |
| POST | /api/categories | ADMIN | Create category |
| PATCH | /api/categories/[categoryId] | ADMIN | Update category |

### Orders
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/orders | Session | Place order (idempotency key required) |
| GET | /api/orders | ADMIN/KITCHEN | List orders with filters |
| GET | /api/orders/[orderId] | Session/Staff | Get order details |
| PATCH | /api/orders/[orderId]/status | KITCHEN/ADMIN | Update order status |

### Payments
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/payments/initiate | Session | Initiate payment |
| POST | /api/payments/verify | Session | Verify payment (server-side) |
| GET | /api/payments/[paymentId] | Session/Staff | Get payment status |

### Admin
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/admin/metrics | ADMIN | Dashboard metrics |
| GET | /api/admin/kitchen-staff | ADMIN | List kitchen staff |
| POST | /api/admin/kitchen-staff | ADMIN | Create kitchen staff |
| DELETE | /api/admin/kitchen-staff/[staffId] | ADMIN | Deactivate staff |

### Health
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/health | None | Network connectivity check |

---

## 7. Real-Time Events (Supabase Realtime)

### Channels
- `orders` — Kitchen/Admin subscribe to INSERT on Order table (new orders)
- `order-{sessionId}` — Customer subscribes to UPDATE on Order table filtered by sessionId
- `menu` — All clients subscribe to UPDATE on MenuItem table (availability changes)
- `tables` — Admin subscribes to UPDATE on Table table (status changes)

### Event Flow: New Order
1. Customer POST /api/orders → DB inserts Order row
2. Supabase Realtime fires INSERT event on `orders` channel
3. Kitchen dashboard receives event → plays alert sound, shows new order

### Event Flow: Order Status Update
1. Kitchen PATCH /api/orders/[orderId]/status → DB updates Order row
2. Supabase Realtime fires UPDATE event
3. Customer on order-status page receives event → UI updates stepper

### Event Flow: Menu Availability Toggle
1. Admin PATCH /api/menu/[itemId]/availability → DB updates MenuItem row
2. Supabase Realtime fires UPDATE event on `menu` channel
3. All customers on menu page see item greyed out / restored

---

## 8. Page Structure

### Customer Pages (`/table/[tableId]/...`)
- `/table/[tableId]` — QR landing: validate table, create session, redirect
- `/table/[tableId]/menu` — Browse categorized menu, add to cart
- `/table/[tableId]/cart` — Review cart, modify quantities, add notes
- `/table/[tableId]/checkout` — Select payment method, complete payment
- `/table/[tableId]/order-status` — Live order tracking (stepper UI)
- `/table/[tableId]/thank-you` — Post-payment confirmation

### Kitchen Pages (`/kitchen/...`)
- `/kitchen/login` — PIN pad login
- `/kitchen` — Live order queue dashboard

### Admin Pages (`/admin/...`)
- `/admin/login` — Email + password login
- `/admin` — Dashboard (metrics: revenue, orders, pending payments)
- `/admin/menu` — Menu CRUD + availability toggle
- `/admin/tables` — Table management + QR generation
- `/admin/orders` — Order history + active orders
- `/admin/kitchen-staff` — Manage kitchen staff PINs
- `/admin/settings` — Restaurant settings (name, tax)

---

## 9. Security Requirements
- All admin/kitchen routes protected by JWT middleware
- Customer routes require valid session matching table URL
- Input validation on every API endpoint (Zod schemas)
- Rate limiting: 5/min login attempts, 3/min orders per session, 5/min session creation per IP
- Session IDs are CUIDs (not guessable/sequential)
- httpOnly, secure, sameSite:strict cookies
- Password hashing with bcryptjs
- Server-side payment verification only (never trust frontend)
- Idempotency keys on order placement (prevent duplicates)
- Soft deletes preserve data integrity
- HTML sanitization on all user text inputs

---

## 10. Performance Requirements
- No heavy graphics or animations
- Minimal data transfer (text-based menu, images optional)
- SWR for stale-while-revalidate (serve cached data while fetching)
- localStorage cart (no network needed for cart operations)
- Skeleton loaders instead of spinners
- Fallback polling if Supabase Realtime disconnects (15s interval)

---

## 11. Network Resilience
- Detect offline via `navigator.onLine` + `/api/health` ping
- Show "You seem to be offline" banner (non-blocking)
- Cart operations work fully offline (localStorage)
- Pending actions queue (stores failed API calls, replays on reconnect)
- Idempotency keys ensure safe retries
- Supabase Realtime auto-reconnects with exponential backoff
- SWR revalidates on reconnect/focus

---

## 12. Edge Case Handling

### Sessions
- Table already has active session → return existing (same party) or show "Table occupied"
- Session expires mid-use → show SessionExpiredModal, preserve cart
- Page refresh → restore session from cookie/localStorage
- Multiple phones same table → share session (cart per-device)
- URL tampering (fake tableId) → 404 error, show "Scan QR code"

### Cart
- Item becomes unavailable → mark in cart with warning, block order
- Price changes after cart add → server recalculates, show diff to customer
- Multiple tabs → localStorage sync via `storage` event

### Orders
- Double-click/retry → idempotency key blocks duplicate
- Socket/realtime disconnect → fallback 15s polling
- Kitchen network drop → retry button, status preserved

### Payments
- Frontend claims "paid" → server verifies independently
- Browser closes mid-payment → PENDING record in DB, resume on return
- Cash: customer leaves → admin marks as written-off
- Double payment → check existing completed payment first

---

## 13. Admin Simplicity Principle
- Large, clear buttons (minimum 48x48px touch targets)
- No technical language ("Money Collected" not "Revenue")
- Only essential metrics: today's revenue, total orders, pending payments, payment breakdown
- Simple toggle switches for menu availability
- Minimal training required
- High contrast, readable fonts (16px minimum)

---

## 14. Development Phases
1. **Phase 1**: QR + Session System
2. **Phase 2**: Menu + Admin Panel
3. **Phase 3**: Cart + Order + Kitchen Panel
4. **Phase 4**: Payment Integration
5. **Phase 5**: Network Resilience
6. **Phase 6**: Security & Testing

---

## 15. API Response Format
```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

All mutating endpoints accept `X-Idempotency-Key` header for safe retries.
