const { Client } = require('pg');

// Updated connection string with correct hostname
const connectionString = 'postgresql://postgres:N@elgangi69@pmluvmynrbjszsaowvof.supabase.co:5432/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function testConnection() {
  try {
    console.log('Attempting to connect to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connection successful!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Current database time:', result.rows[0].now);
    
    await client.end();
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConnection(); 