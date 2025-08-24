import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Applying migration...');
    
    // Add display_name column to users table if it doesn't exist
    try {
      await sql`ALTER TABLE users ADD COLUMN display_name VARCHAR(255)`;
      console.log('✅ Added display_name column to users table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ display_name column already exists in users table');
      } else {
        console.error('❌ Error adding display_name column:', error.message);
      }
    }

    // Create user_favourites table if it doesn't exist
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_favourites (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, product_id)
        )
      `;
      console.log('✅ Created user_favourites table');
    } catch (error) {
      console.error('❌ Error creating user_favourites table:', error.message);
    }

    // Create user_addresses table if it doesn't exist
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS "user_addresses" (
          "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
          "type" varchar(50) NOT NULL,
          "first_name" varchar(100) NOT NULL,
          "last_name" varchar(100) NOT NULL,
          "address_line_1" varchar(255) NOT NULL,
          "address_line_2" varchar(255),
          "city" varchar(100) NOT NULL,
          "state" varchar(100),
          "postal_code" varchar(20),
          "country" varchar(100) NOT NULL,
          "is_default" boolean DEFAULT false,
          "created_at" timestamp DEFAULT now(),
          "updated_at" timestamp DEFAULT now()
        )
      `;
      console.log('- user_addresses table created');
    } catch (error) {
      console.log('- user_addresses table creation error:', error.message);
    }

    // Add size_chart column to products if it doesn't exist
    try {
      await sql`ALTER TABLE products ADD COLUMN size_chart json DEFAULT '[]'`;
      console.log('✅ Added size_chart JSON column to products table');
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log('ℹ️ size_chart column already exists in products table');
      } else {
        console.error('❌ Error adding size_chart column:', error.message || error);
      }
    }
    
    console.log('Migration applied successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
