-- Enable Row Level Security on all tables
ALTER TABLE "restaurants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tables" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "menu_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_status_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;

-- Create policies specifically for the anon role (Supabase public access)
-- Note: 'anon' is the role assumed when using NEXT_PUBLIC_SUPABASE_ANON_KEY on the frontend.
-- We only grant SELECT to allow Realtime subscriptions to work. All INSERT/UPDATE/DELETE are blocked.

CREATE POLICY "Allow anon select on tables" ON "tables" FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon select on sessions" ON "sessions" FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon select on categories" ON "categories" FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon select on menu_items" ON "menu_items" FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon select on orders" ON "orders" FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon select on order_items" ON "order_items" FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon select on order_status_logs" ON "order_status_logs" FOR SELECT TO anon USING (true);

-- The 'staff', 'payments', and 'restaurants' tables deliberately have NO policies.
-- This means Supabase REST API and Realtime will completely deny access to them for anon users.
-- (Prisma connects via a superuser role, so Next.js API routes are unaffected by RLS).