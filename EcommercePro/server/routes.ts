import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import { z } from "zod";
import { setupAuth } from "./auth";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe secret key - using test mode');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51OTBEiEsIyETB70bBZOCb4u2XdNWBdWl1UXHsb81ZwY91KcGpLvHOQxCraCf5QRBT9Aw4rUUHKMQcA7LXN9OROqw00nGYyY5rL', {
  apiVersion: "2023-10-16" as any,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar rotas de autenticação
  setupAuth(app);
  // Get all products
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching products: ${error.message}` });
    }
  });

  // Get a product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching product: ${error.message}` });
    }
  });

  // Create a payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const schema = z.object({
        amount: z.number().min(0.01),
        items: z.array(z.object({
          id: z.number(),
          name: z.string(),
          price: z.number(),
          quantity: z.number().min(1)
        }))
      });

      const validation = schema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validation.error.errors 
        });
      }
      
      const { amount, items } = validation.data;
      
      // Create order in pending status first so we can get the order ID
      const order = await storage.createOrder({
        userId: req.isAuthenticated() ? req.user.id : null, // Usuário autenticado ou pedido anônimo
        amount: amount.toString(),
        status: "pending",
        paymentIntentId: null, // Will be updated after payment intent is created
        createdAt: new Date().toISOString()
      });
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          orderId: order.id.toString(),
          items: JSON.stringify(items.map(item => ({
            id: item.id,
            quantity: item.quantity
          })))
        }
      });
      
      // Update order with payment intent ID
      await storage.updateOrderStatus(order.id, "pending", paymentIntent.id);

      // Save order items
      for (const item of items) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price.toString()
        });
      }

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        orderId: order.id 
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: `Error creating payment intent: ${error.message}` 
      });
    }
  });

  // Handle Stripe webhook (for payment confirmation)
  app.post("/api/stripe-webhook", async (req, res) => {
    const payload = req.body;
    
    try {
      // In a real implementation, verify the webhook signature
      // const signature = req.headers['stripe-signature'];
      // const event = stripe.webhooks.constructEvent(payload, signature, WEBHOOK_SECRET);
      
      const event = payload;
      
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        // Este trecho foi modificado para funcionar com o banco de dados
        // Agora usamos uma consulta direta para encontrar a ordem pelo paymentIntentId
        const order = await storage.getOrderById(parseInt(paymentIntent.metadata.orderId || '0'));
        
        if (order) {
          await storage.updateOrderStatus(order.id, "completed", paymentIntent.id);
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ message: `Webhook Error: ${error.message}` });
    }
  });

  // Handle successful payment completion
  app.get("/api/order/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: `Error fetching order: ${error.message}` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
