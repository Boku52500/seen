import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products } from './src/db/schema.ts';
import { desc, like } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function checkDatabase() {
  try {
    console.log('Checking specific product with product_details...');
    
    const specific_product = await db
      .select()
      .from(products)
      .where(like(products.name, '%white mini dress%'))
      .limit(1);
    
    if (specific_product.length > 0) {
      const product = specific_product[0];
      console.log('Found product:');
      console.log(`ID: ${product.id}`);
      console.log(`Name: ${product.name}`);
      console.log(`Description: ${product.description}`);
      console.log(`Product Details: ${product.product_details}`);
      console.log(`Updated At: ${product.updated_at}`);
    } else {
      console.log('No matching product found');
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

checkDatabase();
