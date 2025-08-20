import { db } from '../db';
import { productService } from '../services/productService';

// Sample products for initial migration
const sampleProducts = [
  {
    name: "Black Halter Peplum Top",
    description: "Elegant black halter top with peplum silhouette",
    price: 89.99,
    images: ["/assets/1.jpeg"],
    colors: [{ name: "Black", value: "#000000", imageIndex: 0 }],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "Sets" as const
  },
  {
    name: "White Halter Peplum Top", 
    description: "Chic white halter top with peplum design",
    price: 89.99,
    images: ["/assets/2.jpeg"],
    colors: [{ name: "White", value: "#FFFFFF", imageIndex: 0 }],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "Sets" as const
  }
];

export const migrateData = async () => {
  try {
    console.log('Starting data migration...');
    
    // Add sample products
    for (const product of sampleProducts) {
      const productId = await productService.addProduct(product);
      console.log(`Added product: ${product.name} with ID: ${productId}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
