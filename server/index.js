import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, desc, or, ilike } from 'drizzle-orm';
import dotenv from 'dotenv';
import { db } from './db/index.js';
import { users, products, orders, order_items, user_favourites, userAddresses } from './db/schema.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.API_PORT || 3001;

// Initialize database connection
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);

// Ensure auxiliary tables exist (idempotent)
const ensureHomeSelectionsTable = async () => {
  try {
    await sql`CREATE TABLE IF NOT EXISTS home_selections (
      product_id uuid PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
      position integer NOT NULL,
      created_at timestamp DEFAULT now()
    );`;
  } catch (err) {
    console.error('Error ensuring home_selections table exists:', err);
  }
};

// Run table ensure on startup (non-blocking)
(async () => {
  await ensureHomeSelectionsTable();
})();

// Instagram posts table ensure
const ensureInstagramPostsTable = async () => {
  try {
    await sql`CREATE TABLE IF NOT EXISTS instagram_posts (
      id uuid PRIMARY KEY,
      image text NOT NULL,
      link text NOT NULL,
      position integer NOT NULL,
      created_at timestamp DEFAULT now()
    );`;
    // Add new columns for desktop/mobile featured selections if they don't exist
    try { await sql`ALTER TABLE instagram_posts ADD COLUMN IF NOT EXISTS show_on_desktop boolean DEFAULT false`; } catch {}
    try { await sql`ALTER TABLE instagram_posts ADD COLUMN IF NOT EXISTS desktop_position integer`; } catch {}
    try { await sql`ALTER TABLE instagram_posts ADD COLUMN IF NOT EXISTS show_on_mobile boolean DEFAULT false`; } catch {}
    try { await sql`ALTER TABLE instagram_posts ADD COLUMN IF NOT EXISTS mobile_position integer`; } catch {}
  } catch (err) {
    console.error('Error ensuring instagram_posts table exists:', err);
  }
};

(async () => {
  await ensureInstagramPostsTable();
})();

// JWT secret
const JWT_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth middleware - received token:', token ? token.substring(0, 20) + '...' : 'none');

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('JWT verified successfully, user:', user);
    req.user = user;
    next();
  });
};

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://seen-gamma.vercel.app',
    'https://seen-git-main-giorgis-projects-80a3ab63.vercel.app',
    'https://seen-pf4v9au5w-giorgis-projects-80a3ab63.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Alias so it works when called via Vercel /api/*
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Helper to require admin
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};

// Home Discover selection endpoints
// Get selected product IDs with positions
app.get('/api/home-discover', async (req, res) => {
  try {
    const rows = await sql`SELECT product_id, position FROM home_selections ORDER BY position ASC`;
    res.json(rows);
  } catch (error) {
    console.error('Error fetching home discover selection:', error);
    res.status(500).json({ error: 'Failed to fetch home discover selection' });
  }
});

// Get selected products (full objects) in order
app.get('/api/home-discover/products', async (req, res) => {
  try {
    const rows = await sql`SELECT p.* FROM home_selections s JOIN products p ON p.id = s.product_id WHERE p.is_active = true ORDER BY s.position ASC`;
    res.json(rows);
  } catch (error) {
    console.error('Error fetching home discover products:', error);
    res.status(500).json({ error: 'Failed to fetch home discover products' });
  }
});

// Update selection (admin only)
app.put('/api/home-discover', async (req, res) => {
  try {
    // Ensure table exists (handles cold start or race conditions)
    await ensureHomeSelectionsTable();
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds must be an array' });
    }
    if (productIds.length > 4) {
      return res.status(400).json({ error: 'You can select up to 4 products for the Discover section' });
    }

    // Clear current selection
    await sql`DELETE FROM home_selections`;
    // Insert new selection with order
    for (let i = 0; i < productIds.length; i++) {
      const id = productIds[i];
      await sql`INSERT INTO home_selections (product_id, position) VALUES (${id}, ${i}) ON CONFLICT (product_id) DO UPDATE SET position = EXCLUDED.position`;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating home discover selection:', error);
    res.status(500).json({ error: 'Failed to update home discover selection' });
  }
});

// Instagram Posts Endpoints (top-level)
// List posts in order
app.get('/api/instagram-posts', async (req, res) => {
  try {
    const rows = await sql`SELECT id, image, link, position, show_on_desktop, desktop_position, show_on_mobile, mobile_position FROM instagram_posts ORDER BY position ASC`;
    res.json(rows);
  } catch (error) {
    console.error('Error fetching instagram posts:', error);
    res.status(500).json({ error: 'Failed to fetch instagram posts' });
  }
});

// Add a post (expects id provided by client)
app.post('/api/instagram-posts', async (req, res) => {
  try {
    await ensureInstagramPostsTable();
    const { id, image, link } = req.body;
    if (!id || !image || !link) {
      return res.status(400).json({ error: 'id, image, and link are required' });
    }
    // Compute next position
    const nextPosRows = await sql`SELECT COALESCE(MAX(position) + 1, 0) AS next FROM instagram_posts`;
    const next = Array.isArray(nextPosRows) ? nextPosRows[0]?.next ?? 0 : 0;
    await sql`INSERT INTO instagram_posts (id, image, link, position) VALUES (${id}, ${image}, ${link}, ${next})`;
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error adding instagram post:', error);
    res.status(500).json({ error: 'Failed to add instagram post' });
  }
});

// Reorder posts: set positions based on array order
app.put('/api/instagram-posts/reorder', async (req, res) => {
  try {
    const { surface, ids } = req.body;
    if (surface !== 'desktop' && surface !== 'mobile') {
      return res.status(400).json({ error: "surface must be 'desktop' or 'mobile'" });
    }
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'ids must be an array' });
    }
    // Enforce desired counts: desktop 3, mobile 4
    const expected = surface === 'desktop' ? 3 : 4;
    if (ids.length !== expected) {
      return res.status(400).json({ error: `Expected ${expected} ids for ${surface}` });
    }

    // Reset all flags/positions for this surface
    if (surface === 'desktop') {
      await sql`UPDATE instagram_posts SET show_on_desktop = false, desktop_position = NULL`;
      for (let i = 0; i < ids.length; i++) {
        await sql`UPDATE instagram_posts SET show_on_desktop = true, desktop_position = ${i} WHERE id = ${ids[i]}`;
      }
    } else {
      await sql`UPDATE instagram_posts SET show_on_mobile = false, mobile_position = NULL`;
      for (let i = 0; i < ids.length; i++) {
        await sql`UPDATE instagram_posts SET show_on_mobile = true, mobile_position = ${i} WHERE id = ${ids[i]}`;
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering instagram posts:', error);
    res.status(500).json({ error: 'Failed to reorder instagram posts' });
  }
});

// Toggle featured flags and/or set specific positions for a given post
app.patch('/api/instagram-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { show_on_desktop, desktop_position, show_on_mobile, mobile_position } = req.body;

    // Build dynamic updates based on provided fields
    const updates = [];
    if (typeof show_on_desktop === 'boolean') updates.push(sql`show_on_desktop = ${show_on_desktop}`);
    if (typeof desktop_position === 'number' || desktop_position === null) updates.push(sql`desktop_position = ${desktop_position}`);
    if (typeof show_on_mobile === 'boolean') updates.push(sql`show_on_mobile = ${show_on_mobile}`);
    if (typeof mobile_position === 'number' || mobile_position === null) updates.push(sql`mobile_position = ${mobile_position}`);

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Join updates into a single SET clause
    const setClause = updates.reduce((prev, curr, idx) => idx === 0 ? curr : sql`${prev}, ${curr}`);
    const result = await sql`UPDATE instagram_posts SET ${setClause} WHERE id = ${id} RETURNING id`;
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating instagram post flags:', error);
    res.status(500).json({ error: 'Failed to update instagram post' });
  }
});

// Delete post
app.delete('/api/instagram-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`DELETE FROM instagram_posts WHERE id = ${id} RETURNING id`;
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting instagram post:', error);
    res.status(500).json({ error: 'Failed to delete instagram post' });
  }
});

// Authentication endpoints
// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, displayName, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await db
      .insert(users)
      .values({
        email,
        password_hash: passwordHash,
        display_name: displayName || email.split('@')[0],
        first_name: firstName || null,
        last_name: lastName || null,
        is_admin: false,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    const user = result[0];

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        isAdmin: user.is_admin 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: user.is_admin,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        isAdmin: user.is_admin 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: user.is_admin,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Profile endpoint - req.user:', req.user);
    console.log('Profile endpoint - looking for user ID:', req.user.id);
    
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        display_name: users.display_name,
        first_name: users.first_name,
        last_name: users.last_name,
        is_admin: users.is_admin,
        created_at: users.created_at,
      })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    console.log('Profile endpoint - database result:', result);

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result[0];
    const response = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      firstName: user.first_name,
      lastName: user.last_name,
      isAdmin: user.is_admin,
      createdAt: user.created_at,
    };
    
    console.log('Profile endpoint - sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// User addresses endpoints
// Get user addresses
app.get('/api/auth/addresses', authenticateToken, async (req, res) => {
  try {
    const addresses = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, req.user.id))
      .orderBy(desc(userAddresses.isDefault), desc(userAddresses.createdAt));

    // Map database field names to frontend expected field names
    const mappedAddresses = addresses.map(addr => ({
      id: addr.id,
      type: addr.type,
      firstName: addr.firstName,
      lastName: addr.lastName,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
      createdAt: addr.createdAt,
      updatedAt: addr.updatedAt
    }));

    console.log('Raw addresses from database:', addresses);
    console.log('Returning mapped addresses:', mappedAddresses);
    res.json(mappedAddresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Add user address
app.post('/api/auth/addresses', authenticateToken, async (req, res) => {
  try {
    console.log('Server received address data:', req.body);
    
    const {
      type,
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault
    } = req.body;
    
    console.log('Destructured fields:', {
      type, firstName, lastName, addressLine1, addressLine2, 
      city, state, postalCode, country, isDefault
    });

    // Validate required fields based on country
    const requiredFields = [type, firstName, lastName, addressLine1, city, country];
    
    // Only require state and postalCode for United States
    if (country === 'United States') {
      requiredFields.push(state, postalCode);
    }
    
    if (requiredFields.some(field => !field)) {
      return res.status(400).json({ error: 'Missing required address fields' });
    }

    // If this is being set as default, unset other defaults
    if (isDefault) {
      await db
        .update(userAddresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(and(
          eq(userAddresses.userId, req.user.id),
          eq(userAddresses.type, type)
        ));
    }

    const result = await db
      .insert(userAddresses)
      .values({
        userId: req.user.id,
        type,
        firstName,
        lastName,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state,
        postalCode,
        country,
        phone: req.body.phone || null,
        isDefault,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: userAddresses.id });

    res.status(201).json({
      id: result[0].id,
      message: 'Address added successfully'
    });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Update user address
app.put('/api/auth/addresses/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Server received address UPDATE data:', req.body);
    
    const { id } = req.params;
    const {
      type,
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault
    } = req.body;
    
    console.log('UPDATE - Destructured fields:', {
      type, firstName, lastName, addressLine1, addressLine2, 
      city, state, postalCode, country, isDefault
    });

    // If this is being set as default, unset other defaults
    if (isDefault) {
      await db
        .update(userAddresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(and(
          eq(userAddresses.userId, req.user.id),
          eq(userAddresses.type, type)
        ));
    }

    const updateData = {
      type,
      firstName,
      lastName,
      addressLine1,
      addressLine2: addressLine2 || null,
      city,
      state: state || null,
      postalCode: postalCode || null,
      country,
      isDefault: isDefault || false,
      updatedAt: new Date(),
    };
    
    console.log('UPDATE - Data being saved to database:', updateData);
    
    const result = await db
      .update(userAddresses)
      .set(updateData)
      .where(and(
        eq(userAddresses.id, id),
        eq(userAddresses.userId, req.user.id)
      ))
      .returning();

    console.log('UPDATE - Database result after save:', result);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete user address
app.delete('/api/auth/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db
      .delete(userAddresses)
      .where(and(
        eq(userAddresses.id, id),
        eq(userAddresses.userId, req.user.id)
      ))
      .returning({ id: userAddresses.id });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.is_active, true))
      .orderBy(desc(products.created_at));
    
    console.log('Fetched products - first product product_details:', result[0]?.product_details);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.is_active, true)))
      .limit(1);
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Add new product
app.post('/api/products', async (req, res) => {
  try {
    const productData = req.body;
    
    console.log('Server received product data:', productData);
    console.log('Product details field:', productData.product_details);
    
    // Validate required fields
    if (!productData.name || !productData.price || !productData.category) {
      return res.status(400).json({ error: 'Missing required fields: name, price, category' });
    }

    // Explicitly handle product_details field
    const insertData = {
      name: productData.name,
      description: productData.description || null,
      product_details: productData.product_details || null,
      size_chart: productData.size_chart || [],
      price: productData.price,
      images: productData.images || [],
      colors: productData.colors || [],
      sizes: productData.sizes || [],
      category: productData.category,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    console.log('Insert data being sent to DB:', insertData);
    console.log('Product details specifically:', insertData.product_details);
    
    const result = await db
      .insert(products)
      .values(insertData)
      .returning({ id: products.id });
    
    res.status(201).json({ id: result[0].id, message: 'Product created successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    
    console.log('Server received product update data:', productData);
    console.log('Product details field for update:', productData.product_details);
    
    // Explicitly handle product_details field for update
    const updateData = {
      name: productData.name,
      description: productData.description || null,
      product_details: productData.product_details || null,
      size_chart: productData.size_chart || [],
      price: productData.price,
      images: productData.images || [],
      colors: productData.colors || [],
      sizes: productData.sizes || [],
      category: productData.category,
      updated_at: new Date(),
    };
    
    console.log('Update data being sent to DB:', updateData);
    console.log('Product details specifically for update:', updateData.product_details);
    
    const result = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (soft delete)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db
      .update(products)
      .set({
        is_active: false,
        updated_at: new Date(),
      })
      .where(eq(products.id, id))
      .returning({ id: products.id });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Search products
app.get('/api/products/search/:searchTerm', async (req, res) => {
  try {
    const { searchTerm } = req.params;
    
    const result = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.is_active, true),
          or(
            ilike(products.name, `%${searchTerm}%`),
            ilike(products.description, `%${searchTerm}%`),
            ilike(products.category, `%${searchTerm}%`)
          )
        )
      )
      .orderBy(desc(products.created_at));
    
    res.json(result);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Get products by category
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const result = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.is_active, true),
          eq(products.category, category)
        )
      )
      .orderBy(desc(products.created_at));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// Favourites endpoints
app.get('/api/favourites', authenticateToken, async (req, res) => {
  try {
    console.log('Favourites endpoint - fetching for user:', req.user.id);
    console.log('user_favourites schema fields:', Object.keys(user_favourites));
    
    const result = await db
      .select({
        id: user_favourites.id,
        productId: user_favourites.product_id,
        productName: products.name,
        productPrice: products.price,
        productImage: products.images,
        productCategory: products.category,
        addedAt: user_favourites.created_at,
      })
      .from(user_favourites)
      .innerJoin(products, eq(user_favourites.product_id, products.id))
      .where(eq(user_favourites.user_id, req.user.id))
      .orderBy(desc(user_favourites.created_at));

    console.log('Favourites endpoint - found favourites:', result.length);
    
    const favourites = result.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice,
      productImage: Array.isArray(item.productImage) ? item.productImage[0] : item.productImage,
      productCategory: item.productCategory,
      addedAt: item.addedAt,
    }));

    res.json(favourites);
  } catch (error) {
    console.error('Error fetching favourites:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch favourites' });
  }
});

app.post('/api/favourites', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    
    console.log('POST /api/favourites - Request body:', req.body);
    console.log('POST /api/favourites - User:', req.user.id);
    console.log('POST /api/favourites - Product ID:', productId);
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    console.log('Adding favourite - user:', req.user.id, 'product:', productId);

    // Check if already in favourites
    const existing = await db
      .select()
      .from(user_favourites)
      .where(and(
        eq(user_favourites.user_id, req.user.id),
        eq(user_favourites.product_id, productId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Product already in favourites' });
    }

    // Add to favourites
    const result = await db
      .insert(user_favourites)
      .values({
        user_id: req.user.id,
        product_id: productId,
      })
      .returning({ id: user_favourites.id });

    console.log('Added to favourites:', result[0].id);
    res.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error('Error adding to favourites:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to add to favourites' });
  }
});

app.delete('/api/favourites/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log('Removing favourite - user:', req.user.id, 'product:', productId);

    const result = await db
      .delete(user_favourites)
      .where(and(
        eq(user_favourites.user_id, req.user.id),
        eq(user_favourites.product_id, productId)
      ))
      .returning({ id: user_favourites.id });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Favourite not found' });
    }

    console.log('Removed from favourites:', result[0].id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing from favourites:', error);
    res.status(500).json({ error: 'Failed to remove from favourites' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server locally (do not listen when running on Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/products`);
  });
}

export default app;
