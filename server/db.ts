import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import Logger from './logger';

if (!process.env.DATABASE_URL) {
  Logger.error('Database configuration error', new Error('DATABASE_URL environment variable is not set'));
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Log database connection attempt
Logger.info('Attempting to connect to database', {
  host: process.env.DATABASE_URL.split('@')[1]?.split(':')[0],
  database: process.env.DATABASE_URL.split('/').pop()?.split('?')[0],
  schema: process.env.DATABASE_URL.split('schema=')[1]
});

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Add event listeners for pool events
pool.on('connect', () => {
  Logger.info('New client connected to database');
});

pool.on('error', (err) => {
  Logger.error('Unexpected error on idle client', err, {
    connectionString: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') // Hide password in logs
  });
});

pool.on('acquire', () => {
  Logger.debug('Client acquired from pool');
});

pool.on('remove', () => {
  Logger.debug('Client removed from pool');
});

export const db = drizzle(pool, { schema });

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    Logger.error('Database connection test failed', err, {
      connectionString: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')
    });
  } else {
    Logger.info('Database connection test successful', {
      timestamp: res.rows[0].now
    });
  }
});