#!/bin/bash

# Simple script to deploy Edge Functions to Supabase

# Set your Supabase project reference
# You can find this in your Supabase dashboard URL: https://supabase.com/dashboard/project/[reference]
PROJECT_REF="pmluvmynrbjszsaowvof"

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying Edge Functions to Supabase...${NC}"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed."
    echo "Please install it using: brew install supabase/tap/supabase"
    exit 1
fi

# Check if logged in to Supabase
echo -e "${YELLOW}Checking Supabase login status...${NC}"
if ! supabase projects list &> /dev/null; then
    echo "You need to login to Supabase CLI first. Run:"
    echo "supabase login"
    exit 1
fi

# Link to the Supabase project if not already linked
if [ ! -f "supabase/.temp/project-ref" ] || [ "$(cat supabase/.temp/project-ref)" != "$PROJECT_REF" ]; then
    echo -e "${YELLOW}Linking to Supabase project...${NC}"
    supabase link --project-ref "$PROJECT_REF"
fi

# Deploy the verify-id function
echo -e "${YELLOW}Deploying verify-id function...${NC}"
supabase functions deploy verify-id --no-verify-jwt
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ verify-id function deployed successfully${NC}"
else
    echo "Failed to deploy verify-id function"
    exit 1
fi

# Deploy the update-user-verification function
echo -e "${YELLOW}Deploying update-user-verification function...${NC}"
supabase functions deploy update-user-verification --no-verify-jwt
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ update-user-verification function deployed successfully${NC}"
else
    echo "Failed to deploy update-user-verification function"
    exit 1
fi

# Setting environment variables
echo -e "${YELLOW}Setting environment variables...${NC}"
echo "Please enter your OpenAI API key:"
read -s OPENAI_API_KEY
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"

# Use the project URL
SUPABASE_URL="https://$PROJECT_REF.supabase.co"
echo -e "Setting SUPABASE_URL to: ${YELLOW}$SUPABASE_URL${NC}"
supabase secrets set SUPABASE_URL="$SUPABASE_URL"

# Get service role key
echo "Please enter your Supabase service role key:"
read -s SERVICE_ROLE_KEY
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"

echo -e "${GREEN}Deployment complete!${NC}"
echo "Your Edge Functions are now available at:"
echo -e "${YELLOW}https://$PROJECT_REF.supabase.co/functions/v1/verify-id${NC}"
echo -e "${YELLOW}https://$PROJECT_REF.supabase.co/functions/v1/update-user-verification${NC}" 