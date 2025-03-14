#!/bin/bash

# Check if the MCP JSON file exists
if [ ! -f "mcp.json" ]; then
    echo "Error: mcp.json file not found!"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed."
    echo "Please install jq using: brew install jq (on macOS) or apt-get install jq (on Ubuntu)"
    exit 1
fi

echo "Loading MCP configuration for Supabase..."

# Extract MCP server command and args using jq
COMMAND=$(jq -r '.mcpServers.supabase.command' mcp.json)

# Get each arg individually
ARG1=$(jq -r '.mcpServers.supabase.args[0]' mcp.json)
ARG2=$(jq -r '.mcpServers.supabase.args[1]' mcp.json)
ARG3=$(jq -r '.mcpServers.supabase.args[2]' mcp.json)

if [ -z "$COMMAND" ] || [ "$COMMAND" == "null" ]; then
    echo "Error: Could not parse command from mcp.json"
    exit 1
fi

echo "Found MCP configuration for Supabase"
echo "Command: $COMMAND"
echo "Arg1: $ARG1"
echo "Arg2: $ARG2"
echo "Arg3: $ARG3 (connection string)"

# Start the MCP server in the background
echo "Starting MCP server..."
$COMMAND $ARG1 $ARG2 "$ARG3" &
MCP_PID=$!

# Give the server time to start
echo "Waiting for MCP server to start..."
sleep 10

# Check if the server is running
if ! kill -0 $MCP_PID 2>/dev/null; then
    echo "Error: MCP server failed to start"
    exit 1
fi

echo "MCP server started successfully"

# Deploy the Edge Functions to Supabase
echo "Deploying Edge Functions to Supabase..."

# Deploy the verify-id function
echo "Deploying verify-id function..."
supabase functions deploy verify-id --no-verify-jwt

# Deploy the update-user-verification function
echo "Deploying update-user-verification function..."
supabase functions deploy update-user-verification --no-verify-jwt

echo "Setting environment variables..."
# Setting the OpenAI API key - will prompt for value
echo "Enter your OpenAI API key:"
read -s OPENAI_API_KEY
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"
supabase secrets set SUPABASE_URL="https://pmluvmynrbjszsaowvof.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbHV2bXlucmJqc3pzYW93dm9mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg4MTY4NSwiZXhwIjoyMDU3NDU3Njg1fQ.OHI_CsJ-3NhGHXx2zs0GLktSV6Y-2_iroeI8vaBdBGs"

# Kill the MCP server when we're done
echo "Stopping MCP server..."
kill $MCP_PID

echo "Deployment complete!" 