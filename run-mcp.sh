#!/bin/bash

# Run the MCP server for Supabase
echo "Starting MCP server for Supabase..."

# Direct command without using mcp.json
npx -y @modelcontextprotocol/server-postgres "postgresql://postgres:N@elgangi69@db.pmluvmynrbjszsaowvof.supabase.co:5432/postgres"

# This will keep running until you stop it with Ctrl+C 