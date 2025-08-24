import { pgTable, uuid, varchar, text, decimal, integer, timestamp, boolean, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
// Products table
export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    product_details: text('product_details'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull().$type(),
    images: json('images').$type().notNull().default([]),
    colors: json('colors').$type().notNull().default([]),
    sizes: json('sizes').$type().notNull().default([]),
    size_chart: json('size_chart').$type().notNull().default([]),
    category: varchar('category', { length: 100 }).notNull(),
    is_active: boolean('is_active').default(true),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});
// Product translations table
export const product_translations = pgTable('product_translations', {
    id: uuid('id').defaultRandom().primaryKey(),
    product_id: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
    language_code: varchar('language_code', { length: 5 }).notNull(), // e.g., 'en', 'es'
    name: varchar('name', { length: 255 }),
    description: text('description'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});
// User sessions table (for connect-pg-simple)
export const sessions = pgTable('sessions', {
    sid: varchar('sid', { length: 255 }).primaryKey(),
    sess: json('sess').notNull(),
    expire: timestamp('expire').notNull(),
});
// Users table
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password_hash: varchar('password_hash', { length: 255 }),
    display_name: varchar('display_name', { length: 255 }),
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
    product_id: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    selected_color: varchar('selected_color', { length: 100 }),
    selected_size: varchar('selected_size', { length: 50 }),
    selected_color_value: varchar('selected_color_value', { length: 7 }), // hex color
    session_id: varchar('session_id', { length: 255 }), // for guest carts
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});
// Orders table
export const orders = pgTable('orders', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => users.id),
    order_number: varchar('order_number', { length: 50 }).unique().notNull(),
    status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, confirmed, shipped, delivered, cancelled
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    tax: decimal('tax', { precision: 10, scale: 2 }).notNull(),
    shipping: decimal('shipping', { precision: 10, scale: 2 }).notNull(),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    shipping_address: json('shipping_address').$type(),
    billing_address: json('billing_address').$type(),
    payment_info: json('payment_info').$type(),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
});
// Order items table
export const order_items = pgTable('order_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    order_id: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    product_id: uuid('product_id').references(() => products.id),
    quantity: integer('quantity').notNull(),
    unit_price: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
    total_price: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
    selected_color: varchar('selected_color', { length: 100 }),
    selected_size: varchar('selected_size', { length: 50 }),
    selected_color_value: varchar('selected_color_value', { length: 7 }),
    product_snapshot: json('product_snapshot').$type(), // Store product details at time of order
    created_at: timestamp('created_at').defaultNow(),
});
// Relations
export const productsRelations = relations(products, ({ many }) => ({
    translations: many(product_translations),
    cart_items: many(cart_items),
}));
export const productTranslationsRelations = relations(product_translations, ({ one }) => ({
    product: one(products, {
        fields: [product_translations.product_id],
        references: [products.id],
    }),
}));
export const usersRelations = relations(users, ({ many }) => ({
    cart_items: many(cart_items),
    orders: many(orders),
}));
export const cartItemsRelations = relations(cart_items, ({ one }) => ({
    user: one(users, {
        fields: [cart_items.user_id],
        references: [users.id],
    }),
    product: one(products, {
        fields: [cart_items.product_id],
        references: [products.id],
    }),
}));
export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.user_id],
        references: [users.id],
    }),
    order_items: many(order_items),
}));
export const orderItemsRelations = relations(order_items, ({ one }) => ({
    order: one(orders, {
        fields: [order_items.order_id],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [order_items.product_id],
        references: [products.id],
    }),
}));

// User addresses table
export const userAddresses = pgTable('user_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull(), // 'shipping' or 'billing'
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  addressLine1: varchar('address_line_1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line_2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const user_favourites = pgTable('user_favourites', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  product_id: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow()
});

// User addresses relations
export const userAddressesRelations = relations(userAddresses, ({ one }) => ({
    user: one(users, {
        fields: [userAddresses.userId],
        references: [users.id],
    }),
}));

// User favourites relations
export const userFavouritesRelations = relations(user_favourites, ({ one }) => ({
    user: one(users, {
        fields: [user_favourites.user_id],
        references: [users.id],
    }),
    product: one(products, {
        fields: [user_favourites.product_id],
        references: [products.id],
    }),
}));

// Update users relations to include addresses and favourites
export const usersRelationsUpdated = relations(users, ({ many }) => ({
    cart_items: many(cart_items),
    orders: many(orders),
    addresses: many(userAddresses),
    favourites: many(user_favourites),
}));
