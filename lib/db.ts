import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres.vwpzcvemysspydbtlcxo',
    host: 'aws-0-eu-central-1.pooler.supabase.com',
    database: 'postgres',
    port: 5432,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    // Connection pool optimizations
    max: 20, // Maximum number of clients in the pool
    min: 2, // Minimum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection can't be established
    statement_timeout: 30000, // Terminate any statement that takes more than 30 seconds
    query_timeout: 30000 // Query timeout
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export default pool;
