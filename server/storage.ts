import { 
  users, clients, rooms, products, services, reservations, 
  productSales, serviceSales, inventoryMovements,
  type User, type InsertUser, type Client, type InsertClient,
  type Room, type InsertRoom, type Product, type InsertProduct,
  type Service, type InsertService, type Reservation, type InsertReservation,
  type ProductSale, type InsertProductSale, type ServiceSale, type InsertServiceSale,
  type InventoryMovement, type InsertInventoryMovement
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Clients
  getClient(id: number): Promise<Client | undefined>;
  getClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Rooms
  getRoom(id: number): Promise<Room | undefined>;
  getRooms(): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined>;
  deleteRoom(id: number): Promise<boolean>;
  getAvailableRooms(): Promise<Room[]>;

  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  updateProductStock(id: number, quantity: number): Promise<void>;

  // Services
  getService(id: number): Promise<Service | undefined>;
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // Reservations
  getReservation(id: number): Promise<Reservation | undefined>;
  getReservations(): Promise<Reservation[]>;
  getActiveReservations(): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: number, reservation: Partial<InsertReservation>): Promise<Reservation | undefined>;
  deleteReservation(id: number): Promise<boolean>;

  // Product Sales
  getProductSales(reservationId?: number): Promise<ProductSale[]>;
  createProductSale(sale: InsertProductSale): Promise<ProductSale>;

  // Service Sales
  getServiceSales(reservationId?: number): Promise<ServiceSale[]>;
  createServiceSale(sale: InsertServiceSale): Promise<ServiceSale>;

  // Inventory
  getInventoryMovements(productId?: number): Promise<InventoryMovement[]>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    occupiedRooms: number;
    totalRooms: number;
    checkInsToday: number;
    checkOutsToday: number;
    revenueToday: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updated || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  // Clients
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [created] = await db.insert(clients).values(client).returning();
    return created;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updated] = await db.update(clients).set(client).where(eq(clients.id, id)).returning();
    return updated || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return result.rowCount > 0;
  }

  // Rooms
  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room || undefined;
  }

  async getRooms(): Promise<Room[]> {
    return await db.select().from(rooms).orderBy(rooms.number);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [created] = await db.insert(rooms).values(room).returning();
    return created;
  }

  async updateRoom(id: number, room: Partial<InsertRoom>): Promise<Room | undefined> {
    const [updated] = await db.update(rooms).set(room).where(eq(rooms.id, id)).returning();
    return updated || undefined;
  }

  async deleteRoom(id: number): Promise<boolean> {
    const result = await db.delete(rooms).where(eq(rooms.id, id));
    return result.rowCount > 0;
  }

  async getAvailableRooms(): Promise<Room[]> {
    return await db.select().from(rooms).where(eq(rooms.status, "available"));
  }

  // Products
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async updateProductStock(id: number, quantity: number): Promise<void> {
    await db.update(products)
      .set({ currentStock: sql`${products.currentStock} + ${quantity}` })
      .where(eq(products.id, id));
  }

  // Services
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(services.name);
  }

  async createService(service: InsertService): Promise<Service> {
    const [created] = await db.insert(services).values(service).returning();
    return created;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db.update(services).set(service).where(eq(services.id, id)).returning();
    return updated || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return result.rowCount > 0;
  }

  // Reservations
  async getReservation(id: number): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    return reservation || undefined;
  }

  async getReservations(): Promise<Reservation[]> {
    return await db.select().from(reservations).orderBy(desc(reservations.createdAt));
  }

  async getActiveReservations(): Promise<Reservation[]> {
    return await db.select().from(reservations).where(eq(reservations.status, "active"));
  }

  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const [created] = await db.insert(reservations).values(reservation).returning();
    return created;
  }

  async updateReservation(id: number, reservation: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const [updated] = await db.update(reservations).set(reservation).where(eq(reservations.id, id)).returning();
    return updated || undefined;
  }

  async deleteReservation(id: number): Promise<boolean> {
    const result = await db.delete(reservations).where(eq(reservations.id, id));
    return result.rowCount > 0;
  }

  // Product Sales
  async getProductSales(reservationId?: number): Promise<ProductSale[]> {
    if (reservationId) {
      return await db.select().from(productSales).where(eq(productSales.reservationId, reservationId));
    }
    return await db.select().from(productSales).orderBy(desc(productSales.saleDate));
  }

  async createProductSale(sale: InsertProductSale): Promise<ProductSale> {
    const [created] = await db.insert(productSales).values(sale).returning();
    // Update product stock
    await this.updateProductStock(sale.productId, -sale.quantity);
    return created;
  }

  // Service Sales
  async getServiceSales(reservationId?: number): Promise<ServiceSale[]> {
    if (reservationId) {
      return await db.select().from(serviceSales).where(eq(serviceSales.reservationId, reservationId));
    }
    return await db.select().from(serviceSales).orderBy(desc(serviceSales.saleDate));
  }

  async createServiceSale(sale: InsertServiceSale): Promise<ServiceSale> {
    const [created] = await db.insert(serviceSales).values(sale).returning();
    return created;
  }

  // Inventory
  async getInventoryMovements(productId?: number): Promise<InventoryMovement[]> {
    if (productId) {
      return await db.select().from(inventoryMovements).where(eq(inventoryMovements.productId, productId));
    }
    return await db.select().from(inventoryMovements).orderBy(desc(inventoryMovements.date));
  }

  async createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement> {
    const [created] = await db.insert(inventoryMovements).values(movement).returning();
    // Update product stock based on movement type
    const quantity = movement.type === 'entry' ? movement.quantity : -movement.quantity;
    await this.updateProductStock(movement.productId, quantity);
    return created;
  }

  // Dashboard Stats
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [occupiedRoomsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(rooms)
      .where(eq(rooms.status, "occupied"));

    const [totalRoomsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(rooms);

    const [checkInsTodayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reservations)
      .where(and(
        sql`${reservations.checkInDate} >= ${today}`,
        sql`${reservations.checkInDate} < ${tomorrow}`
      ));

    const [checkOutsTodayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reservations)
      .where(and(
        sql`${reservations.actualCheckOutDate} >= ${today}`,
        sql`${reservations.actualCheckOutDate} < ${tomorrow}`
      ));

    const [revenueTodayResult] = await db
      .select({ total: sql<number>`coalesce(sum(${reservations.totalAmount}), 0)` })
      .from(reservations)
      .where(and(
        sql`${reservations.actualCheckOutDate} >= ${today}`,
        sql`${reservations.actualCheckOutDate} < ${tomorrow}`
      ));

    return {
      occupiedRooms: occupiedRoomsResult.count,
      totalRooms: totalRoomsResult.count,
      checkInsToday: checkInsTodayResult.count,
      checkOutsToday: checkOutsTodayResult.count,
      revenueToday: revenueTodayResult.total,
    };
  }
}

export const storage = new DatabaseStorage();
