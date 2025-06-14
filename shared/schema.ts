import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users (Funcionários)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull(), // 'manager', 'receptionist', 'staff'
  phone: text("phone"),
  email: text("email"),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  permissions: jsonb("permissions").default('{}'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Clients (Clientes)
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  cpf: text("cpf"),
  rg: text("rg"),
  birthDate: text("birth_date"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Rooms (Quartos)
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  type: text("type").notNull(), // 'solteiro', 'casal', 'familia', 'suite'
  capacity: integer("capacity").notNull(),
  dailyRate: numeric("daily_rate", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("available"), // 'available', 'occupied', 'maintenance'
  observations: text("observations"),
});

// Products (Produtos)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(), // 'un', 'L', 'kg', etc.
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
  currentStock: integer("current_stock").notNull().default(0),
  supplier: text("supplier"),
});

// Services (Serviços)
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  estimatedTime: text("estimated_time"),
});

// Reservations/Check-ins
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  roomId: integer("room_id").notNull().references(() => rooms.id),
  checkInDate: timestamp("check_in_date").notNull(),
  expectedCheckOutDate: timestamp("expected_check_out_date").notNull(),
  actualCheckOutDate: timestamp("actual_check_out_date"),
  numberOfGuests: integer("number_of_guests").notNull(),
  paymentMethod: text("payment_method"),
  status: text("status").notNull().default("active"), // 'active', 'completed', 'cancelled'
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).default('0'),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product Sales
export const productSales = pgTable("product_sales", {
  id: serial("id").primaryKey(),
  reservationId: integer("reservation_id").notNull().references(() => reservations.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  saleDate: timestamp("sale_date").defaultNow().notNull(),
});

// Service Sales
export const serviceSales = pgTable("service_sales", {
  id: serial("id").primaryKey(),
  reservationId: integer("reservation_id").notNull().references(() => reservations.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'cancelled'
  saleDate: timestamp("sale_date").defaultNow().notNull(),
});

// Inventory Movements
export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  type: text("type").notNull(), // 'entry', 'exit'
  quantity: integer("quantity").notNull(),
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }),
  reason: text("reason"),
  date: timestamp("date").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertReservationSchema = createInsertSchema(reservations, {
  checkInDate: z.coerce.date(),
  expectedCheckOutDate: z.coerce.date(),
  actualCheckOutDate: z.coerce.date().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertProductSaleSchema = createInsertSchema(productSales).omit({
  id: true,
  saleDate: true,
});

export const insertServiceSaleSchema = createInsertSchema(serviceSales).omit({
  id: true,
  saleDate: true,
});

export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({
  id: true,
  date: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;

export type ProductSale = typeof productSales.$inferSelect;
export type InsertProductSale = z.infer<typeof insertProductSaleSchema>;

export type ServiceSale = typeof serviceSales.$inferSelect;
export type InsertServiceSale = z.infer<typeof insertServiceSaleSchema>;

export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
