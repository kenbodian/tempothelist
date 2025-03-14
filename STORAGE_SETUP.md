# Storage Setup for ID Verification

To ensure that your ID verification process works correctly, you need to configure your storage bucket correctly. Please follow these steps:

## 1. Run the SQL Script

1. Go to the [Supabase Dashboard](https://app.supabase.com)
2. Open your project
3. Navigate to the SQL Editor
4. Create a new query
5. Copy and paste the contents of the `update_storage_permissions.sql` file
6. Run the query

This script will:
- Create the 'pilot-ids' bucket if it doesn't exist
- Set it to be publicly accessible
- Set up appropriate permissions for reading, uploading, updating, and deleting files

## 2. Verify Storage Configuration

1. In the Supabase Dashboard, navigate to Storage
2. Check that you have a "pilot-ids" bucket
3. Click on the "pilot-ids" bucket
4. Click on "Policies" tab
5. Ensure that you have the following policies:
   - "Public Access" for SELECT operations
   - "Authenticated Users can upload" for INSERT operations
   - "Authenticated Users can update own files" for UPDATE operations
   - "Authenticated Users can delete own files" for DELETE operations

## 3. Verify API Access

Make sure your API settings allow function invocations:

1. Go to Settings > API
2. Ensure "Edge Functions" are not restricted

## 4. Test the Upload Process

After making these changes:

1. Restart your Next.js development server
2. Navigate to the ID upload page
3. Try uploading an ID image again
4. Check the logs and debug information for any detailed errors

## Troubleshooting

If you still encounter issues, check:

1. The Edge Function logs in the Supabase Dashboard (Functions > Logs)
2. Browser Network tab to see the response from the Edge Function
3. Browser Console for any JavaScript errors
4. The debug information displayed on the upload form 