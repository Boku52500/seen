import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

const client = postgres(process.env.DATABASE_URL);

async function testDatabase() {
  try {
    console.log('Testing direct database query...');
    
    const result = await client`
      SELECT id, name, description, product_details, updated_at 
      FROM products 
      WHERE name = 'adsd'
      LIMIT 1;
    `;
    
    if (result.length > 0) {
      const product = result[0];
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
    console.error('Error:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

testDatabase();
