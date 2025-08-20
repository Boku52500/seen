import { db, cart_items, products, type CartItem, type NewCartItem } from '../db';
import { eq, and, desc } from 'drizzle-orm';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const cartService = {
  // Get cart items for a user or session
  getCartItems: async (userId?: string, sessionId?: string): Promise<(CartItem & { product: any })[]> => {
    try {
      // In browser environment, return empty array
      if (isBrowser || !db) {
        console.log('Database not available in browser, returning empty cart');
        return [];
      }

      const whereCondition = userId 
        ? eq(cart_items.user_id, userId)
        : eq(cart_items.session_id, sessionId!);

      const result = await db
        .select({
          id: cart_items.id,
          user_id: cart_items.user_id,
          product_id: cart_items.product_id,
          quantity: cart_items.quantity,
          selected_color: cart_items.selected_color,
          selected_size: cart_items.selected_size,
          selected_color_value: cart_items.selected_color_value,
          session_id: cart_items.session_id,
          created_at: cart_items.created_at,
          updated_at: cart_items.updated_at,
          product: products,
        })
        .from(cart_items)
        .innerJoin(products, eq(cart_items.product_id, products.id))
        .where(whereCondition)
        .orderBy(desc(cart_items.created_at));

      return result;
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return []; // Return empty array instead of throwing error
    }
  },

  // Add item to cart
  addToCart: async (cartData: Omit<NewCartItem, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
    try {
      // In browser environment, return mock ID
      if (isBrowser || !db) {
        console.log('Database not available in browser, returning mock cart item ID');
        return 'mock-cart-id-' + Date.now();
      }

      // Check if item already exists in cart
      const whereCondition = cartData.user_id
        ? and(
            eq(cart_items.user_id, cartData.user_id),
            eq(cart_items.product_id, cartData.product_id!),
            eq(cart_items.selected_color, cartData.selected_color || ''),
            eq(cart_items.selected_size, cartData.selected_size || '')
          )
        : and(
            eq(cart_items.session_id, cartData.session_id!),
            eq(cart_items.product_id, cartData.product_id!),
            eq(cart_items.selected_color, cartData.selected_color || ''),
            eq(cart_items.selected_size, cartData.selected_size || '')
          );

      const existingItem = await db
        .select()
        .from(cart_items)
        .where(whereCondition)
        .limit(1);

      if (existingItem.length > 0) {
        // Update quantity if item exists
        await db
          .update(cart_items)
          .set({
            quantity: existingItem[0].quantity + (cartData.quantity || 1),
            updated_at: new Date(),
          })
          .where(eq(cart_items.id, existingItem[0].id));

        return existingItem[0].id;
      } else {
        // Add new item
        const result = await db
          .insert(cart_items)
          .values({
            ...cartData,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning({ id: cart_items.id });

        return result[0].id;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw new Error('Failed to add item to cart');
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId: string, quantity: number): Promise<void> => {
    try {
      if (quantity <= 0) {
        await cartService.removeFromCart(itemId);
        return;
      }

      await db
        .update(cart_items)
        .set({
          quantity,
          updated_at: new Date(),
        })
        .where(eq(cart_items.id, itemId));
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw new Error('Failed to update cart item');
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId: string): Promise<void> => {
    try {
      await db
        .delete(cart_items)
        .where(eq(cart_items.id, itemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw new Error('Failed to remove item from cart');
    }
  },

  // Clear cart for user or session
  clearCart: async (userId?: string, sessionId?: string): Promise<void> => {
    try {
      const whereCondition = userId 
        ? eq(cart_items.user_id, userId)
        : eq(cart_items.session_id, sessionId!);

      await db
        .delete(cart_items)
        .where(whereCondition);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Failed to clear cart');
    }
  },

  // Get cart count
  getCartCount: async (userId?: string, sessionId?: string): Promise<number> => {
    try {
      const whereCondition = userId 
        ? eq(cart_items.user_id, userId)
        : eq(cart_items.session_id, sessionId!);

      const result = await db
        .select({ quantity: cart_items.quantity })
        .from(cart_items)
        .where(whereCondition);

      return result.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  },

  // Transfer guest cart to user cart on login
  transferGuestCart: async (sessionId: string, userId: string): Promise<void> => {
    try {
      await db
        .update(cart_items)
        .set({
          user_id: userId,
          session_id: null,
          updated_at: new Date(),
        })
        .where(eq(cart_items.session_id, sessionId));
    } catch (error) {
      console.error('Error transferring guest cart:', error);
      throw new Error('Failed to transfer guest cart');
    }
  },
};
