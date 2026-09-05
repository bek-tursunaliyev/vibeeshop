import { Router } from 'express';
import { db } from '../db';
import { orders, orderItems, carts, cartItems, products, users } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { authenticateUser, requireAdmin, AuthRequest } from './middleware';

const router = Router();

// Yangi buyurtma yaratish (Checkout)
router.post('/', authenticateUser, async (req: AuthRequest, res): Promise<any> => {
  try {
    const { firstName, lastName, phone, address, note } = req.body;
    const userId = req.user!.id;

    // 1. Foydalanuvchining savatini va elementlarini olish
    const userCart = await db.query.carts.findFirst({ where: eq(carts.userId, userId) });
    if (!userCart) return res.status(400).json({ error: "Savat bo'sh" });
    
    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, userCart.id),
      with: { product: true }
    });
    
    if (items.length === 0) return res.status(400).json({ error: "Savat bo'sh" });

    // 2. Tranzaksiya orqali bazani yangilash
    await db.transaction(async (tx) => {
      let totalAmount = 0;
      
      // Stock tekshiruvi va umumiy narxni hisoblash
      for (const item of items) {
        if (!item.product.active || item.product.stock < item.quantity) {
          throw new Error(`"${item.product.name}" yetarli miqdorda mavjud emas yoki faol emas.`);
        }
        totalAmount += Number(item.product.price) * item.quantity;
      }

      // 3. Buyurtma yaratish
      const orderResult = await tx.insert(orders).values({
        userId,
        firstName,
        lastName,
        phone,
        address,
        note,
        totalAmount: totalAmount.toString(),
        status: 'pending'
      }).returning();
      
      const orderId = orderResult[0].id;

      // 4. Buyurtma elementlarini yaratish va stockni kamaytirish
      for (const item of items) {
        const subtotal = Number(item.product.price) * item.quantity;
        
        await tx.insert(orderItems).values({
          orderId,
          productId: item.productId,
          productNameSnapshot: item.product.name,
          priceSnapshot: item.product.price,
          quantity: item.quantity,
          subtotal: subtotal.toString()
        });

        // Stockni kamaytirish
        await tx.update(products)
          .set({ stock: item.product.stock - item.quantity })
          .where(eq(products.id, item.productId));
      }

      // 5. Savatni tozalash
      await tx.delete(cartItems).where(eq(cartItems.cartId, userCart.id));
    });

    res.status(201).json({ success: true, message: "Buyurtma qabul qilindi!" });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Buyurtma berishda xatolik" });
  }
});

// Foydalanuvchining o'z buyurtmalari
router.get('/my', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const myOrders = await db.query.orders.findMany({
      where: eq(orders.userId, req.user!.id),
      orderBy: [desc(orders.createdAt)],
      with: { items: true }
    });
    res.json(myOrders);
  } catch (error) {
    res.status(500).json({ error: "Buyurtmalarni yuklashda xatolik" });
  }
});

// Foydalanuvchi bitta buyurtmani ko'rishi
router.get('/my/:id', authenticateUser, async (req: AuthRequest, res): Promise<any> => {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, parseInt(req.params.id)),
      with: { items: true }
    });
    
    if (!order) return res.status(404).json({ error: "Buyurtma topilmadi" });
    if (order.userId !== req.user!.id) return res.status(403).json({ error: "Ruxsat yo'q" });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Buyurtmani yuklashda xatolik" });
  }
});

// --- ADMIN ROUTES ---

router.get('/admin', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const allOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      with: { 
        items: true,
        user: { columns: { telegramId: true, username: true } }
      }
    });
    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ error: "Buyurtmalarni yuklashda xatolik" });
  }
});

router.put('/admin/:id/status', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, parseInt(req.params.id)))
      .returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Statusni yangilashda xatolik" });
  }
});

router.get('/admin/dashboard', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const productsCount = await db.select({ count: sql<number>`count(*)` }).from(products);
    const ordersCount = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const usersCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    
    const pendingOrders = await db.select({ count: sql<number>`count(*)` })
      .from(orders).where(eq(orders.status, 'pending'));
      
    // Optional: revenue
    const revenueRows = await db.execute(sql`SELECT sum(total_amount) as sum FROM orders WHERE status = 'completed'`);
    const totalRevenue = revenueRows.rows[0].sum || 0;

    res.json({
      totalProducts: productsCount[0].count,
      totalOrders: ordersCount[0].count,
      totalUsers: usersCount[0].count,
      pendingOrders: pendingOrders[0].count,
      revenue: totalRevenue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Statistikani yuklashda xatolik" });
  }
});

router.get('/admin/users', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)]
    });
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: "Foydalanuvchilarni yuklashda xatolik" });
  }
});

export default router;
