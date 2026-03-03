# Error Log - QR-Dine Project

Track every error encountered during development. Never repeat the same mistake.

## Format
| # | Date | Error | Root Cause | Fix | File(s) |
|---|------|-------|-----------|-----|---------|
| 1 | - | - | - | - | - |

## Common Pitfalls to Avoid
1. **Prisma on Vercel**: Must use `DIRECT_URL` for migrations, `DATABASE_URL` for pooled connection
2. **jose vs jsonwebtoken**: Use `jose` for Edge Runtime compatibility (Next.js middleware runs in Edge)
3. **Supabase Realtime**: Must enable replication for tables you want to listen to in Supabase dashboard
4. **Next.js App Router**: Server components cannot use hooks or browser APIs — use 'use client' directive
5. **Prisma singleton**: Must use global singleton in development to prevent connection pool exhaustion
6. **Cookie in middleware**: Use `jose` for JWT verification in middleware (not Node.js crypto)
7. **Tailwind purge**: Ensure dynamic class names are complete strings (not template literals with partial classes)
8. **localStorage SSR**: Always check `typeof window !== 'undefined'` before accessing localStorage
9. **Prisma enums**: Enum values in queries must match exactly (case-sensitive)
10. **SWR keys**: Must be stable references — don't use objects as keys without serialization

## Errors Encountered

(entries will be added as development progresses)
