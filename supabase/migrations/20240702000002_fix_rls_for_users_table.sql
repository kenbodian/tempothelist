-- Disable RLS for users table completely
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON users;
CREATE POLICY "Allow all operations for authenticated users"
ON users
FOR ALL
USING (true);

-- Make sure subscriptions table also has proper policies
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users on subscriptions
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON subscriptions;
CREATE POLICY "Allow all operations for authenticated users"
ON subscriptions
FOR ALL
USING (true);

-- Make sure webhook_events table also has proper policies
ALTER TABLE webhook_events DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users on webhook_events
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON webhook_events;
CREATE POLICY "Allow all operations for authenticated users"
ON webhook_events
FOR ALL
USING (true);
