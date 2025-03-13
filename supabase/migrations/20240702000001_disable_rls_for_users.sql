-- Disable RLS for users table to allow ID verification updates
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Create policy for users table to allow all operations
DROP POLICY IF EXISTS "Allow all operations for users" ON public.users;
CREATE POLICY "Allow all operations for users"
ON public.users
FOR ALL
USING (true);

-- Enable realtime for users table
alter publication supabase_realtime add table public.users;
