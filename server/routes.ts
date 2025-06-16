import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertClientSchema, insertRoomSchema, 
  insertProductSchema, insertServiceSchema, insertReservationSchema,
  insertProductSaleSchema, insertServiceSaleSchema, insertInventoryMovementSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar estatísticas" });
    }
  });

  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar usuários" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar usuário" });
      }
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      
      const user = await storage.updateUser(id, userData);
      if (!user) {
        res.status(404).json({ message: "Usuário não encontrado" });
        return;
      }
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar usuário" });
      }
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        res.status(404).json({ message: "Usuário não encontrado" });
        return;
      }
      res.json({ message: "Usuário excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir usuário" });
    }
  });

  // Clients routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar clientes" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar cliente" });
      }
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData);
      if (!client) {
        res.status(404).json({ message: "Cliente não encontrado" });
        return;
      }
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar cliente" });
      }
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClient(id);
      if (!deleted) {
        res.status(404).json({ message: "Cliente não encontrado" });
        return;
      }
      res.json({ message: "Cliente excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir cliente" });
    }
  });

  // Rooms routes
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar quartos" });
    }
  });

  app.get("/api/rooms/available", async (req, res) => {
    try {
      const rooms = await storage.getAvailableRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar quartos disponíveis" });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(roomData);
      res.status(201).json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar quarto" });
      }
    }
  });

  app.put("/api/rooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const roomData = insertRoomSchema.partial().parse(req.body);
      const room = await storage.updateRoom(id, roomData);
      if (!room) {
        res.status(404).json({ message: "Quarto não encontrado" });
        return;
      }
      res.json(room);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar quarto" });
      }
    }
  });

  app.delete("/api/rooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRoom(id);
      if (!deleted) {
        res.status(404).json({ message: "Quarto não encontrado" });
        return;
      }
      res.json({ message: "Quarto excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir quarto" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar produtos" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar produto" });
      }
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      if (!product) {
        res.status(404).json({ message: "Produto não encontrado" });
        return;
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar produto" });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        res.status(404).json({ message: "Produto não encontrado" });
        return;
      }
      res.json({ message: "Produto excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir produto" });
    }
  });

  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar serviços" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar serviço" });
      }
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(id, serviceData);
      if (!service) {
        res.status(404).json({ message: "Serviço não encontrado" });
        return;
      }
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar serviço" });
      }
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteService(id);
      if (!deleted) {
        res.status(404).json({ message: "Serviço não encontrado" });
        return;
      }
      res.json({ message: "Serviço excluído com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir serviço" });
    }
  });

  // Reservations routes
  app.get("/api/reservations", async (req, res) => {
    try {
      const reservations = await storage.getReservations();
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar reservas" });
    }
  });

  app.get("/api/reservations/active", async (req, res) => {
    try {
      const reservations = await storage.getActiveReservations();
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar reservas ativas" });
    }
  });

  app.post("/api/reservations", async (req, res) => {
    try {
      const reservationData = insertReservationSchema.parse(req.body);
      
      // Validate check-in and check-out dates
      const checkInDate = new Date(reservationData.checkInDate);
      const checkOutDate = new Date(reservationData.expectedCheckOutDate);
      
      if (checkInDate >= checkOutDate) {
        res.status(400).json({ 
          message: "A data de check-in deve ser anterior à data de check-out" 
        });
        return;
      }

      // Check if room is available for the requested dates
      const existingReservations = await storage.getActiveReservations();
      const conflictingReservation = existingReservations.find(r => 
        r.roomId === reservationData.roomId &&
        r.status === "active" &&
        (
          (checkInDate >= new Date(r.checkInDate) && checkInDate < new Date(r.expectedCheckOutDate)) ||
          (checkOutDate > new Date(r.checkInDate) && checkOutDate <= new Date(r.expectedCheckOutDate)) ||
          (checkInDate <= new Date(r.checkInDate) && checkOutDate >= new Date(r.expectedCheckOutDate))
        )
      );

      if (conflictingReservation) {
        res.status(400).json({ 
          message: "O quarto já está reservado para este período" 
        });
        return;
      }

      const reservation = await storage.createReservation(reservationData);
      
      // Only update room status to occupied if check-in is today or in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkInDate <= today) {
        await storage.updateRoom(reservationData.roomId, { status: "occupied" });
      }
      
      res.status(201).json(reservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar reserva" });
      }
    }
  });

  app.put("/api/reservations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reservationData = insertReservationSchema.partial().parse(req.body);
      const reservation = await storage.updateReservation(id, reservationData);
      if (!reservation) {
        res.status(404).json({ message: "Reserva não encontrada" });
        return;
      }
      res.json(reservation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao atualizar reserva" });
      }
    }
  });

  // Product sales routes
  app.get("/api/product-sales", async (req, res) => {
    try {
      const reservationId = req.query.reservationId ? parseInt(req.query.reservationId as string) : undefined;
      const sales = await storage.getProductSales(reservationId);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar vendas de produtos" });
    }
  });

  app.post("/api/product-sales", async (req, res) => {
    try {
      const saleData = insertProductSaleSchema.parse(req.body);
      const sale = await storage.createProductSale(saleData);
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar venda de produto" });
      }
    }
  });

  app.delete("/api/product-sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProductSale(id);
      if (!deleted) {
        res.status(404).json({ message: "Venda não encontrada" });
        return;
      }
      res.json({ message: "Venda excluída com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir venda" });
    }
  });

  // Service sales routes
  app.get("/api/service-sales", async (req, res) => {
    try {
      const reservationId = req.query.reservationId ? parseInt(req.query.reservationId as string) : undefined;
      const sales = await storage.getServiceSales(reservationId);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar vendas de serviços" });
    }
  });

  app.post("/api/service-sales", async (req, res) => {
    try {
      const saleData = insertServiceSaleSchema.parse(req.body);
      const sale = await storage.createServiceSale(saleData);
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar venda de serviço" });
      }
    }
  });

  // Inventory routes
  app.get("/api/inventory-movements", async (req, res) => {
    try {
      const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
      const movements = await storage.getInventoryMovements(productId);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar movimentações de estoque" });
    }
  });

  app.post("/api/inventory-movements", async (req, res) => {
    try {
      const movementData = insertInventoryMovementSchema.parse(req.body);
      const movement = await storage.createInventoryMovement(movementData);
      res.status(201).json(movement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar movimentação de estoque" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
