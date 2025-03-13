const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Use your Supabase URL 
const supabaseUrl = 'https://pmluvmynrbjszsaowvof.supabase.co';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get API key from user
rl.question('Enter your Supabase anon key: ', (supabaseKey) => {
  // Test connection with provided key
  testSupabaseConnection(supabaseKey);
  rl.close();
});

async function testSupabaseConnection(supabaseKey) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Testing Supabase connection...');
    
    // Simple query to test connectivity with correct syntax
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('Connection successful!');
    console.log('Query result:', data);
  } catch (err) {
    console.error('Connection error:', err);
  }
} 