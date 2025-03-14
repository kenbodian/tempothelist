#!/bin/bash

echo "Testing MCP connection for Supabase..."

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

echo "Found MCP configuration for Supabase:"
echo "Command: $COMMAND"
echo "Arg1: $ARG1"
echo "Arg2: $ARG2"
echo "Arg3: $ARG3"

# Test connection by starting the MCP server briefly
echo "Starting MCP server temporarily to test connection..."
echo "This will run for 10 seconds if successful..."

# Start the MCP server in the background with the arguments separated correctly
$COMMAND $ARG1 $ARG2 "$ARG3" &
MCP_PID=$!

# Wait for 10 seconds
sleep 10

# Check if the server is still running
if kill -0 $MCP_PID 2>/dev/null; then
    echo "MCP server is running successfully!"
    echo "Stopping MCP server..."
    kill $MCP_PID
else
    echo "Error: MCP server failed to start or stopped prematurely"
fi

echo ""
echo "If you saw PostgreSQL connection logs above without errors, your MCP connection is configured correctly."
echo "To deploy your Supabase functions with MCP, use the updated deploy-functions.sh script." 