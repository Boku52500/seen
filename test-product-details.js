import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testProductDetails() {
  try {
    console.log('Testing product_details saving...');
    
    const testProduct = {
      name: 'Test Product Details',
      description: 'Test description',
      product_details: 'This is a test product details field',
      price: 99.99,
      category: 'Dresses',
      images: ['test-image.jpg'],
      colors: [{ name: 'Red', value: '#ff0000' }],
      sizes: ['S', 'M', 'L']
    };
    
    console.log('Sending product data:', testProduct);
    
    const response = await fetch('http://localhost:3001/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProduct),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Product created successfully:', result);
      
      // Now fetch the product back
      const fetchResponse = await fetch(`http://localhost:3001/api/products/${result.id}`);
      if (fetchResponse.ok) {
        const fetchedProduct = await fetchResponse.json();
        console.log('Fetched product:', fetchedProduct);
        console.log('Product details in response:', fetchedProduct.product_details);
      }
    } else {
      console.error('Failed to create product:', await response.text());
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testProductDetails();
