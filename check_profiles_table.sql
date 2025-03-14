-- Check if the profiles table exists
SELECT EXISTS (
   SELECT FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename = 'profiles'
);

-- Check the structure of the profiles table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles';

-- Add the ID verification columns if they don't exist
DO $$
BEGIN
    BEGIN
        -- Add id_verified column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
            AND column_name = 'id_verified'
        ) THEN
            ALTER TABLE public.profiles
            ADD COLUMN id_verified BOOLEAN DEFAULT FALSE;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error adding id_verified column: %', SQLERRM;
    END;

    BEGIN
        -- Add id_verification_date column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
            AND column_name = 'id_verification_date'
        ) THEN
            ALTER TABLE public.profiles
            ADD COLUMN id_verification_date TIMESTAMPTZ;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error adding id_verification_date column: %', SQLERRM;
    END;

    BEGIN
        -- Add id_image_path column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
            AND column_name = 'id_image_path'
        ) THEN
            ALTER TABLE public.profiles
            ADD COLUMN id_image_path TEXT;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error adding id_image_path column: %', SQLERRM;
    END;
END $$; 