import { pgTable, serial, varchar, text, integer, boolean, timestamp, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  telegramId: varchar('telegram_id', { length: 50 }).unique().notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  username: varchar('username', { length: 100 }),
  phone: varchar('phone', { length: 50 }),
  profilePhotoUrl: text('profile_photo_url'),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => categories.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price').notNull(),
  imageUrl: text('image_url'),
  stock: integer('stock').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const carts = pgTable('carts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  cartId: integer('cart_id').references(() => carts.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').default(1).notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  address: text('address').notNull(),
  note: text('note'),
  totalAmount: numeric('total_amount').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, confirmed, preparing, delivering, completed, cancelled
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  productNameSnapshot: varchar('product_name_snapshot', { length: 255 }).notNull(),
  priceSnapshot: numeric('price_snapshot').notNull(),
  quantity: integer('quantity').notNull(),
  subtotal: numeric('subtotal').notNull(),
});

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));
