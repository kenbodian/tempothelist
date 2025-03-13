// MCP Test Script for Supabase
// Make sure to run this with: node --experimental-modules mcp-test.js

import { createClient } from '@supabase/supabase-js';

async function testMCPSupabase() {
  try {
    console.log('Starting MCP test with Supabase...');
    
    const supabaseUrl = 'https://pmluvmynrbjszsaowvof.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbHV2bXlucmJqc3pzYW93dm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4ODE2ODUsImV4cCI6MjA1NzQ1NzY4NX0.rqbMscTXVVdjSKj1vAsSLO_KY3vNXCbIZZInZL5r-9M';
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection with a simple query
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('Supabase connection successful!');
    console.log('Query result:', data);
    
    // Verify MCP configuration
    console.log('MCP configuration:');
    console.log(JSON.stringify({
      mcpServers: {
        supabase: {
          command: 'npx',
          args: [
            '-y', 
            '@modelcontextprotocol/server-supabase', 
            supabaseUrl,
            supabaseKey
          ]
        }
      }
    }, null, 2));
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMCPSupabase(); 