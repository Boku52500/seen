import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

let db: any = null;

if (!isBrowser) {
  // Only create database connection on server-side
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Create the connection
  const sql = neon(DATABASE_URL);
  
  // Create the database instance
  db = drizzle(sql, { schema });
} else {
  // In browser environment, create a mock database object
  console.log('Database connection skipped in browser environment');
  db = null;
}

export { db };

// Export schema for use in other files
export * from './schema';
