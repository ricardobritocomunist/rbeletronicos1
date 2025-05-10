import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema, insertAddressSchema } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { z } from "zod";

const PostgresSessionStore = connectPg(session);
const sessionStore = new PostgresSessionStore({ 
  pool, 
  createTableIfMissing: true,
  tableName: 'user_sessions'
});

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "super-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em milissegundos
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registrar usuário
  app.post("/api/register", async (req, res, next) => {
    try {
      // Validar dados do usuário
      const userSchema = insertUserSchema
        .extend({
          confirmPassword: z.string()
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "As senhas não coincidem",
          path: ["confirmPassword"],
        });

      const validation = userSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Dados de usuário inválidos", 
          errors: validation.error.errors 
        });
      }

      // Verificar se usuário já existe
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      // Criar usuário
      const { confirmPassword, ...userData } = validation.data;
      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });

      // Processar endereço se fornecido
      if (req.body.address) {
        const addressValidation = insertAddressSchema.safeParse({
          ...req.body.address,
          userId: user.id
        });

        if (addressValidation.success) {
          await storage.createAddress(addressValidation.data);
        } else {
          console.warn("Endereço inválido fornecido durante o registro");
        }
      }

      // Login automático após registro
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error: any) {
      res.status(500).json({ message: `Erro ao registrar usuário: ${error.message}` });
    }
  });

  // Login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Obter usuário atual
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Obter endereço do usuário
  app.get("/api/user/address", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const address = await storage.getAddressByUserId(req.user.id);
      if (!address) {
        return res.status(404).json({ message: "Endereço não encontrado" });
      }
      res.json(address);
    } catch (error: any) {
      res.status(500).json({ message: `Erro ao obter endereço: ${error.message}` });
    }
  });

  // Atualizar endereço do usuário
  app.post("/api/user/address", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const addressValidation = insertAddressSchema.safeParse({
        ...req.body,
        userId: req.user.id
      });

      if (!addressValidation.success) {
        return res.status(400).json({ 
          message: "Dados de endereço inválidos", 
          errors: addressValidation.error.errors 
        });
      }

      // Verificar se o usuário já tem um endereço
      const existingAddress = await storage.getAddressByUserId(req.user.id);
      let address;

      if (existingAddress) {
        // Atualizar endereço existente
        address = await storage.updateAddress(existingAddress.id, addressValidation.data);
      } else {
        // Criar novo endereço
        address = await storage.createAddress(addressValidation.data);
      }

      res.json(address);
    } catch (error: any) {
      res.status(500).json({ message: `Erro ao atualizar endereço: ${error.message}` });
    }
  });

  // Obter histórico de pedidos do usuário
  app.get("/api/user/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const orders = await storage.getOrdersByUserId(req.user.id);
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await storage.getOrderItemsByOrderId(order.id);
        return { ...order, items };
      }));
      
      res.json(ordersWithItems);
    } catch (error: any) {
      res.status(500).json({ message: `Erro ao obter pedidos: ${error.message}` });
    }
  });

  // Atualizar dados do usuário
  app.put("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Excluir campos que não devem ser atualizados
      const { id, username, password, ...updateData } = req.body;
      
      // Validar dados de atualização
      const updateUserSchema = z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional()
      });

      const validation = updateUserSchema.safeParse(updateData);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Dados de usuário inválidos", 
          errors: validation.error.errors 
        });
      }

      // Atualizar usuário
      const updatedUser = await storage.updateUser(req.user.id, validation.data);
      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ message: `Erro ao atualizar usuário: ${error.message}` });
    }
  });
}