import { Product, InsertProduct, InsertOrder, Order, OrderItem, InsertOrderItem, User, InsertUser, users, products, orders, orderItems, Address, InsertAddress, addresses } from "@shared/schema";
import { db } from "./db";
import { eq, desc, isNull, and } from "drizzle-orm";

export interface IStorage {
  // Usuários
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Endereços
  createAddress(address: InsertAddress): Promise<Address>;
  getAddressById(id: number): Promise<Address | undefined>;
  getAddressByUserId(userId: number): Promise<Address | undefined>;
  updateAddress(id: number, addressData: Partial<Address>): Promise<Address>;
  updateAddressUserId(addressId: number, userId: number): Promise<Address>;
  
  // Produtos
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Pedidos
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  updateOrderStatus(id: number, status: string, paymentIntentId?: string): Promise<Order>;
  
  // Inicialização
  initializeData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Métodos de usuário
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
      
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }
  
  // Métodos de endereço
  async createAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db
      .insert(addresses)
      .values(address)
      .returning();
    return newAddress;
  }
  
  async getAddressById(id: number): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(eq(addresses.id, id));
    return address || undefined;
  }
  
  async getAddressByUserId(userId: number): Promise<Address | undefined> {
    const [address] = await db.select().from(addresses).where(eq(addresses.userId, userId));
    return address || undefined;
  }
  
  async updateAddress(id: number, addressData: Partial<Address>): Promise<Address> {
    const [updatedAddress] = await db
      .update(addresses)
      .set(addressData)
      .where(eq(addresses.id, id))
      .returning();
      
    if (!updatedAddress) {
      throw new Error(`Address with id ${id} not found`);
    }
    
    return updatedAddress;
  }
  
  async updateAddressUserId(addressId: number, userId: number): Promise<Address> {
    const [updatedAddress] = await db
      .update(addresses)
      .set({ userId })
      .where(eq(addresses.id, addressId))
      .returning();
      
    if (!updatedAddress) {
      throw new Error(`Address with id ${addressId} not found`);
    }
    
    return updatedAddress;
  }
  
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...order,
        userId: order.userId || null,
        paymentIntentId: order.paymentIntentId || null
      })
      .returning();
    return newOrder;
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return newOrderItem;
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }
  
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }
  
  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }
  
  async updateOrderStatus(id: number, status: string, paymentIntentId?: string): Promise<Order> {
    const updateData: Partial<Order> = { status };
    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }
    
    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
      
    if (!updatedOrder) {
      throw new Error(`Order with id ${id} not found`);
    }
    
    return updatedOrder;
  }
  
  async initializeData(): Promise<void> {
    // Check if we need to initialize products
    const productCount = await db.select().from(products);
    
    if (productCount.length === 0) {
      console.log("Initializing product data...");
      
      const initialProducts: InsertProduct[] = [
        {
          name: "Premium Smartphone X5",
          price: "899.99",
          image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
          shortDescription: "Latest model with 8GB RAM, 128GB storage and triple camera system.",
          category: "smartphones"
        },
        {
          name: "Wireless Headphones Pro",
          price: "249.99",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
          shortDescription: "Noise cancelling wireless headphones with 30-hour battery life.",
          category: "audio"
        },
        {
          name: "Smart Watch Plus",
          price: "179.99",
          image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
          shortDescription: "Fitness tracking, heart rate monitor, and 5-day battery life.",
          category: "wearables"
        },
        {
          name: "Ultrabook Pro 15\"",
          price: "1299.99",
          image: "https://images.unsplash.com/photo-1593642702909-dec73df255d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
          shortDescription: "Intel i7, 16GB RAM, 512GB SSD, ultra-thin design.",
          category: "laptops"
        },
        {
          name: "Portable Bluetooth Speaker",
          price: "89.99",
          image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
          shortDescription: "Waterproof, 20-hour playtime, with deep bass technology.",
          category: "audio"
        },
        {
          name: "Gaming Console X Series",
          price: "499.99",
          image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
          shortDescription: "Next-gen gaming with 4K support, 1TB SSD, and wireless controller.",
          category: "gaming"
        },
        {
          name: "Premium Tablet Pro",
          price: "649.99",
          image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
          shortDescription: "10.5\" display, 256GB storage, with stylus compatibility.",
          category: "tablets"
        },
        {
          name: "Wireless Earbuds Pro",
          price: "129.99",
          image: "https://images.unsplash.com/photo-1590658268037-c4c597589f1c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
          shortDescription: "Noise isolation, 24h battery life with charging case, sweat resistant.",
          category: "audio"
        }
      ];
      
      for (const product of initialProducts) {
        await this.createProduct(product);
      }
      
      console.log("Product data initialized successfully.");
    }
  }
}

export const storage = new DatabaseStorage();
