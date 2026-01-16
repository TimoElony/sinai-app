import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER || 'postgres.vwpzcvemysspydbtlcxo',
    host: process.env.DB_HOST || 'aws-0-eu-central-1.pooler.supabase.com',
    database: process.env.DB_NAME || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    // Connection pool optimizations for Supabase pooler
    max: 10, // Reduced from 20 to avoid overwhelming pooler
    min: 0, // Let connections close naturally when idle (Supabase pooler manages this)
    idleTimeoutMillis: 20000, // Close idle clients faster (20s instead of 30s)
    connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection can't be established
    statement_timeout: 30000, // Terminate any statement that takes more than 30 seconds
    query_timeout: 30000, // Query timeout
    keepAlive: true, // Keep connections alive to avoid idle termination
    keepAliveInitialDelayMillis: 10000 // Start keepalive pings earlier (10s instead of 30s)
});

// Handle pool errors - gracefully recreate connections on disconnect
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err.message);
    // Don't log full stack trace for common connection resets
});

export default pool;
