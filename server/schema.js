import { pgTable, text, integer, decimal, timestamp, json, uuid, boolean, varchar } from 'drizzle-orm/pg-core';

// Products table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  product_details: text('product_details'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  images: json('images').notNull().default([]),
  colors: json('colors').notNull().default([]),
  sizes: json('sizes').notNull().default([]),
  category: varchar('category', { length: 100 }).notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Product translations table
export const product_translations = pgTable('product_translations', {
  id: uuid('id').defaultRandom().primaryKey(),
  product_id: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  language_code: varchar('language_code', { length: 5 }).notNull(),
  name: varchar('name', { length: 255 }),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password_hash: varchar('password_hash', { length: 255 }),
  first_name: varchar('first_name', { length: 100 }),
  last_name: varchar('last_name', { length: 100 }),
  is_admin: boolean('is_admin').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Cart items table
export const cart_items = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  product_id: uuid('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  selected_color: varchar('selected_color', { length: 100 }),
  selected_size: varchar('selected_size', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.id),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  shipping_address: json('shipping_address'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Order items table
export const order_items = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  order_id: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  product_id: uuid('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  selected_color: varchar('selected_color', { length: 100 }),
  selected_size: varchar('selected_size', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
});
